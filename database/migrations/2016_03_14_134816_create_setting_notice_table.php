<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSettingNoticeTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('setting_notice', function ($table) {
            $table->increments('id');
            $table->enum('voice', ['LONG', 'SHORT'])->default('SHORT');
            $table->enum('times', ['ONCE', 'MULIT'])->default('MULIT');
            $table->integer('team_id');
            $table->timestamps();
        });

        $teams = \App\Models\Team::all();
        foreach ($teams as $team) {
            \App\Models\Setting\Notice::firstOrCreate(['team_id' => $team->id]);
        }
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
