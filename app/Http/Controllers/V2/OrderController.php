<?php

namespace App\Http\Controllers\V2;

use App\Library\ParseSource;
use App\Models\Contact;
use App\Models\CustomerManage;
use App\Models\Track;
use DB;
use App\Services\Messenger;
use Validator;
use App\Models\Order;
use App\Models\User;
use App\Models\Message;
use Illuminate\Http\Request;
use App\Models\OrderCategory;
use App\Http\Controllers\Controller;
use Redis;

class OrderController extends Controller
{
    /**
     * 工单列表
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // 没有 user_id 的工单 全部归到第一个上线的客服
        $orders = Order::where('team_id', $user->team_id)
            ->where('user_id', 0)
            ->where('status', Order::STATUS_OPEN)
            ->get();
        foreach ($orders as $order) {
            $order->update(['user_id' => $user->id]);
            Message::where('package.order_id', intval($order->id))
                ->update(['package.agent' => array_only($user->toArray(), ['id', 'name', 'img'])]);
        }


        $sort = $request->get('sort') ?: 'desc';
        $handler = Order::with(['contact' => function ($q) {
                $q->with('tags');
            }])
            ->with('user')
            ->with('category')
            ->orderBy('id', $sort);

        if ($request->get('timing')) {
            $handler->where('status', Order::STATUS_TIMING);
        } else if ($request->getHost() === \Config::get('app.domain') || $request->getHost() === \Config::get('home.domain')) {
            $handler->where('status', Order::STATUS_OPEN);
        } else {
            $handler->whereIn('status', [Order::STATUS_OPEN, Order::STATUS_SLEEP]);
        }

        $orders = $handler->where('user_id', $request->user()->id)->get();
        $user = $request->user();
        $local = [$user->team->token, $user->token];
        if (!empty($user->team->mail->email)) {
            $local[] = $user->team->mail->email;
        }
        if (!empty($user->team->voip->number)) {
            $local[] = $user->team->voip->number;
        }

        $local = array_values($local);
        $redis = Redis::connection();
        $unreadMessages = Message::whereIn('package.order_id', $orders->lists('id')->toArray())
            ->where('package.read', 'exists', false)
            ->get();

        foreach ($orders as $order) {
            $contact = $order->contact;
            $token_cache_key = $contact->token . ':' . json_encode($local) . ':' . $order->id . ':'. $user->token;
            $order->token = $redis->get($token_cache_key);
            if(!$order->token){
                $redis->setex($token_cache_key, 600, $order->token);
            }

            $sourceKey = 'usingnet:contact:source:' . $contact->token;
            $order->contact->source = @json_decode($redis->get($sourceKey));
            if (!$order->contact->source) {
                $order->contact->source = (new ParseSource($contact, $order->type))->toArray();
                $redis->setex($sourceKey, 600, json_encode($order->contact->source));
            }

            $key = sprintf('%s%s', Order::LAST_REPLIED, $order->id);

            if ($lastReplied = $redis->get($key)) {
                $order->last_replied = $lastReplied;
            } else {
                $time = time();
                $redis->set($key, $time);
                $order->last_replied  = $time;
            }

            $order->unread = 0;
            foreach($unreadMessages as $message) {
                 if ($message->package['order_id'] == $order->id) {
                     $order->unread++;
                 }
            }
        }

        // 以最后回复时间排序
        $orders = $orders->toArray();
        usort($orders, function ($a, $b) {
            if ($a['last_replied'] == $b['last_replied']) {
                return 0;
            }

            return $a['last_replied'] > $b['last_replied'] ? -1 : 1;
        });

        return $this->responseJson(['data' => $orders]);
    }


    public function show(Request $request, $id)
    {
        $order = Order::where(['id' => $id])
            ->with('category')
            ->with('contact')
            ->with('user');

        if ($request->user()->team_id != env('MANAGE_TEAM_ID')) {
            $order->where('team_id', $request->user()->team_id);
        }

        $order = $order->first();
        if (!$order) {
            return $this->responseJsonError('工单不存在', 403);
        }

        return $this->responseJson($order);
    }

    /**
     * 工单分类
     * @param Request $request
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function getCategory(Request $request)
    {
        $categories = OrderCategory::where('team_id', $request->user()->team_id)->distinct('title')->groupBy('title')->get();

        return $this->responseJson($categories);
    }

    /**
     * 工单历史
     */
    public function getHistory(Request $request)
    {
        $handle = Order::where('status', Order::STATUS_CLOSED)
            ->with(['user', 'contact'])
            ->orderBy('id', 'desc');

        if (CustomerManage::isManager($request->user()->team_id)) {
            $handle->whereIn('team_id', CustomerManage::getCustomerIds());
        } else {
            $handle->where('team_id', $request->user()->team_id) ;
        }

        if ($request->user()->role == User::ROLE_MEMBER) {
            $handle->where('user_id', $request->user()->id);
        }

        if ($agentId = $request->get('agent_id')) {
            $handle->where('user_id', $agentId);
        }

        return $this->listToPage($handle, function ($orders) {
            foreach ($orders as $order) {
                $order->time = format_time($order->time);
            }
        });
    }

    /**
     * 转发工单
     * @param  $request
     * @param  int  $id
     * @return json
     */
    public function update(Request $request, $id)
    {
        $orderModel = Order::where(['id' => $id])
            ->with('contact')
            ->with('user');

        if (!CustomerManage::isManager($request->user()->team_id)) {
            $orderModel->where('team_id', $request->user()->team_id);
        }

        $orderModel = $orderModel->first();
        if(!$orderModel){
            return $this->responseJsonError('工单不存在', 404);
        }

        // 修改分类
        if ($category = $request->get('category')) {
            $category = OrderCategory::firstOrCreate([
                'title' => trim($category),
                'team_id' => $request->user()->team_id
            ]);
            $category->increment('order_count');
            $orderModel->update(['category_id' => $category->id]);
            $orderModel->category = $category;
        } else {
            $data = $request->all();
            $orderModel->fill($data);
            $orderModel->save();
        }

        return $this->responseJson($orderModel);
    }

    /**
     * 恢复对话
     */
    public function postRestore(Request $request)
    {
        $order = Order::where(['team_id' => $request->user()->team_id, 'id' => $request->get('id')])
            ->whereIn('status', [Order::STATUS_CLOSED, Order::STATUS_SLEEP])
            ->first();
        if (!$order) {
            return $this->responseJsonError('工单不存在', 403);
        }

        $exists = Order::where('contact_id', $order->contact_id)
            ->whereIn('status', [Order::STATUS_OPEN, Order::STATUS_SLEEP])
            ->first();
        if ($exists) {
            if ($exists->status === Order::STATUS_OPEN) {
                return $this->responseJsonError(sprintf('%s %s 正在和客户对话中', $order->user->role_name, $order->user->name), 403);
            } else {
                $exists->status = Order::STATUS_CLOSED;
                $exists->save();
            }
        }

        $order->status = Order::STATUS_OPEN;
        $order->user_id = $request->user()->id;
        $order->save();

        Messenger::system([
            'from' => $order->contact->token,
            'to' => $order->team->token,
            'direction' => Message::DIRECTION_RECEIVE,
            'body' => sprintf('%s %s 恢复了对话', $order->user->role_name, $order->user->name),
            'package' => [
                'team_id' => $request->user()->team_id,
                'order_id' => $order->id
            ]
        ]);

        return $this->responseJson($order);
    }

    /**
     * 发起对话
     */
    public function postLaunch(Request $request)
    {
        $type = $request->get('type', Message::TYPE_IM);
        $team = $request->user()->team;
        $contact = null;
        if (empty($request->get('contact_id')) && empty($request->get('track_id'))) {
            return $this->responseJsonError('缺少参数', 403);
        }

        if ($contactId = $request->get('contact_id')) {
            $contact = Contact::where(['team_id' => $team->id, 'id' => $contactId])->first();
        }

        if ($trackId = $request->get('track_id')) {
            $contact = Contact::where(['team_id' => $team->id, 'track_id' => $trackId])
                ->orderBy('id', 'desc')
                ->first();
            if (!$contact) {
                $track = Track::where(['team_id' => $team->id, 'track_id' => $trackId])->orderBy('_id', 'desc')->first();
                if ($track) {
                    $params = [
                        'ip' => $track->ip,
                        'track_id' => $trackId
                    ];
                    $contact = Contact::firstOrCreate($params, $team);
                }
            }
        }

        if (!$contact) {
            return $this->responseJsonError('联系人不存在', 403);
        }

        $order = Order::where('contact_id', $contact->id)
            ->whereIn('status', [Order::STATUS_OPEN, Order::STATUS_SLEEP])
            ->first();

        if ($order) {
            if ($order->status === Order::STATUS_OPEN && $order->user) {
                return $this->responseJsonError(sprintf('%s %s 正在和客户对话中', $order->user->role_name, $order->user->name), 403);
            } else {
                $order->status = Order::STATUS_CLOSED;
                $order->save();
            }
        }

        $toTypes = [
            'MAIL' => $contact->email,
            'IM' => $contact->track_id,
            'WECHAT' => $contact->openid,
            'VOICE' => $contact->phone
        ];

        $team = $request->user()->team;
        $wechat = $team->wechat->first();
        $fromTypes = [
            'MAIL' => $team->mail->email,
            'IM' => $team->token,
            'WECHAT' => $wechat ? $wechat->app_id : '',
            'VOICE' => $team->voip->number
        ];

        if (!isset($toTypes[$type])) {
            return $this->responseJsonError('类型非法', 403);
        }

        if (!$order) {
            $order = Order::create([
                'contact_id' => $contact->id,
                'type' => $type,
                'user_id' => $request->user()->id,
                'from' => $fromTypes[$type],
                'to' => $toTypes[$type],
                'status' => Order::STATUS_OPEN,
                'team_id' => $request->user()->team_id,
                'direction' => Order::DIRECTION_AGENT,
            ]);
        }

        $order->update([
            'status' => Order::STATUS_OPEN,
            'user_id' => $request->user()->id
        ]);

        Messenger::system([
            'direction' => Message::DIRECTION_RECEIVE,
            'from' => $team->token,
            'to' => $contact->token,
            'body' => sprintf('%s %s 发起对话', $order->user->role_name, $order->user->name),
            'package' => [
                'order_id' => $order->id,
                'team_id' => $team->id
            ]
        ]);

        // 通知前端发起对话
        Messenger::system([
            'from' => $order->team->token,
            'to' => $order->contact->track_id,
            'direction' => Message::DIRECTION_SEND,
            'body' => '客服邀请您进入对话',
            'package' => [
                'team_id' => $order->team_id,
                'order_id' => $order->id,
                'action' => 'invite'
            ]
        ]);

        return $this->responseJson($order);
    }

    /**
     * 转接工单
     */
    public function postShift(Request $request)
    {
        $order = Order::where(['team_id' => $request->user()->team_id, 'id' => $request->get('order_id')])->first();
        $userId = $request->get('user_id');
        if (!$order) {
            return $this->responseJsonError('工单不存在', 403);
        }
        $user = User::find($request->get('user_id'));
        if (!$user) {
            return $this->responseJsonError('目标用户不存在', 404);
        }
        $data = [
            'from' => $order->contact->token,
            'to' => $user->token,
            'package' => [
                'order_id' => $order->id,
                'team_id' => $order->team_id,
                'contact' => array_only($order->contact->toArray(), ['id', 'name', 'img'])
            ],
            'notice' => ['type' => 'order'],
            'direction' => Message::DIRECTION_RECEIVE,
            'body' => sprintf('%s 转发工单到 %s', $request->user()->name, $user->name)
        ];

        $order->update([
            'user_id' => $userId
        ]);

        Messenger::system($data);

        return $this->responseJson($order);
    }

    /**
     * 定时工单列表
     * @param $request
     */
    public function getTiming(Request $request)
    {
        $orders = Order::where(['user_id' => $request->user()->id, 'status' => Order::STATUS_TIMING])
                ->with(['contact' => function ($q) {
                    $q->with('tags');
                }])
                ->get();

        return $this->responseJson(['data' => $orders]);

    }

    /**
     * 定时工单
     * @param $request
     * @param $id
     * @return json
     */
    public function postTiming(Request $request)
    {
        $data = $request->only('id', 'remark');
        $order = Order::find($data['id']);
        if (!$order) {
            return $this->responseJsonError('工单不存在', 403);
        }

        if (Order::where(['status' => Order::STATUS_TIMING, 'user_id' => $request->user()->id])->count() >= 20) {
            return $this->responseJsonError('延迟的工单不能到过　20 个', 403);
        }

        $order->status = Order::STATUS_TIMING;
        $order->remark = $data['remark'];

        $order->save();

        return $this->responseJson($order);
    }

    /**
     * 关闭工单
     * @param Request $request
     * @param $id
     * @return mixed
     */
    public function destroy(Request $request, $id)
    {
        $orderModel = Order::where(['user_id' => $request->user()->id, 'id' => $id])->first();
        if(!$orderModel){
            return $this->responseJsonError('工单不存在', 404);
        }

        if ($category = $request->get('category')) {
            $category = OrderCategory::firstOrCreate([
                'title' => trim($category),
                'team_id' => $request->user()->team_id
            ]);
        } else {
            $category = OrderCategory::firstOrCreate([
                'title' => '未分类',
                'team_id' => $request->user()->team_id
            ]);
        }

        $category->increment('order_count');
        $orderModel->category_id = $category->id;
        $orderModel->status = Order::STATUS_CLOSED;
        $orderModel->save();

        return $this->responseJson($orderModel);
    }
}
