<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddEvaluationSetting extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('setting_wechat', function ($table) {
            $table->boolean('evaluation')->after('team_id');
        });
        Schema::table('setting_voip', function ($table) {
            $table->boolean('evaluation')->after('offworkprompt');
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
