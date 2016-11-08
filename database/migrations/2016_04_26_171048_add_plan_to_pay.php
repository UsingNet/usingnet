<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddPlanToPay extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('pay', function ($table) {
            $table->enum('method', ['PLAN', 'RECHARGE'])->after('type');
            $table->integer('plan_id')->after('method')->nullable();
            $table->integer('agent_num')->after('plan_id')->nullable();
            $table->integer('year')->after('agent_num')->nullable();
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
