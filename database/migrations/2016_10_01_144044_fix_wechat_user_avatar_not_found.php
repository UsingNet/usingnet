<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class FixWechatUserAvatarNotFound extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $contacts = \App\Models\Contact::where('openid', '<>', '')->get();
        foreach ($contacts as $contact) {
            $wechat = \App\Models\Setting\Wechat::where('team_id', $contact->team_id)->first();
            if ($wechat) {
                $resp = \App\Library\Curl::to($wechat->img . '-avatar');
                if (preg_match('/empty/', $resp)) {
                    $user = new \Gibson\Wechat\User($wechat->getAccessToken());
                    $userInfo = $user->get($contact->openid);
                    $img = \App\Services\Qiniu::upload(\App\Library\Curl::to($userInfo->headimgurl));
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
