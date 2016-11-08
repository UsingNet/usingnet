<?php

namespace App\Http\Controllers\V2\Setting;

use Illuminate\Support\Facades\Artisan;
use Validator;
use App\Models\Setting\Sms;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class SmsController extends Controller
{
    /**
     * 短信接入
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $sms = Sms::where('team_id', $request->user()->team_id)->first();

        return $this->responseJson($sms);
    }

    /**
     * 保存短信接入
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $data = array_filter($request->only('signature', 'phone'));

        $validator = Validator::make($data, [
            'signature' => 'min:2|max:6'
        ], [
            'signature.required' => '签名不能为空',
            'signature.min' => '签名为 2-6 个字',
            'signature.max' => '签名为 2-6 个字'
        ]);

        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        $sms = Sms::where('team_id', $request->user()->team_id)->first();

        if (isset($data['signature']) && $sms->signature != $data['signature']) {
            $sms->status = Sms::STATUS_CHECKING;
            // 通知管理员审核短信签名
            Sms::signatureNotice($request->user()->team, $data['signature']);
        }

        $sms->fill($data);
        $sms->save();

        return $this->responseJson($sms);
    }
}
