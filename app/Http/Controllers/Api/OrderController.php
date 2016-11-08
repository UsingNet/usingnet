<?php

namespace App\Http\Controllers\Api;

use DB;
use App\Library\ParseSource;
use App\Models\Contact;
use App\Models\CustomerManage;
use App\Models\Track;
use App\Services\Messanger;
use App\Services\Voip;
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

        $sort = $request->get('sort') ?: 'desc';

        $handler = Order::with(['contact' => function ($q) {
                $q->with('tags')->with('wechat');
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
        $self = $user->toArray();
        $redis = Redis::connection();

        foreach ($orders as $order) {
            $contact = $order->contact;
            $remote = [$contact->token];
            $token_cache_key = $contact->token . ':' . json_encode($local) . ':' . $order->id . ':'. $user->token;
            $order->token = $redis->get($token_cache_key);
            if(!$order->token){
                $order->token = Messanger::generateToken('IM', $remote, $local, $self, $order->id);
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

    /**
     * 创建工
     * @param  $request
     * @return json
     */
    public function store(Request $request)
    {
        if ($messageId = $request->get('message_id')) {
            $message = Message::where('_id', $messageId)->first();
            $user = $request->user();
            if (!$message) {
                return $this->responseJsonError('消息不存在', 404);
            }
            if (!isset($message['package']['contact'])) {
                $contact = Contact::where('track_id', $message->from)
                    ->orWhere('phone', $message->from)
                    ->orWhere('email', $message->from)
                    ->first();
                if (!$contact) {
                    return $this->responseJsonError('联系人不存在', 403);
                }

                $message->update(['package' => [
                    'team_id' => $user->team_id,
                    'contact' => [
                        'id' => $contact->id,
                        'name' => $contact->name,
                        'img' => $contact->img
                    ]
                ]]);
                $message = Message::where('_id', $messageId)->first();
            }

            if (!isset($message['package']['order_id'])) {
                return $this->responseJsonError('工单不存在', 403);
            }

            \DB::beginTransaction();
            try {
                $order = \DB::table('order')->where(['team_id' => $user->team_id, 'id' => $message['package']['order_id']])
                    ->whereIn('status', [Order::STATUS_OPEN, Order::STATUS_SLEEP])
                    ->lockForUpdate()
                    ->first();
                if (!$order) {
                    $order = Order::create([
                        'from' => $message->to,
                        'to' => $message->from,
                        'type' => $message->type,
                        'contact_id' => $message->package['contact']['id'],
                        'team_id' => $user->team_id,
                        'user_id' => $user->id,
                        'status' => Order::STATUS_OPEN
                    ]);

                    $message->update(['package' => array_merge($message->package, ['order_id' => $order->id])]);
                }
                if ($order->user_id != 0) {
                    if ($order->status === Order::STATUS_OPEN && $order->user_id != $user->id) {
                        DB::table('order')->where('id', $order->id)
                            ->update(['user_id' => $user->id]);
                        //return $this->responseJsonError(sprintf('工单 %s 被接走了', $order->user_name), 403);
                    }
                    if ($order->status === Order::STATUS_SLEEP && $order->user_id != $request->user()->id) {
                        $user = User::find($order->user_id);
                        Messanger::system([
                            'from' => $order->to,
                            'to' => $order->from,
                            'direction' => Message::DIRECTION_RECEIVE,
                            'package' => ['order_id' => $order->id, 'team_id' => $request->user()->team_id],
                            'body' => sprintf('%s %s 已离线，工单被自动转发给 %s', $user->role_name, $user->name, $request->user()->name),
                        ]);
                    }
                }
                \DB::table('order')->where('id', $order->id)->update(['user_id' => $request->user()->id, 'status' => Order::STATUS_OPEN]);
                \DB::commit();
            } catch (\Exception $e) {
                \DB::rollback();
                return $this->responseJsonError($e->getMessage(), 403);
            }

            $order = Order::with('contact')->where('id', $order->id)->first();
        } else {
            // 发起对话
            $contactId = $request->get('contact_id');
            $contact = Contact::where(['team_id' => $request->user()->team_id, 'id' => $contactId])->first();
            $type = $request->get('type', Message::TYPE_IM);
            if (!$contact) {
                return $this->responseJsonError('联系人不存在', 404);
            }

            $order = Order::where('contact_id', $contactId)
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

            if ($type === Message::TYPE_WECHAT && !$contact->track_id) {
                $contact->update(['track_id' => new \MongoDB\BSON\ObjectID()]);
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

            \Log::info($type);

            if (!isset($toTypes[$type])) {
                return $this->responseJsonError('类型非法', 403);
            }

            if (!$order) {
                $order = Order::create([
                    'contact_id' => $contactId,
                    'type' => $type,
                    'user_id' => $request->user()->id,
                    'from' => $fromTypes[$type],
                    'to' => $toTypes[$type],
                    'status' => Order::STATUS_OPEN,
                    'team_id' => $request->user()->team_id,
                    'direction' => Order::DIRECTION_AGENT
                ]);
            } else {
                $order->update([
                    'status' => Order::STATUS_OPEN,
                    'user_id' => $request->user()->id
                ]);
            }

            Messanger::system([
                'direction' => Message::DIRECTION_RECEIVE,
                'from' => $team->token,
                'to' => $contact->token,
                'body' => sprintf('%s %s 发起对话', $order->user->role_name, $order->user->name),
                'package' => [
                    'order_id' => $order->id,
                    'team_id' => $team->id
                ]
            ]);
        }

        return $this->responseJson($order);
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

        Messanger::system([
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

        Messanger::system([
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
        Messanger::system([
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
        $order = Order::where(['team_id' => $request->user()->team_id, 'id' => $request->get('id')])->first();
        $type = $request->get('type');
        $userId = $request->get('user_id');
        if (!$order) {
            return $this->responseJsonError('工单不存在', 403);
        }
        $user = User::find($request->get('user_id'));
        if (!$user) {
            return $this->responseJsonError('目标用户不存在', 404);
        }
        $data= [
            'from' => $order->contact->token,
            'to' => $user->token,
            'package' => [
                'order_id' => $order->id,
                'team_id' => $order->team_id
            ],
            'notice' => ['type' => 'order'],
            'direction' => Message::DIRECTION_RECEIVE,
            'body' => sprintf('%s 转发工单到 %s', $request->user()->name, $user->name)
        ];

        $order->update([
            'user_id' => $userId,
            'type' => $type
        ]);

        Messanger::system($data);
        $message = Message::where('package.order_id', $order->id)
            ->orderBy('_id', 'desc')
            ->where('package.callid', 'exists', true)
            ->first();

        if ($message && $type === Message::TYPE_VOIP) {
            $voip = new Voip;
            $voip->shift($message->package['callid'], $userId);
        }

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
