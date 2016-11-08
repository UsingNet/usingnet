<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddDnsToSettingMail extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('setting_mail', function (Blueprint $table) {
            $table->enum('status', ['INIT', 'CHECKING', 'SUCCESS'])->after('id');
            $table->text('dns')->after('domain');
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
