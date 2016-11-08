<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePayTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //
        Schema::create('pay', function ($table) {
            $table->increments('id');
            $table->string('remark')->nullable();
            $table->integer('team_id');
            $table->integer('user_id');
            $table->decimal('money', 15, 2)->default(0);
            $table->enum('type', ['ALIPAY', 'TENPAY', 'RETURN']);
            $table->enum('status', ['INIT', 'FAIL', 'SUCCESS'])->default('INIT');
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
