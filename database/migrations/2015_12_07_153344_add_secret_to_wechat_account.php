<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddSecretToWechatAccount extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('wechat_account', function (Blueprint $table) {
            $table->string('app_secret')->nullable()->after('app_id');
            $table->enum('type', ['AUTH', 'SETUP'])->after('id')->nullable();
            $table->string('encoding_aes_key')->nullable()->after('app_secret');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('wechat_account', function (Blueprint $table) {
            //
        });
    }
}
