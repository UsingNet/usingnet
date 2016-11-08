<?php

namespace App\Http\Controllers\Api\Media;

use App\Http\Requests;
use App\Models\Message;
use Illuminate\Http\Request;
use App\Models\Media;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;

class ArticleController extends Controller
{
    /**
     * 邮件模板列表
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $media = Media::where(['team_id' => $request->user()->team_id, 'type' => Media::TYPE_MAIL]);
        if ($status = $request->get('status')) {
            $media->where('status', $status);
        }

        return $this->listToPage($media);
    }

    /**
     * 添加邮件模板
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $data = $request->only('title', 'content');
        $data['team_id'] = $request->user()->team_id;
        $data['user_id'] = $request->user()->id;
        $data['type'] = Media::TYPE_MAIL;
        $data['status'] = Media::STATUS_SUCCESS;

        $v = $this->validator($data);
        if ($v->fails()) {
            $errors = $v->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        return $this->responseJson(Media::create($data));
    }

    /**
     * 显示邮件模板
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request, $id)
    {
        $meida = Media::where(['id' => $id, 'team_id' => $request->user()->team_id, 'type' => Media::TYPE_MAIL])->first();
        if (!$meida) {
            return $this->responseJsonError('模板不存在', 404);
        }

        return $this->responseJson($meida);
    }

    /**
     * 更新模板
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $data = $request->all();
        $media = Media::where(['id' => $id, 'team_id' => $request->user()->team_id])->first();
        $data['type'] = $media->type;
        $data['team_id'] = $media->team_id;
        if (!$media) {
            return $this->responseJsonError('文章不存在', 404);
        }

        $v = $this->validator($data, $id);
        if ($v->fails()) {
            $errors = $v->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        $media->update($data);

        return $this->responseJson($media);
    }

    /**
     * 删除模板
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $id)
    {
        $media = Media::where(['id' => $id, 'team_id' => $request->user()->team_id])->first();
        if (!$media) {
            return $this->responseJsonError('文章不存在', 404);
        }

        return $this->responseJson($media->delete());
    }

    public function validator($data, $id = NULL)
    {
        return Validator::make($data, [
            'title' => sprintf('required_without:id|unique:media,title,%s,id,team_id,%s,type,%s', $id, $data['team_id'], $data['type']),
            'content' => 'required_without:id'
        ], [
            'title.required_without' => '请填写模板标题',
            'title.unique' => '标题已存在',
            'content.required_without' => '请填写模板内容'
        ]);
    }
}
