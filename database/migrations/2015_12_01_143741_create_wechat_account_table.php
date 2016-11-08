<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateWechatAccountTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //
        Schema::create('wechat_account', function ($table) {
            $table->increments('id');
            $table->string('app_id');
            $table->integer('team_id')->nullable;
            $table->string('nick_name')->nullable();
            $table->string('user_name')->nullable();
            $table->string('head_img')->nullable();
            $table->integer('service_type_info')->nullable();
            $table->integer('verify_type_info')->nullable();
            $table->string('business_info')->nullable();
            $table->string('alias')->nullable();
            $table->string('qrcode_url')->nullable();
            $table->string('func_info')->nullable();
            $table->string('access_token')->nullable();
            $table->string('expires_in')->nullable();
            $table->string('refresh_token')->nullable();
            $table->timestamps();
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
