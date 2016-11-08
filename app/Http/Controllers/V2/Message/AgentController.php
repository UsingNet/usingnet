<?php

namespace App\Http\Controllers\V2\Message;

use App\Models\CustomerManage;
use App\Models\Media;
use App\Models\Setting\Sms;
use App\Models\User;
use Validator;
use App\Services\Messanger;
use App\Models\Setting\Mail;
use App\Models\Message;
use App\Models\Team;
use App\Models\Order;
use App\Models\Contact;
use App\Models\Setting\AutoReply;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class AgentController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * 客服获取 token
     * @param Request $request
     * @return mixed
     */
    public function getIndex(Request $request)
    {
        $user = User::where('id', $request->user()->id)->with('tags')->with('team')->first();
        $team = $request->user()->team;
        $data = $request->only('type', 'remote');
        $data['direction'] = Message::DIRECTION_RECEIVE;

        $onlineAgents = array_filter(agent_online($team->id), function($agent) use ($user) {
            return $agent['id'] != $user->id;
        });
        $onlineCount = count($onlineAgents);
        if ($onlineCount == $team->plan->agent_num) {
            return $this->responseJsonError('当前在线座席人数已超过套餐限额', 410);
        }

        $orders = Order::where('user_id', 0)
            ->where('team_id', $user->team_id)
            ->whereIn('status', [Order::STATUS_OPEN, Order::STATUS_SLEEP])
            ->get();

        if (!$orders->isEmpty()) {
            Order::where('user_id', 0)
                ->where('team_id', $user->team_id)
                ->whereIn('status', [Order::STATUS_OPEN, Order::STATUS_SLEEP])
                ->update(['user_id' => $user->id]);

            $orderIds = $orders->lists('id')->toArray();
            $agent = array_only($user->toArray(), ['id', 'img', 'name']);
            Message::whereIn('package.order_id', $orderIds)
                ->where('package.agent', 'exists', false)
                ->update(['package.agent' => $agent]);
        }

        $validator = Validator::make($data, [
            'type' => 'required|in:' . implode(',', [Message::TYPE_LISTENER, Message::TYPE_SMS,
                    Message::TYPE_IM, Message::TYPE_WECHAT, Message::TYPE_SMS]),
        ], [
            'type.required' => '类型不能为空',
            'type.in' => '类型不合法'
        ]);

        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        // 将休眠的工单恢复状态
        if ($data['type'] === Message::TYPE_LISTENER) {
            Order::where(['user_id' => $user->id, 'status' => Order::STATUS_SLEEP])
                ->update(['status' => Order::STATUS_OPEN]);
            Team::clearTeamInfoCache($team);
        }

        $remote = [$data['remote']];
        $self = $user->toArray();
        $local = [$user->team->token, $user->token];
        $local = array_values($local);

        if (!empty($user->team->mail->email)) {
            $local[] = $user->team->mail->email;
        }

        if (!empty($user->team->voip->number)) {
            $local[] = $user->team->voip->number;
        }

        $order = Order::where(['status' => Order::STATUS_OPEN, 'to' => $data['remote']])
            ->where('user_id', $user->id)
            ->first();
        if ($order) {
            $remote = [$order->to, $order->contact->token];
        }

        if ($user->team->wechat) {
            $local = array_merge($local, $user->team->wechat->lists('app_id')->toArray());
        }

        if ($data['remote'] === Message::TYPE_SYSTEM) {
            $local = [$user->token];
        }

        try {
            $token = Messanger::generateToken($data['type'], $remote, $local, $self);
        } catch (\Exception $e) {
            return $this->responseJsonError($e->getMessage(), 403);
        }

        return $this->responseJson($token);
    }

    /**
     * 客服发送消息
     * @param Request $request
     * @return mixed
     */
    public function postIndex(Request $request)
    {
        $user = $request->user();
        $team = $request->user()->team;
        $data = $request->only('to', 'body', 'type', 'title');
        $data['direction'] = Message::DIRECTION_SEND;

        $validator = Validator::make($data, [
            'body' => 'required',
            'to' => 'required|exists:contact,id',
            'type' => 'required|in:' . implode(',', [Message::TYPE_IM, Message::TYPE_WECHAT,
                    Message::TYPE_SMS, Message::TYPE_MAIL, Message::TYPE_NOTE, Message::TYPE_SYSTEM, Message::TYPE_WEIBO])
        ], [
            'body.required' => '消息不能为空',
            'to.required' => '联系人不能为空',
            'to.exists' => '联系人已被删除，请刷新页面',
            'type.required' => '类型不能为空',
            'type.in' => '类型不合法'
        ]);

        $length = mb_strlen($data['body']);
        if ($data['type'] === Message::TYPE_IM && $length > 500 && !preg_match('/data-wikiId/', $data['body'])) {
            return $this->responseJsonError('消息不能大于 500 个字', 403);
        }

        // 替换 wiki 链接为新窗口打开
        if (preg_match('/data-wikiId/', $data['body'])) {
            $data['body'] = preg_replace('/<a/', '<a target="_blank"', $data['body']);
        } else {
            $data['body'] = htmlentities($data['body']);
        }

        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        if ($data['type'] === Message::TYPE_MAIL && $team->mail->status !== Mail::STATUS_SUCCESS) {
            return $this->responseJsonError('请先接入邮箱', 403);
        }

        $contact = Contact::where('id', $data['to'])->first();
        if ($contact->team_id != $request->user()->team_id && !CustomerManage::isManager($request->user()->team_id)) {
            return $this->responseJsonError('联系人不存在', 403);
        }

        if (!$contact) {
            return $this->responseJsonError('联系人已被删除', 403);
        }

        $order = Order::where(['user_id' => $user->id, 'contact_id' => $contact->id])
            ->whereIn('status', [Order::STATUS_OPEN, Order::STATUS_SLEEP])
            ->first();
        if (!$order) {
            return $this->responseJsonError('工单已删除，请刷新页面', 403);
        }

        if ($order->from === $order->to) {
            return $this->responseJsonError(sprintf('%s 信息重复', $data['type']), 403);
        }

        if (!$order->replied) {
            $order->update(['replied' => true]);
        }

        $message = [
            'from' => $team->token,
            'to' => $contact->token,
            'body' => $data['body'],
            'direction' => Message::DIRECTION_SEND,
            'package' => [
                'team_id' => $team->id,
                'order_id' => $order->id,
                'agent' => array_only($order->user->toArray(), ['id', 'name', 'img'])
            ]
        ];

        if ($data['type'] === Message::TYPE_WECHAT && $contact->unsubscribed) {
            return $this->responseJsonError('客户已取消订阅, 不能发送消息', 403);
        }

        if ($data['type'] === Message::TYPE_MAIL) {
            $message['package']['subject'] = $data['title'];
        }

        if ($data['type'] == Message::TYPE_SMS) {
            if ($team->sms->status != Sms::STATUS_SUCCESS) {
                return $this->responseJsonError('短信签名未审核', 403);
            }
            $media = Media::where(['team_id' => $team->id, 'content' => $data['body']])->first();
            if (!$media) {
                return $this->responseJsonError('短信模板不存在', 403);
            }
            $message['package']['remark'] = $media->remark;
            $message['body'] = sprintf('【%s】%s', $team->sms->signature, $data['body']);
        }

        // 自动回复
        if ($request->get('timeout')) {
            $autoReply = AutoReply::where('team_id', $request->user()->team_id)->first();
            if (isset($autoReply->timeout['status']) && $autoReply->timeout['status'] === AutoReply::STATUS_OPEN) {
                $data['body'] = $autoReply->timeout['message'];
                $data['package']['autoreply'] = 1;
            }
        }

        $method = strtolower($data['type']);
        if (!method_exists('\App\Services\Messanger', $method)) {
            return $this->responseJsonError('方法不存在', 404);
        }

        try {
            $response = Messanger::$method($message, $team, $contact);
        } catch (\Exception $e) {
            return $this->responseJsonError($e->getMessage(), 403);
        }

        return $this->responseJson($response);
    }
}
