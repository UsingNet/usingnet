<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateVoteQrcode extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $votes = \App\Models\Appstore\Vote::all();
        foreach ($votes as $vote) {
           if ($vote->qrcode) {
               $qrcode = \App\Models\Qrcode\Qrcode::where('url', $vote->qrcode)->first();
               $voteConfig = \App\Models\Appstore\VoteConfig::where('_id', $vote->vote_config_id)->first();
               $wechat = \App\Models\Setting\Wechat::where('app_id', $voteConfig->app_id)->first();
               if ($qrcode) {
                   $sceneId = \App\Models\Qrcode\Qrcode::genSceneId();
                   try {
                       $qrcode = new \Gibson\Wechat\QRCode($wechat->getAccessToken());
                       $result = $qrcode->temporary($sceneId, 30 * 24 * 3600);
                   } catch(\Exception $e) {
                       return $this->responseJsonError($e->getMessage(), 403);
                   }
                   $url = 'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=' . $result->ticket;
                   $con = Curl::to($url)->get();
                   $url = Qiniu::upload($con);
                   $qrcode->update([
                       'url' => $url,
                       'scene_id' => $sceneId
                   ]);

                   $vote->update(['qrcode' => $url]);
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
