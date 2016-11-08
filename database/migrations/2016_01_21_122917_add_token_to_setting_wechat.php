<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddTokenToSettingWechat extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('setting_wechat', function (Blueprint $table) {
            $table->enum('mode', ['EXPRESS', 'ENCRYPTION'])->default('EXPRESS')->after('encoding_aes_key');
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
