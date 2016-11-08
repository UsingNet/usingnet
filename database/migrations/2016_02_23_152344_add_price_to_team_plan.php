<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddPriceToTeamPlan extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('team_plan', function (Blueprint $table) {
            $table->integer('year')->after('plan_id');
            $table->decimal('price', 15, 2)->after('year');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('team_plan', function (Blueprint $table) {
            //
        });
    }
}
