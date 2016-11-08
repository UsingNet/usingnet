<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTaskTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //
        Schema::create('task', function ($table) {
            $table->increments('id');
            $table->string('title');
            $table->integer('team_id');
            $table->integer('user_id');
            $table->integer('media_id')->nullable();
            $table->integer('jobs');
            $table->integer('progress')->default(0);
            $table->enum('status', ['INIT', 'COMPILE', 'FINISH']);
            $table->enum('type', ['MAIL', 'SMS', 'VOIP_RECORD', 'VOIP_STAFF']);
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
