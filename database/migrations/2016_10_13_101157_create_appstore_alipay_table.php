<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateAppstoreAlipayTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('appstore_alipay', function($table) {
            $table->increments('id');
            $table->string('pay_no');
            $table->enum('status', ['INIT', 'SUCCESS']);
            $table->string('alipay_config_id');
            $table->string('contact_id');
            $table->decimal('money', 15, 2)->default(0);
            $table->integer('team_id');
            $table->timestamps();
        });

        Schema::create('appstore_alipay_config', function($table) {
            $table->increments('id');
            $table->integer('team_id');
            $table->string('name');
            $table->string('img');
            $table->string('qrcode');
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
