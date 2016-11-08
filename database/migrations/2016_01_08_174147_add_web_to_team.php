<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddWebToTeam extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('team', function (Blueprint $table) {
            //
            $table->string('web', 1000)->after('description')->default('{"title_bg_color":"000000","title_txt_color":"ffffff","button_bg_color":"0078e7","button_txt_color":"ffffff","message_left_bg_color":"f3f3f3","message_left_font_color":"000000","message_right_bg_color":"00a4f5","message_right_font_color":"ffffff","input_placeholder":"您有什么问题？","direction":"bottom-right"}');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('team', function (Blueprint $table) {
            //
        });
    }
}
