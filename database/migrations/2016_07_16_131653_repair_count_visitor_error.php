<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use App\Models\Track;
use App\Models\Contact;

class RepairCountVisitorError extends Migration
{
    /**
     * 丢失 22 天　访问数据
     *
     * @return void
     */
    public function up()
    {
        for ($i = 0; $i < 22; $i++) {
            $date = date('Y-m-d', strtotime('-'.$i.' days'));

            $_visitor = [];
            $tracks = Track::where('date', $date)->get();
            foreach ($tracks as $track) {
                if (!$track->track_id || !$track->team_id) {
                    continue;
                }

                $key = sprintf('count:visitor:%s%s%s', $track->team_id, $track->track_id, $date);
                if (isset($_visitor[$key])) {
                    $visitor = $_visitor[$key];
                } else {
                    $visitor = \App\Models\Visit::firstOrCreate([
                        'track_id' => $track->track_id,
                        'team_id' => $track->team_id,
                        'date' => $date
                    ]);
                    $visitor->times = 0;
                    $_visitor[$key] = $visitor;
                }
                if (!$visitor->times) {
                    $visitor->created_at = $track->created_at;
                    $visitor->referrer = $track->referrer;
                    // contact 的 referrer 取第一次 track 的 referrer
                    if (!$visitor->contact_id && $contact = Contact::where('track_id', $track->track_id)->first()) {
                        $visitor->contact_id = $contact->id;
                        $pkg = $contact->package;
                        $pkg['referrer'] = $visitor->referrer;
                        $contact->package = $pkg;
                        $contact->save();
                    }
                }

                $visitor->times++;
                $visitor->ip = $track->ip;
                $visitor->location = trim($track->location);
                $visitor->updated_at = $track->created_at;
                $visitor->user_agent = $track->user_agent;
            }

            foreach ($_visitor as $visitor) {
                $visitor->save();
            }
        }

        $visits  = \App\Models\Visit::all();
        foreach ($visits as $visit) {
            $visit->times = Track::where(['track_id' => $visit->track_id, 'team_id' => $visit->team_id, 'date' => $visit->date])->count();
            if (!$visit->times) {
                $visit->delete();
            } else {
                $visit->save();
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
