<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddOffworkpromptToSettingVoip extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('setting_voip', function (Blueprint $table) {
            $table->integer('offworkprompt')->after('bind_number');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('setting_voip', function (Blueprint $table) {
            //
        });
    }
}
