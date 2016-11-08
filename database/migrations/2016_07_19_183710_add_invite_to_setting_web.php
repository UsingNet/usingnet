<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddInviteToSettingWeb extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('setting_web', function (Blueprint $table) {
            $table->boolean('invite')->after('team_id');
            $table->integer('invite_wait_time')->after('invite');
            $table->integer('invite_text')->after('invite');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('setting_web', function (Blueprint $table) {
            //
        });
    }
}
