<?php

namespace App\Console\Commands;

use App\Models\Contact;
use App\Models\Track as TrackModel;
use App\Models\Visit;
use Carbon\Carbon;
use Illuminate\Console\Command;

class CountVisitor extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'count:visitor';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $_visitor = [];
        $limit = 10000;
        $firstTrack = null;
        $lastTrack = null;
        do {
            $tracks = TrackModel::where('counted', 'exists', false)->take($limit)->orderBy('_id', 'asc')->get();
            foreach ($tracks as $n => $track) {
                if ($n === 0) {
                    $firstTrack = $track;
                }
                $lastTrack = $track;
                $date = date('Y-m-d', $track->created_at->timestamp);
                $key = sprintf('count:visitor:%s:%s', $track->team_id, $track->track_id);
                if (isset($_visitor[$key])) {
                    $visitor = $_visitor[$key];
                } else {
                    $visitor = Visit::firstOrCreate([
                        'track_id' => $track->track_id,
                        'team_id' => $track->team_id,
                        'date' => $date
                    ]);

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
                $visitor->location = $track->location;
                $visitor->updated_at = $track->created_at;
                $visitor->user_agent = $track->user_agent;
            }

            if (count($_visitor) > 1000) {
                foreach ($_visitor as $visitor) {
                    $visitor->save();
                }

                $_visitor = [];
            }

            if ($firstTrack && $lastTrack) {
                TrackModel::where('_id', '<=', $lastTrack->_id)
                    ->where('_id', '>=', $firstTrack->_id)
                    ->update(['counted' => true]);
            }
        } while (isset($tracks[0]));

        foreach ($_visitor as $visitor) {
            $visitor->save();
        }
    }
}
