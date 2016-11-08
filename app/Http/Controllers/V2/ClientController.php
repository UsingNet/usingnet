<?php

namespace App\Http\Controllers\V2;

use App\Http\Controllers\Controller;
use App\Models\Evaluation;
use App\Models\Message;
use App\Models\Order;
use App\Models\Team;
use App\Models\User;
use App\Services\AgentAction;
use App\Services\Socket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Setting\Web;
use App\Models\Contact;
use App\Models\CustomerManage;
use App\Services\Messenger;
use App\Models\Group;

class ClientController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth', ['only' => 'getOnline']);
    }

    /**
     * 团队信息
     * @param Request $request
     * @return mixed
     */
    public function getInfo(Request $request)
    {
        $data = $request->only('from', 'to', 'user_info', 'href', 'title');
        $validator = Validator::make($data, [
            'from' => 'required',
        ], [
            'from.required' => 'from 不能为空',
        ]);

        $team = Team::where('token', $data['to'])->first();
        if (!$team){
            $web = Web::find($data['to']);
            if ($web) {
                $team = Team::find($web->team_id);
            }
        } else {
            $web = Web::where('team_id', $team->id)->first();
        }

        if (!$team) {
            return $this->responseJsonError('客服团队不存在', 404);
        }

        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        $params = [
            'track_id' => $data['from']
        ];

        $userInfo = [];
        if (!empty($data['user_info'])) {
            $userInfo = @json_decode(urldecode($data['user_info']), true);
            if (isset($userInfo['extend_id'])) {
                $params['extend_id'] = $userInfo['extend_id'];
            }
        }

        if (is_array($userInfo)) {
            $userInfo['web_id'] = $web->id;
        } else {
            $userInfo = ['web_id' => $web->id];
        }

        $userInfo['web_id'] = $web->id;
        $contact = Contact::firstOrCreate($params, $team);
        $contact->package = [
            'title' => $data['title'],
            'referrer' => $data['href'],
            'ip' => $request->ip(),
            'user_agent' => isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : ''
        ];

        $contact->save();

        $socket = new Socket;
        $contact = $contact->toArray();
        $contact['team_token'] = $team->token;
        $contact['direction'] = 'client';
        $token = $socket->generate($contact);
        $onlines = $socket->agents($team->token);

        $web->plan = $team->plan->price !== 0;
        $resp = [
            'web' => $web,
            'token' => $token,
            'online' => count($onlines),
            'group' => Group::where('team_id', $team->id)->get(),
            'contact_id' => $contact['id']
        ];

        return $this->responseJson($resp);
    }

    /**
     * 获取对话消息
     * @param Request $request
     * @param $trackId
     * @return mixed
     */
    public function getStart(Request $request)
    {
        $req = $request->only('contact_id', 'group_id', 'user_info', 'web_id');
        $contact = Contact::where('id', $req['contact_id'])->first();
        if (!$contact) {
            return $this->responseJsonError('联系人不存在', 403);
        }

        $team = Team::where('id', $contact->team_id)->first();
        $order = Order::where('contact_id', $contact->id)
                ->where('status', Order::STATUS_OPEN)
                ->orderBy('id', 'desc')
                ->first();

        if (!$order) {
            $setting = Web::where('id', $req['web_id'])->first();
            $order = Order::createOrder($contact, $team, Message::TYPE_IM, $setting, $req['user_info'], $req['group_id']);
        }

        $messages = Message::where('package.order_id', intval($order->id))
            ->where(function($q) {
                $q->where('direction', '<>', Message::DIRECTION_RECEIVE)
                    ->orWhere('type', '<>', Message::TYPE_SYSTEM);
            })
            ->take(100)
            ->get();

        foreach ($messages as $message) {
            $message->created_at = strval($message->created_at);
        }

        return $this->responseJson(['data' => $messages]);
    }

    /**
     * 标记为已读
     */
    public function getRead(Request $request)
    {
        $from = $request->get('from');
        $contact = Contact::where('track_id', $from)->first();
        if ($contact) {
            $order = Order::where('contact_id', $contact->id)->where('status', Order::STATUS_OPEN)->first();
            if ($order) {
                Message::where('package.order_id', intval($order->id))->update(['package.read' => true]);
            }
        }
    }

    /**
     * 在线客服
     * @param Request $request
     * @return mixed
     */
    public function getOnline(Request $request)
    {
        $team = $request->user()->team;
        $socket = new Socket;
        $clients = $socket->clients($team->token);
        $contacts = [];
        if (!empty($clients)) {
            $contacts = Contact::where('team_id', intval($team->id))
                ->whereIn('id', $clients)
                ->get();
        }

        foreach ($contacts as $contact) {
            $contact->status = Order::where('status', Order::STATUS_OPEN)
                ->where('contact_id', $contact->id)
                ->first() ? Contact::STATUS_CHATTING : Contact::STATUS_VISITING;
        }

        return $this->responseJson(['data' => $contacts]);
    }

    /**
     * 发送消息
     * @param Request $request
     * @return mixed
     */
    public function postSend(Request $request)
    {
        $data = $request->only('from', 'to', 'body', 'user_info', 'title', 'group_id');
        $data['direction'] = Message::DIRECTION_RECEIVE;
        $validator = Validator::make($data, [
            'from' => 'required',
            'body' => 'required|max:500',
        ], [
            'from.required' => 'from 不能为空',
            'body.required' => '消息内容不能为空',
            'body.max' => '消息不能大于 500 个字'
        ]);

        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        $team = Team::where('token', $data['to'])->first();
        if (!$team){
            $web = Web::find($data['to']);
            if ($web) {
                $team = Team::find($web->team_id);
            }
        } else {
            $web = Web::where('team_id', $team->id)->first();
        }

        $params = [
            'track_id' => $data['from']
        ];

        $userInfo = [];
        if (!empty($data['user_info'])) {
            $userInfo = @json_decode(urldecode($data['user_info']), true);
            if (!empty($userInfo) && is_array($userInfo) && !empty($userInfo['extend_id'])) {
                $data['extend_id'] = $userInfo['extend_id'];
            }
        }

        $contact = Contact::firstOrCreate($params, $team);
        $order = Order::createOrder($contact, $team, Message::TYPE_IM, $web, $userInfo, $data['group_id']);
        $group = null;
        if ($data['group_id'] && !$order->group_id) {
            $group = Group::where(['team_id' => $team->id, 'id' => $data['group_id']])->first();
            if ($group) {
                $agentId = AgentAction::assign($contact, Message::TYPE_IM, $group);
                if ($agentId) {
                    $order->update(['user_id' => $agentId, 'group_id' => $group->id, 'status' => Order::STATUS_OPEN]);
                    $order = Order::find($order->id);
                }
            }
        }

        // TODO
        if (CustomerManage::inCustomers($team->id)) {
            $to = CustomerManage::getManager()->token;
        }

        $user = $order->user;
        if (!$user) {
            $user = User::where('team_id', $order->team_id)->first();
            $order->update(['user_id' => $user->id]);
        }

        $message = [
            'from' => $contact->token,
            'to' => $user->token,
            'body' => $data['body'],
            'direction' => Message::DIRECTION_RECEIVE,
            'package' => [
                'team_id' => $team->id,
                'order_id' => $order->id,
                'contact' => array_only($contact->toArray(), ['id', 'name', 'img'])
            ]
        ];

        $message['package']['agent'] = array_only($user->toArray(), ['id', 'name', 'img']);
        if ($order->status === Order::STATUS_INIT) {
            if (!$order->user_id) {
                $agentId = AgentAction::assign($contact, Message::TYPE_IM, $group);
                $order->update(['status' => Order::STATUS_OPEN, 'user_id' =>  $agentId]);
            } else {
                $order->update(['status' => Order::STATUS_OPEN]);
            }
        }

        // 处理表单式工单
        if (isset($data['title'])) {
            $items = @json_decode($message['body'], true);
            if ($items) {
                $body = sprintf('<div class="order"><h3>%s</h3>', htmlentities($data['title'], ENT_QUOTES, 'utf-8'));
                foreach ($items as $key => $val) {
                    $body .= sprintf('<div class="item"><label>%s</label>: %s</div>', htmlentities($key, ENT_QUOTES, 'utf-8'), htmlentities($val, ENT_QUOTES, 'utf-8'));
                }
                $body .= '</div>';
                $message['body'] = $body;
                $message['package']['order'] = ['title' => $data['title'], 'body' => $body];
            }
        } else {
            $message['body'] = htmlentities($message['body'], ENT_QUOTES, 'utf-8');
        }

        $response = Messenger::im($message);
        if (!$response['connectors']['im'] && $order->user_id && !$group) {
            $order->shift($contact, $data);
        }

        return $this->responseJson(['data' => $message]);
    }

    /**
     * 留言
     * @param Request $request
     * @return mixed
     */
    public function postLm(Request $request)
    {
        $data = $request->only('from', 'to', 'email', 'phone', 'body', 'user_info');
        $validator = Validator::make($data, [
            'from' => 'required',
            'to' => 'required',
            'email' => 'email',
            'body' => 'required',
        ], [
            'from.required' => '缺少 from',
            'to.required' => '缺少 to',
            'body.required' => '缺少 body',
            'token.required' => '缺少 token',
            'token.exists' => 'token 不存在',
            'email.email' => '邮箱格式不正确'
        ]);

        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        if (empty($data['email']) && empty($data['phone'])) {
            return $this->responseJsonError('请填写手机号码或邮箱', 403);
        }

        if (!empty($data['phone'])) {
            $reg = \Config::get('regular.phone');
            if (!preg_match($reg, $data['phone'])) {
                return $this->responseJsonError('手机号码格式不正确', 403);
            }
        }

        $team = Team::where('token', $data['to'])->first();
        if (!$team){
            $web = Web::find($data['to']);
            if ($web) {
                $team = Team::find($web->team_id);
            }
        }
        $data['team_id'] = $team->id;
        $params['track_id'] = $data['from'];
        $params['user_info'] = array_only($data, ['email', 'phone']);
        if (!empty($data['user_info'])) {
            $userInfo = @json_decode(urldecode($data['user_info']), true);
            if (!empty($userInfo) && is_array($userInfo)) {
                $userInfo = array_only($userInfo, ['extend_id', 'name', 'email', 'phone', 'tags', 'extend']);
                $userInfo['team_id'] = $team->id;
                $params['user_info'] = $userInfo;
            }
        }

        $contact = Contact::firstOrCreate($params, $team);
        $order = Order::createOrder($contact, $team, Message::TYPE_IM);
        $order->update(['status' => Order::STATUS_OPEN]);

        $from = $contact->token;
        Messenger::system([
            'direction' => Message::DIRECTION_RECEIVE,
            'from' => $from,
            'to' => $team->token,
            'body' => sprintf('收到客户 %s 的留言, 可以通过邮件或电话进行回复', $contact->name),
            'package' => [
                'order_id' => $order->id,
                'team_id' => $team->id
            ]
        ]);

        $message = [
            'from' => $from,
            'to' => $team->token,
            'direction' => Message::DIRECTION_RECEIVE,
            'body' => $data['body'],
            'package' => [
                'order_id' => $order->id,
                'team_id' => $team->id,
                'contact' => array_only($contact->toArray(), ['id', 'name', 'img'])
            ]
        ];

        $resp = Messenger::im($message);

        return $this->responseJson($resp);
    }

    /**
     * 服务评价
     * @param Request $request
     * @return mixed
     */
    public function postEvaluate(Request $request)
    {
        $data = $request->only('order_id', 'level', 'content');
        $data['level'] = strtoupper($data['level']);

        $validator = Validator::make($data, [
            'order_id' => 'required|numeric',
            'level' => 'required|in:' . implode(',', [Evaluation::LEVEL_BAD, Evaluation::LEVEL_GENERAL, Evaluation::LEVEL_GOOD]),
        ], [
            'order_id.required' => '请在对话开始后进行评价',
            'level.required' => '评论不能为空',
            'level.in' => '评价类型不正确'
        ]);

        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        $order = Order::where('id', $data['order_id'])->first();
        if (!$order) {
            return $this->responseJsonError('对话不存在', 402);
        }

        $existsReplyMessage = Message::where('package.order_id', $order->id)
            ->where('package.agent.id', $order->user_id)
            ->first();
        if (!$existsReplyMessage) {
            return $this->responseJsonError('请在对话开始后进行评价', 403);
        }

        $data['team_id'] = $order->team_id;
        $data['user_id'] = $order->user_id;
        $data['user_name'] = $order->user->name;
        $data['contact_id'] = $order->contact_id;
        $data['contact_name'] = $order->contact->name;

        $evaluation = Evaluation::firstOrCreate(['order_id' => $data['order_id']]);
        $evaluation->fill($data);
        $evaluation->save();

        return $this->responseJson(['data' => sprintf('您为%s的服务打了: %s', $order->user->name, $evaluation->levelToText())]);
    }
}
