<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddImLmToSettingWeb extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        \DB::select(\DB::raw('alter table setting_web change type type enum("IM-LM", "IM", "ORDER")'));

        \DB::table('setting_web')->update(['type' => 'IM-LM']);
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
