<?php

namespace App\Http\Controllers\Api\Message;

use App\Models\CustomerManage;
use App\Models\Group;
use Validator;
use App\Models\Setting\Web;
use App\Services\Messanger;
use App\Models\Message;
use App\Models\Order;
use App\Models\Team;
use App\Models\Contact;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class ClientController extends Controller
{
    /**
     * IM 创建 token
     * @param Request $request
     * @return mixed
     */
    public function getIndex(Request $request)
    {
        $data = $request->only('from', 'to', 'user_info', 'group_id');
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
                $data['extend_id'] = $userInfo['extend_id'];
            }
        }

        if (is_array($userInfo)) {
            $userInfo['web_id'] = $web->id;
        } else {
            $userInfo = ['web_id' => $web->id];
        }

        $userInfo['web_id'] = $web->id;
        $contact = Contact::firstOrCreate($params, $team);
        Order::firstOrCreate($contact, $team, Message::TYPE_IM, $web, $userInfo);
        $local = [$contact->token, $contact->track_id];
        $self = array_only($contact->toArray(), ['id', 'name', 'img', 'token', 'team_id']);

        if (CustomerManage::inCustomers($team->id)) {
            $remote = [CustomerManage::getManager()->token];
        } else {
            $remote = [$team->token];
        }

        $token = Messanger::generateToken('IM', $remote, $local, $self);
        if ($callback = $request->get('callback')) {
            $params = [
                'success' => true,
                'data' => $token
            ];
            echo sprintf('%s(%s)', $callback, json_encode($params));
        } else {
            return $this->responseJson($token);
        }
    }

    /**
     * IM 发送消息
     *
     * @param Request $request
     * @return mixed
     */
    public function postIndex(Request $request)
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
        $order = Order::firstOrCreate($contact, $team, Message::TYPE_IM, $web, $userInfo);
        $group = null;
        if ($data['group_id'] && !$order->group_id) {
            $group = Group::where(['team_id' => $team->id, 'id' => $data['group_id']])->first();
            if ($group) {
                $agent = assign_agent($contact, Message::TYPE_IM, $group);
                if ($agent) {
                    $order->update(['user_id' => $agent['id'], 'group_id' => $group->id, 'status' => Order::STATUS_OPEN]);
                    $order = Order::find($order->id);
                }
            }
        }

        $to = $team->token;
        if (CustomerManage::inCustomers($team->id)) {
            $to = CustomerManage::getManager()->token;
        }

        $message = [
            'from' => $contact->token,
            'to' => $to,
            'body' => $data['body'],
            'direction' => Message::DIRECTION_RECEIVE,
            'package' => [
                'team_id' => $team->id,
                'order_id' => $order->id,
                'contact' => array_only($contact->toArray(), ['id', 'name', 'img'])
            ]
        ];

        if ($order->user) {
            $message['package']['agent'] = array_only($order->user->toArray(), ['id', 'name', 'img']);
        }
        if ($order->status === Order::STATUS_INIT) {
            if (!$order->user_id) {
                $agent = assign_agent($contact, Message::TYPE_IM, $group);
                $order->update(['status' => Order::STATUS_OPEN, 'user_id' => $agent ? $agent['id'] : 0]);
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

        $response = Messanger::im($message);
        if (!$response['connectors']['im'] && $order->user_id && !$group) {
            $order->reAssign($contact, $data);
        }

        return $this->responseJson($response);
    }
}
