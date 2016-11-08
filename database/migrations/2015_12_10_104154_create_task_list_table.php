<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTaskListTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //
        Schema::create('task_list', function ($table) {
            $table->increments('id');
            $table->enum('status', ['INIT', 'COMPILE', 'FINISH'])->default('INIT');
            $table->integer('user_id')->nullable();
            $table->integer('task_id');
            $table->integer('team_id');
            $table->integer('contact_id');
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
