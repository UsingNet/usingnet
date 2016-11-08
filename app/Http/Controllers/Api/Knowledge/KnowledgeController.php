<?php

namespace App\Http\Controllers\Api\Knowledge;

use App\Http\Controllers\Controller;
use App\Models\Knowledge\Category;
use Illuminate\Http\Request;
use App\Models\Knowledge\Knowledge;
use Illuminate\Support\Facades\Validator;

class KnowledgeController extends Controller
{

    public function __construct()
    {
        $this->middleware('auth', ['except' => ['show']]);
    }

    /**
     * 问题列表
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $handler = Knowledge::where('team_id', $request->user()->team_id);
        if ($categoryId = $request->get('category_id')) {
            $handler->where('category_id', $categoryId);
        }

        return $this->listToPage($handler);
    }

    /**
     * 添加节点
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $data = $request->only('parent_note_id', 'title', 'keywords', 'message', 'category_id');

        $data['user_id'] = $request->user()->id;
        $data['team_id'] = $request->user()->team_id;
        $data['keywords'] = is_array($data['keywords']) ? $data['keywords'] : [];

        $validator = $this->validator($data);
        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode('', $errors), 403);
        }

        $exists = Knowledge::where(['team_id' => $request->user()->team_id, 'title' => $data['title']])->first();
        if ($exists) {
            return $this->responseJsonError('标题已存在', 403);
        }

        $knowledge = Knowledge::create($data);

        return $this->responseJson($knowledge);
    }

    /**
     * 显示节点
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request, $id)
    {
        $knowledge = Knowledge::where([ '_id' => $id])
            ->with('comments')
            ->first();

        if (!$knowledge) {
            if ($callback = $request->get('callback')) {
                echo sprintf('%s(%s)', $callback, json_encode(['code' => 403, 'data' => '节点不存在']));
                exit;
            }

            return $this->responseJsonError('节点不存在', 403);
        }

        if ($callback = $request->get('callback')) {
            echo sprintf('%s(%s)', $callback, json_encode($knowledge->toArray()));
            exit;
        }

        return $this->responseJson($knowledge);
    }

    /**
     * 修改节点
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $knowledge = Knowledge::where(['team_id' => $request->user()->team_id, '_id' => $id])->first();
        if (!$knowledge) {
            return $this->responseJsonError('节点不存在', 403);
        }

        $data = array_filter($request->all());
        $data['user_id'] = $request->user()->id;
        $data['_id'] = $knowledge->_id;
        $validator = $this->validator($data);

        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        if (!empty($data['title'])) {
            $exists = Knowledge::where(['team_id' => $request->user()->team_id, 'title' => $data['title']])
                ->where('_id', '<>', $id)
                ->first();
            if ($exists) {
                return $this->responseJsonError('标题已存在', 403);
            }
        }

        $knowledge->fill($data);
        $knowledge->save();

        return $this->responseJson($knowledge);
    }

    /**
     * 删除节点
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $id)
    {
        $knowledge = Knowledge::where(['team_id' => $request->user()->team_id, '_id' => $id])->first();
        if (!$knowledge) {
            return $this->responseJsonError('节点不存在', 403);
        }

        return $this->responseJson($knowledge->delete());
    }

    public function validator($data)
    {
        return Validator::make($data, [
            'title' => 'required_without:_id|min:2|max:50',
            'message' => 'required_without:_id|min:10',
            'category_id' => 'required_without:_id',
        ], [
            'title.required' => '标题不能为空',
            'title.min' => '标题为 2 - 50 个字',
            'title.max' => '标题为 2 - 50 个字',
            'message.required_without' => '消息不能为空',
            'message.min' => '内容不能少于 10 个字',
        ]);
    }
}