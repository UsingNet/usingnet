<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddTypeToQuickReply extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('setting_quick_reply', function (Blueprint $table) {
            $table->integer('team_id')->after('id');
            $table->enum('type', ['PERSONAL', 'COMMON'])->after('user_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('setting_quick_reply', function (Blueprint $table) {
            //
        });
    }
}
