<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateMediaTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //
        Schema::dropIfExists('media_article');
        Schema::dropIfExists('media_sms');
        Schema::dropIfExists('media_voice');

        Schema::create('media', function ($table) {
            $table->increments('id');
            $table->integer('user_id')->unsigned();
            $table->integer('team_id')->unsigned();
            $table->enum('type', ['MAIL', 'SMS', 'VOICE']);
            $table->string('title');
            $table->text('content');
            $table->integer('sent')->default(0);
            $table->integer('likes')->default(0);
            $table->integer('views')->default(0);
            $table->integer('refuses')->default(0);
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
