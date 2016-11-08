<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddTablePlan extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('plan', function ($table) {
            $table->increments('id');
            $table->string('name');
            $table->integer('message_save_time');
            $table->integer('agent_num');
            $table->integer('agent_account_num');
            $table->integer('user_num');
            $table->decimal('price', 15, 2)->default(0);
            $table->text('allows')->nullable();
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
