<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateBillTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //
        Schema::create('bill', function ($table) {
            $table->increments('id');
            $table->integer('team_id');
            $table->enum('type', ['AGENT_VOICE', 'AGENT_MAIL', 'TASK_MAIL', 'TASK_SMS', 'TASK_VOIP_RECORD', 'TASK_VOIP_STAFF', 'NEW_PLAN', 'UPDATE_PlAN', 'RENEWALS_PLAN']);
            $table->decimal('money', 15, 2)->default(0);
            $table->string('remark')->nullable();
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
