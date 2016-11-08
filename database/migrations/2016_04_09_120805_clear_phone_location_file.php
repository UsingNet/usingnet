<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ClearPhoneLocationFile extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::drop('phone_location');
        @unlink(base_path('database/migrations/phone.data'));
        @unlink(base_path('database/migrations/2015_12_21_203341_create_table_phone_location.php'));
        @unlink(base_path('database/migrations/2016_04_09_120805_clear_phone_location_file.php'));
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
