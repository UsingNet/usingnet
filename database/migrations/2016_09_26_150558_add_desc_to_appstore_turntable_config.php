<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddDescToAppstoreTurntableConfig extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('appstore_turntable_config', function (Blueprint $table) {
            $table->text('desc')->after('qrcode');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('appstore_turntable_config', function (Blueprint $table) {
            //
        });
    }
}
