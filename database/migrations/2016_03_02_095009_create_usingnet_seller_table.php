<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUsingnetSellerTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('team_seller', function ($table) {
            $table->increments('id');
            $table->string('userid');
            $table->string('weixinid');
            $table->string('name');
            $table->string('avatar');
            $table->string('position');
            $table->string('mobile');
            $table->tinyInteger('gender');
            $table->string('email');
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
    }
}
