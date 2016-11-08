<?php

namespace App\Http\Controllers\V2;

use Validator;
use App\Models\Option;
Use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class OptionController extends Controller
{

    public function index(Request $request)
    {
        return $this->listToPage(Option::where('team_id', $request->user()->team_id));
    }

    public function store(Request $request)
    {
        $data = $request->all();
        $data['team_id'] = $request->user()->team_id;
        $validator = $this->validator($data);

        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        return $this->responseJson(Option::create($data));
    }

    public function show(Request $request, $id)
    {
        $option = Option::where(['team_id' => $request->user()->team_id, 'id' => $id])->first();
        if (!$option) {
            return $this->responseJsonError('配置不存在', 404);
        }

        return $this->responseJson($option);
    }

    public function update(Request $request, $id)
    {
        $data = $request->all();
        $validator = $this->validator($data);

        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        $option = Option::where(['team_id' => $request->user()->team_id, 'id' => $id])->first();
        if (!$option) {
            return $this->responseJsonError('配置不存在', 404);
        }

        $option->fill($data);

        return $this->responseJson($option->save());
    }

    public function destroy(Request $request, $id)
    {
        $option = Option::where(['team_id' => $request->user()->team_id, 'id' => $id])->first();
        if (!$option) {
            return $this->responseJsonError('配置不存在', 404);
        }

        return $this->responseJson($option->delete());
    }

    public function validator(array $data)
    {
        return Validator::make($data, [
            'key' => 'required',
            'value' => 'required'
        ], [
            'key.required' => '名称不能为空',
            'value.required' => '内容不能为空'
        ]);
    }
}