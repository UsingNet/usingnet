<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSmsSignatureTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //
        Schema::create('sms_signature', function ($table) {
            $table->increments('id');
            $table->integer('team_id');
            $table->string('signature');
            $table->enum('status', ['CHECKING', 'FAIL', 'SUCCESS'])->default('CHECKING')->after('id');
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
