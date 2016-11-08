<?php

namespace App\Http\Controllers\Api\Setting;

use Validator;
use App\Models\Setting\Phrase;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class PhraseController extends Controller
{
    /**
     * 回复列表
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $handler = Phrase::where('team_id', $request->user()->team_id);

        if ($query = $request->get('query')) {
            $handler->where('content', 'like', "%{$query}%");
        }

        return $this->listToPage($handler);
    }

    /**
     * 添加回复
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $data = $request->only('content');
        $data['team_id'] = $request->user()->team_id;

        $validator = $this->validator($data);
        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        $phrase = Phrase::create($data);

        return $this->responseJson($phrase);
    }

    /**
     * 更新回复
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $data = array_filter($request->only('content', 'id'));
        $data['team_id'] = $request->user()->team_id;

        $validator = $this->validator($data);
        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        $phrase = Phrase::where(['team_id' => $request->user()->team_id, 'id' => $id])->first();

        if (!$phrase) {
            return $this->responseJsonError('回复不存在', 403);
        }

        $phrase->update($data);

        return $this->responseJson($phrase);
    }

    /**
     * 删除回复
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $id)
    {
        $phrase = Phrase::where(['id' => $id, 'team_id' => $request->user()->team_id])->first();
        if (!$phrase) {
            return $this->responseJsonError('回复不存在', 404);
        }

        return $this->responseJson($phrase->delete());
    }

    public function validator($data)
    {
        return $validator = Validator::make($data, [
            'content' => 'required_without:id|max:255|unique:setting_phrase,content,NULL,id,team_id,' . $data['team_id']
        ], [
            'content.required_without' => '内容不能为空',
            'content.max' => '内容不能大于255个字',
            'content.unique' => '内容已存在'
        ]);;
    }
}
