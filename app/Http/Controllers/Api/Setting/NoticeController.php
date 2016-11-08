<?php

namespace App\Http\Controllers\Api\Setting;

use Validator;
use App\Models\Setting\Notice;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class NoticeController extends Controller
{
    public function index(Request $request)
    {
        $notice = Notice::where('team_id', $request->user()->team_id)->first();

        return $this->responseJson($notice);
    }

    public function store(Request $request)
    {
        $data = $request->only('voice', 'times');
        $validator = Validator::make($data, [
            'voice' => 'required|in:' . implode(',', [Notice::TYPE_VOICE_LONG, Notice::TYPE_VOICE_SHORT]),
            'times' => 'required|in:' . implode(',', [Notice::TYPE_TIMES_ONCE, Notice::TYPE_TIMES_MULIT])
        ], [
            'voice.required' => '请选择提示声音',
            'voice.in' => '请选择正确的提示声音',
            'times.required' => '请选择提示方式',
            'times.in' => '请选择正确的提示方式'
        ]);

        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        $notice = $request->user()->team->notice;
        $notice->fill($data);
        $notice->save();

        return $this->responseJson($notice);
    }
}
