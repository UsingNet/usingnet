<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSettingVoipTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //
        Schema::create('setting_voip', function ($table) {
            $table->increments('id');
            $table->enum('status', ['INIT', 'CHECKING', 'SUCCESS'])->default('INIT');
            $table->integer('team_id');
            $table->string('number')->nullable();
            $table->string('bind_number')->nullable();
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
