<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddSettingTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('team', function ($table) {
            $table->dropColumn(['img', 'phone', 'ivr_number', 'worktime', 'offworkweekday', 'offworkdate', 'offworkprompt', 'voip']);
            $table->string('logo')->nullable()->after('name');
        });

        Schema::create('setting_mail', function ($table) {
            $table->increments('id');
            $table->integer('team_id');
            $table->string('localname')->nullable();
            $table->string('domain')->nullable();
            $table->timestamps();
        });

        Schema::create('setting_sms', function ($table) {
            $table->increments('id');
            $table->integer('team_id');
            $table->string('phone')->nullable();
            $table->string('signature')->nullable();
            $table->enum('status', ['CHECKING', 'FAIL', 'SUCCESS'])->nullable();
            $table->string('fail_message')->nullable();
            $table->timestamps();
        });

        Schema::create('setting_voip', function ($table) {
            $table->increments('id');
            $table->integer('team_id');
            $table->enum('status', ['CHECKING', 'SUCCESS']);
            $table->string('number')->nullable();
            $table->string('bind_number')->nullable();
            $table->string('worktime')->nullable();
            $table->string('offworkweekday')->nullable();
            $table->string('offworkdate')->nullable();
            $table->string('offworkprompt')->nullable();
            $table->timestamps();
        });

        Schema::create('setting_web', function ($table) {
            $table->increments('id');
            $table->integer('team_id');
            $table->string('title_bg_color')->nullable();
            $table->string('title_txt_color')->nullable();
            $table->string('button_bg_color')->nullable();
            $table->string('button_txt_color')->nullable();
            $table->string('direction')->nullable();
            $table->timestamps();
        });

        Schema::create('setting_wechat', function ($table) {
            $table->increments('id');
            $table->string('app_id');
            $table->string('app_secret')->nullable();
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
            $table->enum('type', ['AUTH', 'SETUP']);
            $table->string('token')->nullable();
            $table->string('encoding_aes_key')->nullable();
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
