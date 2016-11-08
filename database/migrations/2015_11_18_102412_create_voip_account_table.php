<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateVoipAccountTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //
        Schema::create('voip_account', function ($table) {
            $table->increments('id');
            $table->integer('user_id');
            $table->string('account_id');
            $table->string('account_token');
            $table->string('voip_id');
            $table->string('voip_pwd');
            $table->timestamps();
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
        Schema::drop('voip_account');
    }
}
