<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTeamPlanTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //
        Schema::create('team_plan', function ($table) {
            $table->increments('id');
            $table->string('name');
            $table->integer('team_id');
            $table->integer('plan_id');
            $table->integer('agent_num');
            $table->timestamp('start_at');
            $table->timestamp('end_at');
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
