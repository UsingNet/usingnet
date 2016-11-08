<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateAppstorePayTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('appstore_pay', function($table) {
            $table->increments('id');
            $table->string('pay_no');
            $table->enum('status', ['INIT', 'PAYED']);
            $table->string('pay_config_id');
            $table->string('contact_id');
            $table->decimal('money', 15, 2)->default(0);
            $table->integer('team_id');
            $table->timestamps();
        });

        Schema::create('appstore_pay_config', function($table) {
            $table->increments('id');
            $table->string('app_id');
            $table->integer('team_id');
            $table->string('name');
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
