<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateGroupbuyTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('appstore_groupbuy', function($table) {
            $table->increments('id');
            $table->string('contact_id');
            $table->integer('groupbuy_config_id');
            $table->string('name');
            $table->string('phone');
            $table->timestamps();
        });

        Schema::create('appstore_groupbuy_member', function($table) {
            $table->increments('id');
            $table->string('contact_id');
            $table->integer('groupbuy_id');
            $table->string('name');
            $table->string('phone');
            $table->string('pay_no');
            $table->enum('status', ['INIT', 'SUCCESS']);
            $table->timestamps();
        });

        Schema::create('appstore_groupbuy_config', function($table) {
            $table->increments('id');
            $table->string('name');
            $table->string('desc');
            $table->string('img');
            $table->string('app_id');
            $table->integer('team_id');
            $table->string('qrcode');
            $table->integer('max_num');
            $table->integer('max_day');
            $table->decimal('deposit', 15, 2)->default(0);
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
