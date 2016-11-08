<?php

// 客服操作
namespace App\Services;

use App\Models\Order;
use App\Models\User;
use App\Models\Team;
use App\Models\Message;
use App\Models\Setting\Assign;

class AgentAction
{
    public static function online($teamToken)
    {
        $socket = new Socket();
        $agents = $socket->agents($teamToken);
        return $agents;
    }

    public static function assign($contact, $type, $group = null)
    {
        $type = strtoupper($type);
        $assign = Assign::where('team_id', $contact->team_id)->first();
        $team = Team::where('id', $contact->team_id)->first();

        // 托管客户
        // TODO
        if (\App\Models\CustomerManage::where('team_id', intval($team->id))->first()) {
            //$team = \App\Models\Team::find(env('MANAGE_TEAM_ID'));
        }

        $userIds = self::online($team->token);

        if (empty($userIds)) {
            return 0;
        }

        // 分配上次接待的客服
        if ($assign->repeat) {
            $lastOrder = Order::where(['contact_id' => $contact->id, 'status' => Order::STATUS_CLOSED])
                ->orderBy('id', 'desc')
                ->first();
            if ($lastOrder) {
                foreach ($userIds as $id) {
                    if ($id == $lastOrder->user_id) {
                        return $id;
                    }
                }
            }
        }

        $groupId = [];
        if ($type == Message::TYPE_IM) {
            foreach ($assign->web as $web) {
                if ($web['web_id'] == $contact->web_id && !empty($web['group_id'])) {
                    $groupId = $web['group_id'];
                }
            }
            foreach ($assign['web_rule'] as $rule) {
                if ($rule['url'] == $contact['url'] && !empty($rule['group_id'])) {
                    $groupId = $rule['group_id'];
                }
            }
        }
        if ($type == Message::TYPE_WECHAT) {
            foreach ($assign['wechat'] as $wechat) {
                if ($wechat['wechat_id'] == $contact->wechat_id && !empty($wechat['group_id']))  {
                    $groupId = $wechat['group_id'];
                }
            }
        }
        if ($type == Message::TYPE_WEIBO) {
            foreach ($assign['weibo'] as $weibo) {
                if ($weibo['weibo_id'] == $contact->weibo_id && !empty($weibo['group_id'])) {
                    $groupId = $weibo['group_id'];
                }
            }
        }
        if ($type == Message::TYPE_VOIP) {
            $groupId = $assign['voip'];
        }
        if ($type == Message::TYPE_MAIL) {
            $groupId = $assign['mail'];
        }

        //TODO
        if (isset($group->id)) {
            $groupId = [$group->id];
        }

        if (!empty($groupId)) {
            $groupUserIds = \DB::table('user_group')

                ->whereIn('group_id', $groupId)
                ->lists('user_id');
            $groupUsers = [];
            foreach ($userIds as $id) {
                if (in_array($id, $groupUserIds)) {
                    $groupUsers[] = $id;
                }
            }

            if (!empty($groupUsers)) {
                $userIds = $groupUsers;
            }
        }

        // 没有在线客服尝试查找绑定微信的用户
        if (empty($userIds)) {
            $userIds = User::where('team_id', $team->id)->where('openid', '<>', '')->get()->lists('id')->toArray();
            if (empty($userIds)) {
                return null;
            }
        }

        // 分配给工单最少的用户
        if (count($userIds) > 1) {
            $orders = Order::where('status', Order::STATUS_OPEN)
                ->whereIn('user_id', $userIds)
                ->get();

            $clients = [];
            foreach ($userIds as $id) {
                $clients[$id] = 0;
                foreach ($orders as $order) {
                    if ($order->user_id == $id) {
                        $clients[$id]++;
                    }
                }
            }
            natsort($clients);
            $userIds = array_keys($clients);
        }

        return $userIds[0];
    }
}

