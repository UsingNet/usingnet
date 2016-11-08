<?php

namespace App\Observers;

use App\Services\Qiniu;
use Config;
use Gibson\Wechat\User;
use App\Models\Setting\Wechat;
use App\Models\Team;

class ContactObserver
{

    /**
     * 创建联系人生成 token
     * @param $contact
     */
    public function created($contact)
    {
        $contact->token = strval(new \MongoDB\BSON\ObjectID());
        $contact->save();
    }

    public function saved($contact)
    {
        if ($contact->img == '') {
            $img = null;
            if ($contact->openid) {
                try {
                    $account = Wechat::find($contact->wechat_id);
                    if ($account) {
                        $user = new User($account->getAccessToken());
                        $userInfo = $user->get($contact->openid);
                        $img = preg_replace('/\/0$/','/132', $userInfo->headimgurl);
                        $img = Qiniu::upload(file_get_contents($img), 'jpg');
                    }
                } catch (\Exception $e) {
                }
            }

            if ($img === null) {
                $baseUrl = \Config::get('filesystems.disks.qiniu.domain');
                $num = rand(0, 15);
                $img = '//' . $baseUrl . '/common_avatar_' . $num . '.png';
            }

            $contact->img = $img;
            \DB::table('contact')->where('id', $contact->id)->update(['img' => $img]);
        }
    }

    public function deleted($contact)
    {
        \DB::table('contact')->where('id', $contact->id)
            ->update([
                'email' =>  microtime(true),
                'phone' => microtime(true),
                'openid' => microtime(true)
            ]);
    }
}