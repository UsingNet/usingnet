<?php

namespace App\Http\Controllers\Api\Setting;

use App\Models\Setting\Assign;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;

class AssignController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        return $this->responseJson(Assign::where('team_id', $request->user()->team_id)->first());
    }

    public function store(Request $request)
    {
        $params = $request->only('repeat', 'web', 'web_rule', 'voip', 'weibo', 'mail', 'wechat');
        $validator = Validator::make($params, [
            'repeat' => 'boolean',
            'web' => 'array',
            'web_rule' => 'array',
            'wechat' => 'array',
            'weibo' => 'array',
            'voip' => 'array',
            'mail' => 'array',
        ]);

        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        foreach ($params as $key => &$param) {
            if (is_array($param)) {
                //$param = array_unique($param);
            }

            if ($key === 'web_rule') {
               // $param = array_only($param, ['id', 'url']);
            }
        }


        $assign = Assign::where('team_id', $request->user()->team_id)->first();
        $assign->fill($params);
        $assign->save();

        return $this->responseJson($assign);
    }
}
