<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSystemMeidaTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('system_media', function (Blueprint $table) {
            $table->increments('id');
            $table->enum('type', ['MAIL', 'SMS', 'VOICE']);
            $table->string('tpl_id')->nullable();
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
