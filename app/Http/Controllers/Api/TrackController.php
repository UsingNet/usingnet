<?php

namespace App\Http\Controllers\Api;


use Carbon;
use App\Models\Track;
use App\Models\Contact;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;

class TrackController extends Controller
{

    public function index(Request $request)
    {
        $handler = Track::where('track_id', $request->get('_id'))
            ->where('date', $request->get('date', date('Y-m-d')))
            ->where('team_id', $request->user()->team_id)
            ->orderBy('_id', 'desc');


        return $this->listToPage($handler, function ($items) {
            foreach ($items as $item) {
                $item->source = parse_source($item->referrer);
            }
        });
    }

    public function show($contactId)
    {

    }

    /**
     * app/Console/Commands/Track
     *
     * @param Request $request
     * @return null
     */
    public function store(Request $request)
    {

    }

}
