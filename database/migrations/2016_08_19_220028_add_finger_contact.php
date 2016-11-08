<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddFingerContact extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $contacts = \App\Models\Contact::where('wechat_fingerprint', '')
            ->where('unionid', '<>', '')
            ->where('openid', '<>', '')
            ->get();

        foreach ($contacts as $contact) {
            $wechat = \App\Models\Setting\Wechat::find($contact->wechat_id);
            if ($wechat) {
                $user = new \Gibson\Wechat\User($wechat->getAccessToken());
                $userInfo = $user->get($contact->openid);
                if ($userInfo) {
                    $finger = md5(\App\Library\Curl::to($userInfo->headimgurl) . $userInfo->nickname);
                    $wechat->wechat_fingerprint = $finger;
                    $wechat->save();
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
