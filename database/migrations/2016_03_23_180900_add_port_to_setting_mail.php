<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddPortToSettingMail extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('setting_mail', function (Blueprint $table) {
            $table->string('imap_port')->after('id');
            $table->string('smtp_port')->after('id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('setting_mail', function (Blueprint $table) {
            //
        });
    }
}
