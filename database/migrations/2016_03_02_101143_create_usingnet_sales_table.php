<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUsingnetSalesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('team_sales', function ($table) {
            $table->increments('id');
            $table->integer('seller_id');
            $table->integer('user_id');
            $table->integer('promo_id');
            $table->integer('plan_id');
            $table->decimal('meony', 15, 2);
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
