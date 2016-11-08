<?php

namespace App\Http\Controllers\V2\Voip;

use Redis;
use App\Models\Message;
use App\Services\Messanger;
use App\Library\Syslog;
use App\Models\Contact;
use App\Models\Team;
use Illuminate\Support\Facades\Config;
use Overtrue\Wechat\Utils\XML;
use App\Models\User;
use App\Models\Token;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Setting\Voip;
use App\Models\Voip as SubAccount;
use App\Models\Order;
use App\Models\Bill;

class CallbackController extends Controller
{
    /**
     * 云通讯鉴权
     * @return json
     */
    public function postIndex()
    {
        $con = file_get_contents('php://input');
        $redis = Redis::connection();
        if (empty($con)) {
            exit('argument invalid');
        }

        try {
            $data = XML::parse($con);
        } catch (\Exception $e) {
            return $this->responseJsonError($e->getMessage(), 403);
        }


        Syslog::logger('VOIP')->addDebug('CALLBACK_REQUEST', $data);

        // 坐席登陆验证
        if ($data['action'] == 'AccountLookup') {
            echo $this->findToken($data['id']);
            exit;
        }

        // 呼出电话验证
        if ($data['action'] == 'CallAuth') {
            $voip = SubAccount::where('voip_id', $data['caller'])->first();
            $to = $this->clearPrefixPhone($data['called']);
            $contact = Contact::where(['team_id' => $voip->user->team_id, 'phone' => $to])->first();
            if (!$contact) {
                throw new \Exception('呼出电话: 联系人不存在');
            }
            $order = Order::where('team_id', $voip->user->team_id)
                ->where('contact_id', $contact->id)
                ->first();

            if (!$order) {
                throw new \Exception('呼出电话: 工单不存在');
            }

            $redis->set($data['callSid'], json_encode($order->toArray()));

            $body = <<<EOT
                <?xml version='1.0' encoding='utf-8'?>
                  <Response>
                  <statuscode>0000</statuscode>
                  <statusmsg>success</statusmsg>
                  <record>1</record>
                  </Response>;
EOT;
            echo $body;
            exit;
        }

        // 自动语音电话
        if ($data['action'] == 'SellingCall') {
            $task = Task::find($data['userData']);
            // 计费
            $team = Team::find($task['team_id']);
            $costs = ceil($data['duration'] / 60) * Config::get('price.voip');
            Syslog::logger('PLAY')->addDebug('PLAY_START', [
                'costs' => $costs,
                'team' => $team,
                'task' => $task,
                'data' => $data
            ]);
            $team->trade(-$costs);
            Bill::create([
                'team_id' => $team->id,
                'type' => Bill::TYPE_TASK_VOIP,
                'money' => -$costs
            ]);
            exit;
        }

        if ($data['action'] == 'CallEstablish') {
            $json = $redis->get($data['callSid']);
            $order = json_decode($json, true);
            $contact = Contact::find($order['contact_id']);
            $team = Team::find($order['team_id']);
            $message = [
                'from' => $contact->token,
                'to' => $team->token,
                'direction' => Message::DIRECTION_RECEIVE,
                'body' => sprintf('%s 接听了电话', $contact->name),
                'package' => [
                    'team_id' => $order['team_id'],
                    'order_id' => $order['id'],
                    'callid' => $data['callSid']
                ]
            ];

            Messanger::system($message);
        }

        // 挂断电话
        if ($data['action'] == 'Hangup') {
            $json = $redis->get($data['callSid']);
            $redis->del($data['callSid']);
            $order = json_decode($json, true);
            $order = Order::find($order['id']);

            if ($data['byetype'] == 1) {
                $team = Team::find($order['team_id']);
                $message = [
                    'from' => $order->contact->token,
                    'to' => $order->team->token,
                    'body' => '通话结束，时长' . format_time($data['talkDuration']),
                    'direction' => Message::DIRECTION_RECEIVE,
                    'package' => [
                        'order_id' => $order['id'],
                        'team_id' => $order['team_id'],
                        'recordurl' => $data['recordurl'],
                        'callid' => $data['callSid'],
                        'contact' => array_only($order->contact->toArray(), ['id', 'name', 'img']),
                        'agent' => array_only($order->user->toArray(), ['id', 'name', 'img']),
                    ]
                ];

                Messanger::system($message);
                $redis->lpush(Message::VOICE_MESSAGE_REDIS_KEY, json_encode($message));

                // 计费
                $minutes = max(1, $data['talkDuration'] / 60);
                $costs = $minutes * Config::get('price.voip');
                $team->trade(-$costs);

                Bill::create([
                    'type' => Bill::TYPE_AGENT_VOIP,
                    'team_id' => $team->id,
                    'money' => -$costs
                ]);
            }
        }
    }

    /**
     * 来电
     * @param Request $request
     * @throws \Exception
     */
    public function postStartservice(Request $request)
    {
        $data = $request->all();
        if (empty($data)) {
            exit('argument valid');
        }

        $voip = Voip::where('number', $data['to'])->first();
        if (!$voip) {
            throw new \Exception('客服团队不存在');
        }

        Syslog::logger('VOIP')->addDebug('START_SERVER', $data);

        $onlineAgents = agent_online($voip->team_id);
        if (empty($onlineAgents)) {
            exit;
        }

        $onlineAgentIds = array_fetch($onlineAgents, 'id');
        // 所有坐席重置状态
        $voipService = new \App\Services\Voip();
        foreach ($onlineAgentIds as $agentId) {
           $voipService->agentReady($agentId);
        }

        $contact = Contact::where(['team_id' => $voip->team_id, 'phone' => $data['from']])->first();
        if (!$contact) {
            $contact = Contact::createByPhone([
                'phone' => $data['from'],
                'team_id' => $voip->team_id
            ]);
        }

        $order = Order::where(['team_id' => $voip->team_id, 'contact_id' => $contact->id])
            ->whereIn('status', [Order::STATUS_OPEN, Order::STATUS_SLEEP])
            ->orderBy('id', 'desc')
            ->first();

        $agent = assign_agent($contact, Message::TYPE_IM);
        if (!$order) {
            $order = Order::create([
                'from' => $voip->number,
                'to' => $data['from'],
                'team_id' => $voip->team_id,
                'contact_id' => $contact->id,
                'type' => Message::TYPE_VOIP,
                'user_id' => $agent['id']
            ]);
        }

        Messanger::system([
            'direction' => Message::DIRECTION_RECEIVE,
            'from' => $contact->token,
            'to' => $order->team->token,
            'body' => sprintf('客户 %s 来电', $contact->name),
            'notice' => ['type' => 'voip'],
            'package' => [
                'order_id' => $order->id,
                'team_id' => $order->team_id,
                'callid' => $data['callid'],
                'contact' => [
                    'id' => $contact->id,
                    'name' => $contact->name,
                    'img' => $contact->img,
                    'phone' => $data['from']
                ]
            ]
        ]);

        $order->update(['user_id' => $agent['id'], 'status' => Order::STATUS_OPEN]);
        $redis = Redis::connection();
        $redis->set($data['callid'], $order);

        $response = <<<EOT
                <?xml version="1.0" encoding="UTF-8"?>
                <Response>
                    <EnterCCS queuetype="{$agent['id']}" timeout="50"></EnterCCS>
                </Response>
EOT;


        echo trim($response);
        exit;
    }

    /**
     * 接听
     *
     * @param Request $request
     */
    public function postAgentstate(Request $request)
    {
        $data = $request->all();
        Syslog::logger('VOIP')->addDebug('AGENT_STATE', $data);
        if ($data['agentstate'] == 3) {
            $message = Message::where('package.callid', $data['callid'])->first();
            if ($message && isset($message->package['agent']['id'])) {
                $voip = new \App\Services\Voip();
                $voip->agentReady($message->package['agent']['id']);
            }

            $redis = Redis::connection();
            $json = $redis->get($data['callid']);
            $order = json_decode($json, true);
            $order = Order::find($order['id']);

            Messanger::system([
                'direction' => Message::DIRECTION_RECEIVE,
                'from' => $order->contact->token,
                'to' => $order->team->token,
                'body' => sprintf('%s %s 接听了 %s 的电话', $order->user->role_text, $order->user->name, $order->contact->name),
                'notice' => ['type' => 'voip'],
                'package' => [
                    'order_id' => $order->id,
                    'team_id' => $order->team_id,
                    'callid' => $data['callid'],
                    'agent' => [
                        'id' => $order->user->id,
                        'name' => $order->user->name,
                        'img' => $order->user->img
                    ]
                ]
            ]);
        }
    }

    /**
     * 结束通话
     * @param Request $request
     */
    public function postStopservice(Request $request)
    {
        $data = $request->all();
        Syslog::logger('VOIP')->addDebug('STOP_SERVER', $data);
        $redis = Redis::connection();
        $json = $redis->get($data['callid']);
        $redis->del($data['callid']);
        $order = json_decode($json, true);
        $order = Order::find($order['id']);
        if ($data['recordurl']) {
            $team = Team::find($order['team_id']);
            $message = [
                'from' => $order->contact->token,
                'to' => $order->team->token,
                'body' => '通话结束，时长' . format_time($data['callduration']),
                'direction' => Message::DIRECTION_RECEIVE,
                'package' => [
                    'order_id' => $order['id'],
                    'team_id' => $order['team_id'],
                    'recordurl' => $data['recordurl'],
                    'callid' => $data['callid']
                ]
            ];
            Messanger::system($message);
            $redis->lpush(Message::VOICE_MESSAGE_REDIS_KEY, json_encode($message));
            // 计费
            $minutes = max(1, $data['callduration'] / 60);
            $costs = $minutes * Config::get('price.voip');
            $team->trade(-$costs);
            Bill::create([
                'type' => Bill::TYPE_AGENT_VOIP,
                'team_id' => $team->id,
                'money' => -$costs
            ]);
        }


        $voip = new \App\Services\Voip();
        $voip->agentReady($order['user_id']);
    }

    /**
     * token 查找子账号信息
     *
     * @param $id
     * @return string
     */
    public function findToken($id)
    {
        $token = Token::where('token', $id)->first();
        if (!$token) {
            return 'Token not exists';
        }

        $user = User::where('id', $token->user_id)->first();
        if (!isset($user->voip->voip_id)) {
            $user->createVoipAccount();
        }

        $body = <<<EOT
            <?xml version='1.0' encoding='utf-8'?>
            <Response>
              <dname>{$user->token}</dname>
              <voipid>{$user->voip->voip_id}</voipid>
              <voippwd>{$user->voip->voip_pwd}</voippwd>
              <hash>{$id}</hash>
            </Response>
EOT;
        return $body;
    }

    /**
     * 清除手机号码中的前缀
     * @param $phone
     * @return mixed
     */
    private function clearPrefixPhone($phone)
    {
        return preg_replace('/^086/', '', $phone);
    }
}

