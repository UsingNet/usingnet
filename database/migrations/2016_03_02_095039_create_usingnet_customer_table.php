<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUsingnetCustomerTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //
        Schema::create('team_customer', function ($table) {
            $table->increments('id');
            $table->integer('seller_id');
            $table->enum('status', ['VISITED', 'UNVISIT', 'SOLD', 'UNSOLD']);
            $table->string('name');
            $table->string('avatar');
            $table->string('email');
            $table->string('mobile');
            $table->string('phone');
            $table->string('address');
            $table->text('note')->nullable();
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
