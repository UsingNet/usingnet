<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateEvaluationTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //
        Schema::create('evaluation', function ($table) {
            $table->increments('id');
            $table->integer('team_id');
            $table->integer('user_id');
            $table->integer('order_id');
            $table->enum('level', ['BAD', 'GOOD', 'GENERAL']);
            $table->text('content')->nullable();
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
