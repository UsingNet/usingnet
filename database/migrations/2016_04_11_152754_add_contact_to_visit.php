<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddContactToVisit extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $visits = \App\Models\Visit::all();
        foreach ($visits as $visit) {
            $contact = \App\Models\Contact::where('track_id', $visit->track_id)->first();
            if ($contact) {
                $visit->update(['contact_name' => $contact->name]);
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
