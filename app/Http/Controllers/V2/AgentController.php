<?php

namespace App\Http\Controllers\V2;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\Order;
use App\Models\User;
use App\Services\Messenger;
use App\Services\Socket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;


class AgentController extends Controller
{
    public function getOnline(Request $request)
    {
        $socket = new Socket;
        $team = $request->user()->team;
        $agents = [];
        $agentIds = $socket->agents($team->token);

        if (!empty($agentIds)) {
            $agents = User::whereIn('id', $agentIds)->get()->toArray();
            $orders = Order::where('team_id', $team->id)->where('status', Order::STATUS_OPEN)->get();
            foreach ($orders as $order) {
                foreach ($agents as &$agent) {
                    if (!isset($agent['order_count'])) $agent['order_count'] = 0;
                    if ($agent['id'] === $order->user_id) {
                        $agent['order_count']++;
                    }
                }
            }
        }

        return $this->responseJson(['data' => $agents]);
    }

    public function getMessage(Request $request, $orderId)
    {
        $handler = Message::where('package.order_id', intval($orderId))
            ->take(11)
            ->orderBy('_id', 'desc');

        if ($lastMessageId = $request->get('last_message_id')) {
            $handler->where('_id', '<', $lastMessageId);
        }

        $messages = $handler->get();
        foreach ($messages as $message) {
            $message->created_at = strval($message->created_at);
        }

        return $this->responseJson($messages);
    }

    public function postSend(Request $request)
    {
        $req = $request->only('order_id', 'body');
        $team = $request->user()->team;
        $validator = Validator::make($req, [
            'order_id' => 'required|exists:order,id,status,' . Order::STATUS_OPEN . ',team_id,' . $team->id,
            'body' => 'required|max:1000',
        ], [
            'order_id.required' => '缺少 order_id',
            'order.exists' => '工单不存在',
            'body.required' => '缺少消息内容',
            'body.max' => '消息不能大于 1000 个字',
        ]);

        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        $order = Order::where('team_id', $team->id)
            ->where('id', $req['order_id'])
            ->first();

        $message = [
            'from' => $request->user()->token,
            'to' => $order->contact->token,
            'body' => $req['body'],
            'direction' => Message::DIRECTION_SEND,
            'package' => [
                'team_id' => $team->id,
                'order_id' => $order->id,
                'agent' => array_only($order->user->toArray(), ['id', 'name', 'img'])
            ]
        ];


        $method = strtolower($order->type);
        if (!$method) {
            $method = 'im';
        }

        try {
            $resp  = Messenger::$method($message);
        } catch (\Exception $e) {
            return $this->responseJsonError($e->getMessage(), 403);
        }

        $message = Message::where('_id', $resp['id'])->first();
        $message->created_at = strval($message->created_at);

        return $this->responseJson($message);
    }

    public function postRead(Request $request)
    {
        $orderId = $request->get('order_id');
        $order = Order::where('id', $orderId)->first();
        if (!$order) {
            return $this->responseJsonError('工单不存在', 403);
        }

        Message::where('package.order_id', intval($orderId))
            ->update(['package.read' => true]);

        return $this->responseJson('ok');
    }

    public function postOffline(Request $request, $agentId)
    {
        $user = User::where('id', $agentId)
            ->where('team_id', $request->user()->team_id)->first();

        if (!$user) {
            return $this->responseJsonError('客服不存在', 404);
        }

        $socket = new Socket();
        $socket->offline($user->token, $request->user()->name);

        return $this->responseJson('ok');
    }
}
