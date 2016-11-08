<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateAdminTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //
        Schema::create('admin', function ($table) {
            $table->increments('id');
            $table->string('email');
            $table->string('img')->default('//o1hpnn7d6.qnssl.com/559acf0ddadec0cb05db1eb391aec759.jpg-avatar');
            $table->string('serial');
            $table->string('remember_token');
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
