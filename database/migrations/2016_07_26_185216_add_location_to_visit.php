<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddLocationToVisit extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('setting_web', function ($table) {
            $table->text('invite_text')->after('invite');
        });

        $visits = \App\Models\Visit::where('location', null)->get();
        foreach ($visits as $visit) {
            $track = \App\Models\Track::where('track_id', $visit->track_id)->first();
            if ($track) {
                $visit->update(['location' => $track->location]);
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
