<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddPluginYouzanTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('plugin_youzan', function ($table) {
            $table->increments('id');
            $table->string('name');
            $table->string('logo');
            $table->integer('sid');
            $table->integer('wexin_id');
            $table->string('url');
            $table->integer('team_id');
            $table->string('access_token');
            $table->string('expires_in');
            $table->string('refresh_token');
            $table->string('scope');
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
