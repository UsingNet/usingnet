<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTableSettingSms extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //
        Schema::create('setting_sms', function ($table) {
            $table->increments('id');
            $table->integer('team_id');
            $table->string('signature');
            $table->enum('status', ['INIT', 'FAIL', 'SUCCESS', 'CHECKING']);
            $table->string('fail_message')->nullable();
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
