<?php

namespace App\Http\Controllers\V2;

use Validator;
use App\Models\Tag;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class TagController extends Controller
{

    /**
     * 标签列表
     * @param Request $request
     * @return mixed
     */
    public function index(Request $request)
    {
        $handler = Tag::where('team_id',$request->user()->team_id)->orderBy('id', 'desc');
        if ($query = $request->get('query')) {
            $handler->where('name', 'like', '%'.$query.'%');
        }
        $tags = $handler->get();

        return $this->responseJson($tags);
    }

    /**
     * 添加标签
     * @param Request $request
     * @return mixed
     */
    public function store(Request $request)
    {
        $data = $request->only('name', 'color');
        $data['team_id'] = $request->user()->team_id;
        $validator = $this->validator($data);

        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        return $this->responseJson(Tag::create($data));
    }

    /**
     * 显示标签
     * @param Request $request
     * @param $id
     * @return mixed
     */
    public function show(Request $request, $id)
    {
        $tag = Tag::where(['team_id' => $request->user()->team_id, 'id' => $id])->first();

        if(!$tag){
            return $this->responseJsonError('标签不存在', 404);
        }

        return $this->responseJson($tag);
    }

    /**
     * 更新标签
     * @param Request $request
     * @param $id
     * @return mixed
     */
    public function update(Request $request, $id)
    {
        $tag = Tag::where(['team_id' => $request->user()->team_id, 'id' => $id])->first();

        if(!$tag){
            return $this->responseJsonError('标签不存在', 404);
        }

        $data = $request->all();
        $validator = $this->validator($data);
        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        return $this->responseJson($tag->update($data));
    }

    /**
     * 删除标签
     * @param Request $request
     * @param $id
     * @return mixed
     */
    public function destroy(Request $request, $id)
    {
        $tag = Tag::where(['team_id' => $request->user()->team_id, 'id' => $id])->first();

        if(!$tag){
            return $this->responseJsonError('标签不存在', 404);
        }

        \DB::table('user_tag')->where('tag_id', $id)->delete();
        \DB::table('contact_tag')->where('tag_id', $id)->delete();

        return $this->responseJson($tag->delete());
    }

    public function validator(array $data)
    {
        return Validator::make($data, [
            'name' => 'required_without:id|min:2|max:10',
        ], [
            'name.required' =>  '标签名不能为空',
            'name.min' => '标签只能为 2-10 个字',
            'name.max' => '标签只能为 2-10 个字'
        ]);
    }
}
