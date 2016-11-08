<?php

namespace App\Http\Controllers\V2;


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
        $handler = Track::where('contact_id', $request->get('id'))
            ->where('team_id', intval($request->user()->team_id))
            ->orderBy('_id', 'desc');

        return $this->listToPage($handler, function ($items) {
            foreach ($items as $item) {
                $item->source = parse_source($item->referrer);
            }
        });
    }
}
