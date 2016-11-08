<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddTableToTruntable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('turntable_lottery', function($table) {
            $table->increments('id');
            $table->string('contact_id');
            $table->string('config_id');
            $table->string('staff_id');
            $table->integer('team_id');
            $table->timestamps();
        });

        Schema::create('turntable_config', function($table) {
            $table->increments('id');
            $table->integer('team_id');
            $table->string('app_id');
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('turntable_staff', function($table) {
            $table->increments('id');
            $table->string('config_id');
            $table->string('img');
            $table->string('name');
            $table->integer('num')->default(1);
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
