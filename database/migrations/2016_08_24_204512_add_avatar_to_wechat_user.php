<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddAvatarToWechatUser extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $contacts = \App\Models\Contact::where('team_id', 108)->where('wechat_id', '<>', '')->get();
        foreach ($contacts as $contact) {
            $wechat = \App\Models\Setting\Wechat::find($contact->wechat_id);
            if ($wechat) {
                $user = new \Gibson\Wechat\User($wechat->getAccessToken());
                $userInfo = $user->get($contact->openid);
                if ($userInfo->headimgurl) {
                    $avatar = preg_replace(['/\/0$/'], ['/132'], $userInfo->headimgurl);
                    var_dump($avatar);
                    $con = \App\Library\Curl::to($avatar)->get();
                    $img = \App\Services\Qiniu::upload($con, 'jpg');
                    $contact->update(['img' => $img]);
                }
            }

        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
}
