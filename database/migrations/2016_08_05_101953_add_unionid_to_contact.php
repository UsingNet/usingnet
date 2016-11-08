<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddUnionidToContact extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $contact = \App\Models\Contact::where('openid', '<>', '')
            ->whereNull('unionid')
            ->get();

        foreach ($contact as $contact) {
            try {
                $wechat = \App\Models\Setting\Wechat::find($contact->wechat_id);
                if ($wechat) {
                    $user = new \Gibson\Wechat\User($wechat->getAccessToken());
                    $userInfo = $user->get($contact->openid);
                    $contact->update(['unionid' => $userInfo->unionid]);
                }
            } catch (\Exception $e) {
                var_dump($contact->id);
                var_dump($e->getMessage());
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
