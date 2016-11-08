<?php

namespace App\Models;

use Jenssegers\Mongodb\Eloquent\Model;

class Stats extends Model
{
    protected $table = 'message_stats';
    protected $connection = 'mongodb';
    protected $fillable = ['orders', 'messages', 'asks', 'replies', 'replied', 'from', 'evaluate', 'first_responses',
        'responses', 'sessions', 'categories', 'date', 'team_id', 'first_response', 'response', 'session', 'user_id',
        'created_at', 'updated_at', 'contact_hour', 'agent_hour', 'replied_hour', 'unreplied_hour'];

    public static function compute($messages, $order)
    {
        $resp = [
            'orders' => 0,
            'messages' => 0,
            'replied' => 0,
            'asks' => 0,
            'replies' => 0,
            'from' => [
                Message::TYPE_IM =>  0,
                Message::TYPE_WECHAT => 0,
                Message::TYPE_VOIP => 0,
                Message::TYPE_WEIBO => 0,
                Message::TYPE_MAIL => 0,
            ],
            'evaluate' => [
                Evaluation::LEVEL_GOOD => 0,
                Evaluation::LEVEL_BAD => 0,
                Evaluation::LEVEL_GENERAL => 0,
            ],
            'session' => $order->updated_at->timestamp - $order->created_at->timestamp,
            'first_response' => 0,
            'response' => 0,
            'first_responses' => [0, 0, 0, 0, 0, 0, 0],
            'responses' => [0, 0, 0, 0, 0, 0, 0],
            'sessions' => [0, 0, 0, 0, 0, 0, 0],
            'categories' => [],
            'contact_hour' => [],
            'agent_hour' => [],
            'replied_hour' => [],
            'unreplied_hour' => []
        ];

        for ($i = 1; $i <= 24; $i++) {
            $key = str_pad($i, 2, '0', STR_PAD_LEFT) . ':00';
            $resp['contact_hour'][$key] = 0;
            $resp['agent_hour'][$key] = 0;
            $resp['replied_hour'][$key] = 0;
            $resp['unreplied_hour'][$key] = 0;
        }

        // 分类
        if ($category = OrderCategory::where('id', $order->category_id)->first()) {
            $resp['categories'][$category->title] = 1;
        }
        // 评价
        if ($evaluation = Evaluation::where('order_id', $order->id)->first()) {
            $level = $evaluation->level;
            if (isset($resp['evaluate'][$level])) {
                $resp['evaluate'][$level]++;
            }
        }
        // 来源
        if (isset($resp['from'][$order->type])) {
            $resp['from'][$order->type]++;
        }

        $resp['replied'] = $order->replied;
        $hour = date('H', $order->updated_at->timestamp);
        $key = ($hour == '00' ? '24' : $hour) . ':00';
        if ($order->replied) {
            $resp['replied_hour'][$key] = 1;
        } else {
            $resp['unreplied_hour'][$key] = 1;
        }

        $resp['orders'] = 1;
        $resp['messages'] = $messages->count();

        $preAt = 0;
        $responses = [];
        foreach ($messages as $message) {
            $createdAt = strval($message->created_at) / 1000;
            $hour = date('H', $createdAt);
            $key = ($hour == '00' ? '24' : $hour) . ':00';
            if ($message->direction === Message::DIRECTION_RECEIVE) {
                $resp['asks']++;
                if (isset($resp['contact_hour'][$key])) {
                    $resp['contact_hour'][$key]++;
                } else {
                    $resp['contact_hour'][$key] = 1;
                }
                if (!$preAt) {
                    $preAt = $createdAt;
                }
            } else {
                $resp['replies']++;
                if ($preAt) {
                    $responses[] = $createdAt - $preAt;
                    $preAt = 0;
                }
                if (isset($resp['agent_hour'][$key])) {
                    $resp['agent_hour'][$key]++;
                } else {
                    $resp['agent_hour'][$key] = 1;
                }
            }
        }

        $resp['first_response'] = isset($responses[0]) ? $responses[0] : 0;
        $resp['response'] = array_sum($responses);
        $responses = [
            'sessions' => [ $order->updated_at->timestamp - $order->created_at->timestamp ],
            'first_responses' => [$resp['first_response']],
            'responses' => $responses
        ];

        foreach ($responses as $key => $val) {
            if ($key === 'sessions') {
                $than = [
                    3600 * 7 => 0,
                    3600 => 0,
                    60 * 8 => 0,
                    60 * 6 => 0,
                    60 * 4 => 0,
                    60 * 2=> 0,
                    60 * 1 => 0
                ];
            } else {
                $than = [
                    3600 * 7 => 0,
                    3600 => 0,
                    60 => 0,
                    45 => 0,
                    30 => 0,
                    15 => 0,
                    1 => 0
                ];
            }

            $keys = array_keys($than);
            foreach ($val as $response) {
                if ($response > $keys[0]) {
                    $than[$keys[0]]++;
                } elseif ($response > $keys[1]) {
                    $than[$keys[1]]++;
                } elseif ($response > $keys[2]) {
                    $than[$keys[2]]++;
                } elseif ($response > $keys[3]) {
                    $than[$keys[3]]++;
                } elseif ($response > $keys[2]) {
                    $than[$keys[4]]++;
                } elseif ($response > $keys[3]) {
                    $than[$keys[5]]++;
                } else {
                    $than[$keys[6]]++;
                }
            }

            $count = count($val);
            sort($keys, SORT_ASC);
            if ($count) {
                $resp[$key] = [];
                foreach ($keys as $k) {
                    $resp[$key][] = $than[$k];
                }
            }
        }

        return $resp;
    }
}



