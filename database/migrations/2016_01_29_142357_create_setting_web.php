<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSettingWeb extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //
        Schema::dropIfExists('setting_web');

        Schema::create('setting_web', function ($table) {
            $table->increments('id');
            $table->integer('team_id');
            $table->string('title_bg_color')->default('000000');
            $table->string('title_txt_color')->default('ffffff');
            $table->string('button_bg_color')->default('0078e7');
            $table->string('button_txt_color')->default('ffffff');
            $table->string('message_left_bg_color')->default('f3f3f3');
            $table->string('message_left_font_color')->default('000000');
            $table->string('message_right_bg_color')->default('00a4f5');
            $table->string('message_right_font_color')->default('ffffff');
            $table->string('input_placeholder')->default('您有什么问题?');
            $table->string('direction')->default('bottom-left');
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
