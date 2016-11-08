<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddSubscribeMessageToSettingWechat extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('setting_wechat', function (Blueprint $table) {
            $table->text('subscribe_reply')->after('not_online_agent_reply');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('setting_wechat', function (Blueprint $table) {
            //
        });
    }
}
