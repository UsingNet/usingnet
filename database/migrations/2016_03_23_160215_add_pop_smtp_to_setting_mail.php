<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddPopSmtpToSettingMail extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('setting_mail', function (Blueprint $table) {
            $table->string('smtp')->after('id');
            $table->enum('smtp_mode', ['EXPRESS', 'ENCRYPTION'])->after('id');
            $table->string('imap')->after('id');
            $table->enum('imap_mode', ['EXPRESS', 'ENCRYPTION'])->after('id');
            $table->string('password')->after('id');
            $table->string('email')->after('id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('setting_mall', function (Blueprint $table) {
            //
        });
    }
}
