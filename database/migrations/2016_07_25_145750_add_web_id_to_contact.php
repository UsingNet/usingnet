<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddWebIdToContact extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $teams = \App\Models\Team::all();
        foreach ($teams as $team) {
            $web = \App\Models\Setting\Web::where('team_id', $team->id)->orderBy('id', 'ASC')->first();
            if ($web) {
                \App\Models\Contact::where('team_id', $team->id)
                    ->where('web_id', 0)
                    ->update(['web_id' => $web->id]);
            }
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
