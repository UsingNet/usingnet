<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddImgToInviteSetting extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('setting_web', function (Blueprint $table) {
            $table->string('invite_img')->default('//o1hpnn7d6.qnssl.com/default-invite.png')->after('invite');
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
