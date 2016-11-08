<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSettingAssignTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('setting_assign', function ($table) {
            $table->increments('id');
            $table->integer('team_id');
            $table->boolean('repeat')->default(false);
            $table->string('web');
            $table->string('wechat');
            $table->string('weibo');
            $table->string('voip');
            $table->string('mail');
            $table->text('web_rule');
            $table->timestamps();
        });

        $teams = \App\Models\Team::all();
        foreach ($teams as $team) {
            \App\Models\Setting\Assign::firstOrCreate([
                'team_id' => $team->id
            ]);
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
