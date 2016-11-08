<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddWechatIdToQrcode extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $qrcodes = \App\Models\Qrcode\Qrcode::where('wechat_id', 'exists', false)->get();
        foreach ($qrcodes as $qrcode) {
            $wechat = \App\Models\Setting\Wechat::where('team_id', $qrcode->team_id)->first();
            $qrcode->wechat_id = $wechat->id;
            $qrcode->save();
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
