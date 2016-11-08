<?php

namespace App\Http\Controllers\V2\Message;

use App\Services\Connect;
use App\Services\Messanger;
use App\Models\Setting\Web;
use Validator;
use App\Models\Team;
use App\Models\Order;
use App\Models\Contact;
use App\Models\Message;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class MessageController extends Controller
{

    public function __construct()
    {
        $this->middleware('auth', ['except' => 'postLm']);
    }

    /**
     * 消息列表
     *
     * @param Request $request
     * @return mixed
     */
    public function getIndex(Request $request)
    {
        $handle = Message::where('package.team_id', intval($request->user()->team_id))
            ->orderBy('_id', 'desc');

        if ($orderId = $request->get('order_id')) {
            $handle->where('package.order_id', intval($orderId));
        }

        if ($lastMessageId = $request->get('last_message_id')) {
            $handle->where('_id', '<', $lastMessageId);
        }

        $messages = $handle->take(11)->get();
        foreach ($messages as $message) {
            $message->created_at = date('Y-m-d H:i:s', (string)$message->created_at / 1000);
        }

        $messages = $messages->toArray();
        usort($messages, function ($a, $b) {
            return $a['_id'] > $b['_id'];
        });

        return $this->responseJson(['data' => $messages]);
    }

    /**
     * 返回邮件消息的内容
     * @param $id
     * @return mixed
     */
    public function getMail($id)
    {
        $message = message::where('_id', $id)->first();
        if (!$message) {
            return $this->responsejsonerror('消息不存在', 404);
        }

        echo nl2br($message->body);
    }

    /**
     * 撤销消息
     */
    public function getUndo($id)
    {
        $message = message::where('_id', $id)->first();
        if (!$message) {
            return $this->responsejsonerror('消息不存在', 404);
        }

        $connect = new Connect(Connect::PUSH_SERVER);

        return $this->responseJson($connect->undo($id));
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
        $order = Order::firstOrCreate($contact, $team, Message::TYPE_IM);
        $order->update(['status' => Order::STATUS_OPEN]);

        $from = $contact->token;
        Messanger::system([
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

        if ($order->user) {
            $message['package']['agent'] = array_only($order->user->toArray(), ['id', 'img', 'name']);
        }

        $resp = Messanger::im($message);

        $agent = assign_agent($contact, Message::TYPE_IM);
        if ($agent['openid']) {
            Messanger::wechatNotice($agent, $data, $contact, $order->id);
        }

        return $this->responseJson($resp);
    }
}
