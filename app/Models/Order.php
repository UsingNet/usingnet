<?php

namespace App\Models;

use App\Services\AgentAction;
use App\Services\Messenger;
use App\Services\Socket;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    const STATUS_INIT = 'INIT';
    const STATUS_OPEN = 'OPEN';
    const STATUS_CLOSED = 'CLOSED';
    const STATUS_SLEEP = 'SLEEP';
    const STATUS_TIMING = 'TIMING';
    const STATUS_AUTO_CLOSED = 'AUTO_CLOSED';
    const TYPE_IM = 'IM';
    const TYPE_TASK = 'TASK';
    const TYPE_LM = 'LM';

    const DIRECTION_AGENT = 'AGENT';
    const DIRECTION_CLIENT = 'CLIENT';

    // redis key 保存工单最后回复时间
    const LAST_REPLIED = 'usingnet:order:last:replied:';

    protected $table = 'order';
    protected $fillable = ['team_id', 'type', 'user_id', 'from', 'to', 'contact_id', 'status', 'task_id', 'category_id',
        'note', 'remark', 'timing', 'contact_name', 'user_name', 'time', 'message_count', 'order_count', 'direction',
        'replied', 'group_id'];

    protected $casts = [
        'id' => 'integer',
        'user_id' => 'integer',
        'team_id' => 'integer',
        'task_id' => 'integer',
        'category_id' => 'integer'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    public function contact()
    {
        return $this->belongsTo(Contact::class)->withTrashed();
    }

    public function task()
    {
        return $this->belongsTo(\App\Models\Tasklist::class);
    }

    public function category()
    {
        return $this->belongsTo(\App\Models\OrderCategory::class, 'category_id');
    }

    public static function create(array $data = [])
    {
       try {
           $order = app('db')->transaction(function () use ($data) {
                $order = Order::where('contact_id', $data['contact_id'])
                    ->whereIn('status', [Order::STATUS_SLEEP, Order::STATUS_OPEN, Order::STATUS_INIT])
                    ->lockForUpdate()->first();
                if (!$order) {
                    $order = parent::create($data);
                }
                return $order;
            });
       }  catch (\Exception $e) {
            app('db')->rollback();
           throw new \Exception($e->getMessage());
       }

        return $order;
    }

    public static function firstOrCreate($contact, $team, $type, $setting = null, $userInfo = [], $group = null)
    {
        $order = Order::where('contact_id', $contact->id)
            ->whereIn('status', [Order::STATUS_OPEN, Order::STATUS_SLEEP, Order::STATUS_INIT])
            ->first();

        if (!$order) {
            // 开始新工单时，同步联系人信息
            $reg = \Config::get('regular.link');
            if ($team->plugin && $team->plugin->callback && preg_match($reg, $team->plugin->callback)) {
                $data = Contact::getByCallback($contact->toArray(), $team);
                if (is_array($userInfo) && is_array($data)) {
                    $userInfo = array_merge($userInfo, $data);
                } else {
                    $userInfo = $data;
                }
            }

            if (is_array($userInfo)) {
                $contact->fill($userInfo);
                $contact->save();
            }

            $agent = assign_agent($contact, $type, $group);
            $id = strval(new \MongoDB\BSON\ObjectID());
            $body = sprintf('客户 %s 发起对话', $contact->name);
            if ($type === Message::TYPE_MAIL) {
                $body = sprintf('收到 %s 的邮件', $contact->name);
            }
            if ($type === Message::TYPE_VOIP) {
                $body = sprintf('客户 %s 来电', $contact->name);
            }

            Messenger::system([
                'from' => $contact->token,
                'to' => $team->token,
                'direction' => Message::DIRECTION_RECEIVE,
                'body' => $body,
                'package' => [
                    'team_id' => $team->id,
                    'order_id' => $id
                ]
            ]);

            $order = Order::create([
                'from' =>  $contact->token,
                'to' => $team->token,
                'team_id' => $team->id,
                'status' => $type == Message::TYPE_IM ? Order::STATUS_INIT : Order::STATUS_OPEN,
                'contact_id' => $contact->id,
                'type' => $type,
                'user_id' =>  $agent ? $agent['id'] : 0,
                'direction' => Order::DIRECTION_CLIENT
            ]);

            Message::where('package.order_id', $id)->update(['package.order_id' => $order->id]);
            $method = strtolower($type);

            $from = $team['token'];
            if (CustomerManage::where('team_id', intval($order->team_id))->first()) {
                $from = $order->user->team->token;
            }

            // 欢迎或者默认回复
            if ($agent && $setting) {
                $message = null;
                if ($type === Message::TYPE_IM && $setting->welcome) {
                    $message = $setting->welcome;
                } else if (in_array($type, [Message::TYPE_WECHAT, Message::TYPE_WEIBO]) && $setting->default_reply) {
                    $message = $setting->default_reply;
                }
                if ($message) {
                    Messenger::$method([
                        'from' => $from,
                        'to' => $contact->token,
                        'direction' => Message::DIRECTION_SEND,
                        'body' => $message,
                        'package' => [
                            'team_id' => $team['id'],
                            'order_id' => $order->id,
                            'agent' => array_only($agent, ['id', 'name', 'img']),
                            'action' => 'auto'
                        ]
                    ], $team, $contact);
                }
            } else if (in_array($type, [Message::TYPE_WECHAT, Message::TYPE_WEIBO]) && $setting->not_online_agent_reply) {
                Messenger::$method([
                    'from' => $from,
                    'to' => $contact->token,
                    'direction' => Message::DIRECTION_SEND,
                    'body' => $setting->not_online_agent_reply,
                    'package' => [
                        'team_id' => $team['id'],
                        'order_id' => $order->id,
                        'agent' => array_only($team->toArray(), ['id', 'name', 'img']),
                        'action' => 'auto'
                    ]
                ], $team, $contact);
            }

            if (!in_array($order->status, [Order::STATUS_OPEN, Order::STATUS_INIT])) {
                $order->update(['status' => Order::STATUS_OPEN]);
            }


        }

        return $order;
    }

    public function reAssign($contact, $data)
    {
        $agent = assign_agent($contact, $this->type);
        if ($agent) {
            if ($agent['id'] != $this->user_id && $this->user) {
                $lastMessage = Message::where('package.contact.id', $contact->id)->orderBy('_id', 'desc')->first();
                $lastMessage->update(['package.agent'], array_only($agent, ['id', 'img', 'name']));
                Messenger::system([
                    'from' => $contact->token,
                    'to' => $agent['token'],
                    'direction' => Message::DIRECTION_RECEIVE,
                    'body' => sprintf('%s %s 已离线，工单被自动转发给 %s', $this->user->role_name, $this->user->name, $agent['name']),
                    'package' => [
                        'team_id' => $this->team_id,
                        'order_id' => $this->id,
                        'contact' => array_only($contact->toArray(), ['id', 'name', 'img'])
                    ]
                ]);
                Message::where(['package.order_id' => $this->id, 'to' => $this->user->token])
                    ->update(['to' => $this->team->token]);
            }
            $onlines = agent_online($this->team_id);
            if (count($onlines) === 0 && $agent['openid']) {
                Messenger::wechatNotice($agent, $data, $contact, $this->id);
            }
            $this->update(['user_id' => $agent['id'], 'status' => Order::STATUS_OPEN]);
        } else {
            $this->update(['user_id' => 0]);
        }
    }

    /**
     * V2 Api 调用
     */
    public static function createOrder($contact, $team, $type, $setting = null, $userInfo = [], $group = null)
    {
        $order = Order::where('contact_id', $contact->id)
            ->whereIn('status', [Order::STATUS_OPEN, Order::STATUS_SLEEP, Order::STATUS_INIT])
            ->first();

        if (!$order) {
            // 开始新工单时，同步联系人信息
            $reg = \Config::get('regular.link');
            if ($team->plugin && $team->plugin->callback && preg_match($reg, $team->plugin->callback)) {
                $data = Contact::getByCallback($contact->toArray(), $team);
                if (is_array($userInfo) && is_array($data)) {
                    $userInfo = array_merge($userInfo, $data);
                } else {
                    $userInfo = $data;
                }
            }

            if (is_array($userInfo)) {
                $contact->fill($userInfo);
                $contact->save();
            }

            $agentId = AgentAction::assign($contact, $type, $group);
            $id = strval(new \MongoDB\BSON\ObjectID());
            $body = sprintf('客户 %s 发起对话', $contact->name);
            if ($type === Message::TYPE_MAIL) {
                $body = sprintf('收到 %s 的邮件', $contact->name);
            }
            if ($type === Message::TYPE_VOIP) {
                $body = sprintf('客户 %s 来电', $contact->name);
            }

            Messenger::system([
                'from' => $contact->token,
                'to' => $team->token,
                'direction' => Message::DIRECTION_RECEIVE,
                'body' => $body,
                'package' => [
                    'team_id' => $team->id,
                    'order_id' => $id
                ]
            ]);

            $order = Order::create([
                'from' =>  $contact->token,
                'to' => $team->token,
                'team_id' => $team->id,
                'status' => $type == Message::TYPE_IM ? Order::STATUS_INIT : Order::STATUS_OPEN,
                'contact_id' => $contact->id,
                'type' => $type,
                'user_id' =>  $agentId,
                'direction' => Order::DIRECTION_CLIENT
            ]);

            Message::where('package.order_id', $id)->update(['package.order_id' => $order->id]);
            $method = strtolower($type);

            $from = $team['token'];
            if (CustomerManage::where('team_id', intval($order->team_id))->first() && $order->user) {
                $from = $order->user->team->token;
            }

            // 欢迎或者默认回复
            if ($agentId && $setting) {
                $message = null;
                if ($type === Message::TYPE_IM && $setting->welcome) {
                    $message = $setting->welcome;
                } else if (in_array($type, [Message::TYPE_WECHAT, Message::TYPE_WEIBO]) && $setting->default_reply) {
                    $message = $setting->default_reply;
                }
                if ($message) {
                    $agent = User::where('id', $agentId)->first()->toArray();
                    Messenger::$method([
                        'from' => $from,
                        'to' => $contact->token,
                        'direction' => Message::DIRECTION_SEND,
                        'body' => $message,
                        'package' => [
                            'team_id' => $team['id'],
                            'order_id' => $order->id,
                            'agent' => array_only($agent, ['id', 'name', 'img']),
                            'action' => 'auto',
                            'read' => true
                        ]
                    ], $team, $contact);
                }
            } else if (in_array($type, [Message::TYPE_WECHAT, Message::TYPE_WEIBO]) && $setting->not_online_agent_reply) {
                Messenger::$method([
                    'from' => $from,
                    'to' => $contact->token,
                    'direction' => Message::DIRECTION_SEND,
                    'body' => $setting->not_online_agent_reply,
                    'package' => [
                        'team_id' => $team['id'],
                        'order_id' => $order->id,
                        'agent' => array_only($team->toArray(), ['id', 'name', 'img']),
                        'action' => 'auto',
                        'read' => true
                    ]
                ], $team, $contact);
            }

            if (!in_array($order->status, [Order::STATUS_OPEN, Order::STATUS_INIT])) {
                $order->update(['status' => Order::STATUS_OPEN]);
            }


        }

        return $order;
    }

    /**
     * V2 接口
     * @param $contact
     * @param $data
     * @throws \Exception
     */
    public function shift($contact, $data)
    {
        $agentId = AgentAction::assign($contact, $this->type);
        if ($agentId) {
            $agent = User::where('id', $agentId)->first()->toArray();
            if ($agent['id'] != $this->user_id && $this->user) {
                $lastMessage = Message::where('package.contact.id', $contact->id)->orderBy('_id', 'desc')->first();
                $lastMessage->update(['package.agent'], array_only($agent, ['id', 'img', 'name']));
                Messenger::system([
                    'from' => $contact->token,
                    'to' => $agent['token'],
                    'direction' => Message::DIRECTION_RECEIVE,
                    'body' => sprintf('%s %s 已离线，工单被自动转发给 %s', $this->user->role_name, $this->user->name, $agent['name']),
                    'package' => [
                        'team_id' => $this->team_id,
                        'order_id' => $this->id,
                        'contact' => array_only($contact->toArray(), ['id', 'name', 'img'])
                    ]
                ]);
                Message::where(['package.order_id' => $this->id, 'to' => $this->user->token])
                    ->update(['to' => $this->team->token]);
            }
            $socket = new Socket();
            $onlines = $socket->agents($this->team->token);
            $onlines = agent_online($this->team_id);
            if (count($onlines) === 0 && $agent['openid']) {
                Messenger::wechatNotice($agent, $data, $contact, $this->id);
            }
            $this->update(['user_id' => $agent['id'], 'status' => Order::STATUS_OPEN]);
        } else {
            $this->update(['user_id' => 0]);
        }
    }
}
