<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddDisplayNumberToSettingVoip extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('setting_voip', function ($table) {
            $table->string('display_number')->after('bind_number');
            $table->enum('display_number_status', ['INIT', 'CHECKING', 'SUCCESS'])->after('display_number');
            $table->string('display_number_files')->after('display_number_status');
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
