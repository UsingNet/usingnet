<?php

namespace App\Http\Controllers\V2\Setting;


use App\Models\Setting\Support;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SupportController extends Controller
{
    public function getIndex(Request $request)
    {
        $support = Support::where('team_id', $request->user()->team_id)->first();
        return $this->responseJson(['data' => $support]);
    }

    public function postIndex(Request $request)
    {
        $data = $request->only('domain', 'theme');
        $data['team_id'] = $request->user()->team_id;

        $validator = $this->validator($data);
        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        $support = Support::where('team_id', $request->user()->team_id)->first();
        $support->fill($data);
        $support->save();

        return $this->responseJson(['data' => $support]);
    }

    public function validator(array $data)
    {
        return Validator::make($data, [
            'domain' => 'required',
            'theme' => 'required'
        ], [
            'domain.required' => '域名不能为空',
            'theme.required' => '主题不能你为空'
        ]);
    }

}