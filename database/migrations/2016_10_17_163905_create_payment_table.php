<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePaymentTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('payment', function($table) {
            $table->increments('id');
            $table->enum('status', ['INIT', 'FAIL', 'SUCCESS', 'TIMEOUT'])->default('INIT');
            $table->decimal('fee', 15, 2)->default(0);
            $table->enum('type', ['ALIPAY', 'WEPAY']);
            $table->string('trade_no', 100);
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
