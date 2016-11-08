<?php

namespace App\Services;

use App\Library\Curl;
use App\Models\Appstore\Vote;
use App\Models\Appstore\VoteConfig;
use App\Models\Appstore\VoteRecord;
use App\Models\PluginContact;
use Carbon\Carbon;
use Gibson\Wechat\Media;
use Gibson\Wechat\Message;
use Gibson\Wechat\Staff;
use Illuminate\Support\Facades\Config;
use MongoDB\BSON\ObjectID;

class PluginAction
{
    public function __call($name, $args)
    {
        if (method_exists($this, $name)) {
            $this->$name($args);
        }
    }

    public function vote($params)
    {
        // php 端的投票
        $voteConfig = VoteConfig::where('_id', $params['activity_id'])->first();
        if ($voteConfig) {
            if (isset($params['action']) && $params['action'] === 'delete') {
                VoteRecord::where('openid', $params['openid'])->delete();
                return ;
            }

            // 判断结束时间
            if ($voteConfig->end) {
                $vote = Vote::where('contact_id', $params['user_id'])->first();
                $end = $vote->created_at->timestamp + ($voteConfig->end * 24 * 3600);
                if ($end < time()) {
                    return ['msg' => '已超出时间范围'];
                }
            }

            if (VoteConfig::where('activity_id', $params['activity_id'])->where('openid', $params['openid'])->count() === 3) {
                return ['msg' => '最多只允许参与 3 次'];
            }

            $record = VoteRecord::where(['contact_id' => $params['user_id']])
                ->where('vote_config_id', $params['activity_id'])
                ->where('openid', $params['openid'])
                ->first();
            $contact = PluginContact::where('_id', $params['user_id'])->first();
            if ($record) {
                return ['msg' => sprintf('您已经支持过 %s 了', $contact->name)];
            } else {
                VoteRecord::create([
                    'openid' => $params['openid'],
                    'contact_id' => $params['user_id'],
                    'vote_config_id' => $params['activity_id']
                ]);

                $msg = sprintf('您成功的投了 %s 一票', $contact->name);
                if ($voteConfig->success_txt) {
                    $msg = str_replace('#name#', $contact->name, $voteConfig->success_txt);
                }

                return ['msg' => $msg];
            }
        }

        $api = Config::get('qrcode-action.vote');
        if ($api) {
            $api = $api . '?' . http_build_query($params);
            $resp = Curl::to($api)->get();
            $array = @json_decode($resp, true);
            if (isset($array['ok']) && $array['ok'] && !isset($array['msg'])) {
                $array['msg'] = '投票成功';
            }
            return $array;
        }

        return null;
    }

    public function calendarpush($account, $message)
    {
        $url = 'https://o9ilem9mm.qnssl.com/calendarpush/' . $account->app_id . '?rand=' . rand(111111, 999999);
        $tmp = storage_path(new ObjectID() . '.jpg');
        $con = Curl::to($url)->get();
        if (!preg_match('/error/', $con)) {
            file_put_contents($tmp, $con);
            $media = new Media($account->getAccessToken());
            $staff = new Staff($account->getAccessToken());
            $image = $media->image($tmp);
            @unlink($tmp);
            $msg = Message::make('image')->media($image['media_id']);
            $staff->send($msg)->to($message['FromUserName']);
        }
        exit;
    }
}