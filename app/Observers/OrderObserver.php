<?php

namespace App\Observers;

use App\Models\Evaluation;
use App\Models\Message;
use App\Models\Setting\Wechat;
use App\Services\Messenger;
use App\Models\Order;
use App\Models\Task;

class OrderObserver
{
    public function created($order)
    {
    }

    public function saved($order)
    {
        // 结束对话
        if ($order->status === Order::STATUS_CLOSED || $order->status === Order::STATUS_AUTO_CLOSED) {
            $redis = \Redis::connection();
            $key = sprintf('%s%s', Order::LAST_REPLIED, $order->id);
            $redis->del($key);
            if (!$order->team || !$order->user) {
                return ;
            }

            if ($order->status === Order::STATUS_CLOSED) {
                // 工单关闭消息
                Messenger::system([
                    'from' => $order->user->token,
                    'to' => $order->contact->token,
                    'direction' => Message::DIRECTION_RECEIVE,
                    'body' => sprintf('%s %s 结束了对话', $order->user->role_name, $order->user->name),
                    'package' => [
                        'team_id' => $order->team_id,
                        'order_id' => $order->id,
                        'agent' => array_only($order->user->toArray(), ['id', 'name', 'img']),
                        'contact' => array_only($order->contact->toArray(), ['id', 'name', 'img'])
                    ]
                ]);

                // 工单关闭消息
                Messenger::system([
                    'from' => $order->user->token,
                    'to' => $order->contact->token,
                    'direction' => Message::DIRECTION_SEND,
                    'body' => '客服已结束对话',
                    'package' => [
                        'team_id' => $order->team_id,
                        'order_id' => $order->id,
                        'action' => 'closed'
                    ]
                ]);

                // 评价
                if ($order->type === Message::TYPE_VOIP) {
                    if ($order->team->voip->evaluation) {
                        Messenger::sms([
                            'from' => $order->from,
                            'to' => $order->to,
                            'body' => '尊敬的用户您好 ，请回复以下序号对我们的服务进行评价 1. 满意 2. 还行 3.不满意',
                            'type' => Message::TYPE_WECHAT,
                            'direction' => Message::DIRECTION_SEND,
                            'package' => [
                                'order_id' => $order->id,
                                'team_id' => $order->team_id,
                                'contact' => array_only($order->contact->toArray(), ['id', 'img', 'name']),
                                'agent' => array_only($order->user->toArray(), ['id', 'img', 'name']),
                                'read' => true
                            ]
                        ]);
                        $redis->setex(Evaluation::REDIS_PREFIX . $order->contact->phone, 30 * 24 * 3600, $order->id);
                    }
                }

                if ($order->type === Message::TYPE_WECHAT) {
                    $wechat = Wechat::find($order->contact->wechat_id);
                    if ($wechat && $wechat->evaluation) {
                        $message = [
                            'body' => '请对我们的服务进行评价，直接回复 好评　中评　差评',
                            'from' => $order->from,
                            'to' => $order->to,
                            'direction' => Message::DIRECTION_SEND,
                            'package' => [
                                'order_id' => $order->id,
                                'team_id' => $order->team_id,
                                'agent' => array_only($order->user->toArray(), ['id', 'img', 'name']),
                                'contact' => array_only($order->contact->toArray(), ['id', 'img', 'name']),
                                'read' => true
                            ]
                        ];
                        Messenger::wechat($message);
                        $redis->setex(Evaluation::REDIS_PREFIX . $order->contact->openid, 30 * 24 * 3600, $order->id);
                    }
                }
            } else {
                // 工单关闭消息
                Messenger::system([
                    'from' => $order->contact->token,
                    'to' => $order->team->token,
                    'direction' => Message::DIRECTION_SEND,
                    'body' => '超过 24 小时没有操作，系统自动关闭对话',
                    'package' => [
                        'team_id' => $order->team_id,
                        'order_id' => $order->id,
                        'action' => 'auto_closed'
                    ]
                ]);
            }

            // 统计工单的消息数
            $count = Message::where('package.order_id', $order->id)->count();
            \DB::table('order')->where('id', $order->id)
                ->update([
                    'message_count' => $count,
                    'user_name' => $order->user->name,
                    'contact_name' => $order->contact->name,
                    'time' => $order->updated_at->timestamp - $order->created_at->timestamp
                ]);

            if ($order->task_id) {
                $task = Task::find($order->task_id);
                if ($task) {
                    $count = Order::where('task_id', $task->id)->where('status', Order::STATUS_CLOSED)->count();
                    if ($count == $task->jobs) {
                        $task->update(['status' => Task::STATUS_FINISH]);
                    }
                }
            }

            Message::where('to', $order->user->token)->update(['to' => $order->team->token]);
        }


    }
}
