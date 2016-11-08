<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class FetchWechatAvatarToQiniu extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $wechats = \App\Models\Setting\Wechat::all();
        foreach ($wechats as $wechat) {
            if (!preg_match('/qiniu/', $wechat->head_img)) {
                $api = sprintf('https://api.weixin.qq.com/cgi-bin/component/api_get_authorizer_info?component_access_token=%s',
                    $wechat->getAccessToken());
                $response = \App\Library\Curl::to($api)
                    ->withData(['component_appid' => \Config::get('wechat.component.id'), 'authorizer_appid' => $wechat->app_id])
                    ->post();
                $userInfo = @json_decode($response, true);
                if (isset($userInfo['authorizer_info']['head_img'])) {
                    $con = file_get_contents($userInfo['authorizer_info']['head_img']);
                    $url = \App\Services\Qiniu::upload($con, 'jpg');
                    $wechat->head_img = $url;
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
