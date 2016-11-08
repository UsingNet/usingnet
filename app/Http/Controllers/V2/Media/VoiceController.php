<?php

namespace App\Http\Controllers\V2\Media;

use App\Models\Attachment;
use App\Services\Voip;
use App\Http\Requests;
use Illuminate\Http\Request;
use App\Models\Media;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Artisan;

class VoiceController extends Controller
{
    /**
     * 语音文件列表
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $media = Media::where(['team_id' => $request->user()->team_id, 'type' => Media::TYPE_VOICE]);
        if ($status = $request->get('status')) {
            $media->where('status', $status);
        }

        return $this->listToPage($media);
    }

    /**
     * 添加语言文件
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $data = $request->only('title', 'content');
        $data['team_id'] = $request->user()->team_id;
        $data['user_id'] = $request->user()->id;
        $data['type'] = Media::TYPE_VOICE;
        $v = $this->validator($data);

        if ($v->fails()) {
            $errors = $v->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        if (!preg_match('/wav$/', $data['content'])) {
            return $this->responseJsonError('只支持 wav 格式语音文件', 403);
        }

        Attachment::where('src', $data['content'])->increment('ref');

        try {
            $this->uploadMedia($data['content']);
        } catch (\Exception $e) {
            return $this->responseJsonError($e->getMessage(), 403);
        }

        $media = Media::create($data);

        return $this->responseJson($media);
    }

    /**
     * 显示语言文件
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request, $id)
    {
        $voice = Media::where(['id' => $id, 'team_id' => $request->user()->team_id])->first();
        if (!$voice) {
            return $this->responseJsonError('语音不存在', 404);
        }

        return $this->responseJson($voice);
    }

    /**
     * 更新语言文件
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $data = $request->all();
        $voice = Media::where(['id' => $id, 'team_id' => $request->user()->team_id])->first();
        $data['status'] = Media::STATUS_AUDIT;
        $data['team_id'] = $voice->team_id;
        $data['type']  = $voice->type;
        if (!$voice) {
            return $this->responseJsonError('语音不存在', 404);
        }

        $v = $this->validator($data, $id);
        if ($v->fails()) {
            $errors = $v->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        try {
            $this->uploadMedia($data['content']);
        } catch (\Exception $e) {
            return $this->responseJsonError($e->getMessage(), 403);
        }

        Attachment::where('src', $data['content'])->increment('ref');
        Attachment::where('src', $voice->content)->increment('ref', -1);

        $voice->update($data);

        return $this->responseJson($voice);
    }

    /**
     * 删除语言文件
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $id)
    {
        $voice = Media::where(['id' => $id, 'team_id' => $request->user()->team_id])->first();
        if (!$voice) {
            return $this->responseJsonError('语音不存在', 404);
        }

        Attachment::where('src', $voice->content)->increment('ref', -1);
        $pair = explode('/', $voice->content);
        $filename = end($pair);
        // 云通讯删除
        Artisan::call('Yuntongxun', [
            'delete' => $filename
        ]);

        return $this->responseJson($voice->delete());
    }

    public function validator($data, $id = null)
    {
        return Validator::make($data, [
            'title' => sprintf('required_without:id|unique:media,title,%s,id,team_id,%s,type,%s', $id, $data['team_id'], $data['type']),
            'content' => 'required_without:id'
        ], [
            'title.required_without' => '请填写录音文件标题',
            'content.required_without' => '内容不能为空',
        ]);
    }

    /**
     * 上传媒体文件到云通讯
     *
     * @param $content
     * @param Rest $rest
     * @return bool
     */
    public function uploadMedia($content)
    {
        $voip = new Voip();
        $pair = explode('/', $content);
        $filename = end($pair);
        try {
            $voip->uploadMedia($filename, file_get_contents($content));
        } catch (\Exception $e) {
            throw new \Exception($e->getMessage());
        }

        return true;
    }
}
