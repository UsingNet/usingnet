<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddDefaultReplayToWeiboAndWeixin extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('setting_weibo', function ($table) {
            $table->text('default_reply');
            $table->text('not_online_agent_reply');
        });

        Schema::table('setting_wechat', function ($table) {
            $table->text('default_reply');
            $table->text('not_online_agent_reply');
        });
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
