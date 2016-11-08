<?php

namespace App\Http\Controllers\Api\Setting;

use App\Models\Setting\AutoReply;
use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;

class AutoreplyController extends Controller
{
    /**
     * 自动回复
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $reply = AutoReply::firstOrCreate(['team_id' => $request->user()->team_id]);

        return $this->responseJson($reply);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $reply = AutoReply::firstOrCreate(['team_id' => $request->user()->team_id]);

        if (is_array($request->get('welcome'))) {
            $data = array_only($request->get('welcome'), ['status', 'message']);
            $reply->welcome = array_merge([
                'status' => 'close',
                'message' => '',
            ], $data);
        }

        if (is_array($request->get('timeout'))) {
            $data = array_only($request->get('timeout'), ['status', 'message', 'timeout']);
            $reply->timeout = array_merge([
                'status' => 'open',
                'message' => '',
                'timeout' => 60
            ], $data);
        }

        if (is_array($request->get('bye'))) {
            $data = array_only($request->get('bye'), ['status', 'message']);
            $reply->bye = array_merge([
                'status' => 'open',
                'message' => '',
            ], $data);
        }

        if (is_array($request->get('offwork'))) {
            $data = array_only($request->get('offwork'), ['status', 'message']);
            $reply->offwork = array_merge([
                'status' => 'open',
                'message' => '',
            ], $data);
        }


        
        $reply->save();
        
        return $this->responseJson($reply);
    }

}
