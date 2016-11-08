<?php

namespace App\Http\Controllers\Api;

use App\Library\IP;
use App\Models\Contact;
use App\Models\CustomerManage;
use App\Models\Order;
use App\Services\Connect;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class VisitorController extends Controller
{
    public function getIndex()
    {
    }

    public function getOnline(Request $request)
    {
        $teamToken = $request->user()->team->token;
        $connect = new Connect(Connect::ONLINE_SERVER);
        $onlines = $connect->online($teamToken)['online'];

        usort($onlines, function ($a, $b) {
            return $a['created_at'] < $b['created_at'];
        });

        $trackIds = array_fetch($onlines, 'track_id');
        $contacts = Contact::where('team_id', $request->user()->team_id)
            ->whereIn('track_id', $trackIds)
            ->get();

        $pairs = [];
        foreach ($contacts as $contact) {
            $pairs[$contact->track_id] = $contact->toArray();
        }

        $inDialogContactIds = Order::where('team_id', $request->user()->team_id)
            ->where('status', Order::STATUS_OPEN)
            ->lists('contact_id')
            ->toArray();

        $contacts = [];
        foreach ($onlines as $i => $online) {
            $page = [
                'url' => $online['url'],
                'title' => $online['title'],
                'created_at' => $online['created_at']
            ];

            $existsTrackIds = array_fetch($contacts, 'track_id');
            if (in_array($online['track_id'], $existsTrackIds)) {
                foreach ($contacts as &$item) {
                    if ($online['track_id'] === $item['track_id']) {
                        $item['pages'][] = $page;
                    }
                }
                continue;
            }

            $contact = [
                'status' => 'UNDIALOG',
                'contact_id' => 0,
                'track_id' => $online['track_id'],
                'pages' => [$page],
                'user_agent' => $online['user_agent']
            ];

            if (isset($pairs[$online['track_id']]))  {
                $contact['contact_id'] = $pairs[$online['track_id']]['id'];
                $contact['name'] = $pairs[$online['track_id']]['name'];
                if (in_array($contact['contact_id'], $inDialogContactIds)) {
                    $contact['status'] = 'DIALOG';
                }
            } else {
                $location = IP::find($online['ip']);
                $contact['name'] = trim($location[1] . ' ' . $location[2]) . ' 的访客';
            }

            $contacts[] = $contact;
        }


        return $this->responseJson(['data' => $contacts]);
    }
}
