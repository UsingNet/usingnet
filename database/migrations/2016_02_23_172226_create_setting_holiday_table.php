<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSettingHolidayTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('setting_holiday', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('team_id');
            $table->string('date');
            $table->boolean('work');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('holiday', function (Blueprint $table) {
            //
        });
    }
}
