<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ResetContactReferrer extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $contacts = \App\Models\Contact::where('package', 'like', '%javascript:;%')->get();
        foreach ($contacts as $contact) {
            $pkg = $contact->package;
            if ($pkg['referrer'] === 'javascript:;') {
                if (isset($pkg['user_agent']) && $pkg['user_agent'] === 'micromessenger') {
                    $pkg['referrer'] = 'micromessenger';
                } else {
                    $visit = \App\Models\Visit::where('track_id', $contact->track_id)->first();
                    if ($visit) {
                        $pkg['referrer'] = $visit->referrer;
                    } else {
                        $pkg['referrer'] = null;
                    }
                }
                $contact->package = $pkg;
                $contact->save();
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
