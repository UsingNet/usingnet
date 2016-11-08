<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSettingSupportTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('setting_support', function ($table) {
            $table->increments('id');
            $table->string('domain');
            $table->string('theme')->default('default');
            $table->integer('team_id');
            $table->timestamps();
        });

        $teams = \App\Models\Team::all();
        foreach ($teams as $team) {
            \App\Models\Setting\Support::create(['team_id' => $team->id]);
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
