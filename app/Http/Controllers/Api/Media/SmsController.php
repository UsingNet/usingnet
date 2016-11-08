<?php

namespace App\Http\Controllers\Api\Media;

use App\Http\Requests;
use App\Models\Setting\Sms;
use App\Services\Messanger;
use Illuminate\Http\Request;
use App\Models\Media;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;

class SmsController extends Controller
{
    /**
     * 短信模板列表
     * @param $request
     * @return json
     */
    public function index(Request $request)
    {
        $media = Media::where(['team_id' => $request->user()->team_id, 'type' => Media::TYPE_SMS])->orderBy('id', 'desc');

        if ($status = $request->get('status')) {
            $media->where('status', strtoupper($status));
        }

        return $this->responseJson($media->get());
    }

    /**
     * 添加短信模板
     * @param  $request
     * @return json
     */
    public function store(Request $request)
    {
        $team = $request->user()->team;
        $data = $request->only('title', 'content');
        $data['team_id'] = $request->user()->team_id;
        $data['user_id'] = $request->user()->id;
        $data['type'] = Media::TYPE_SMS;
        if (!$request->user()->team->sms->signature) {
            return $this->responseJsonError('请先填写短信签名');
        }

        $validator = $this->validator($data, $team->id);
        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        $exists = Media::where(['type' => Media::TYPE_SMS, 'content' => $data['content'], 'status' => Media::STATUS_SUCCESS])->first();
        if ($exists) {
            $data['status'] = Media::STATUS_SUCCESS;
        } else {
            //　通知管理员审核模板
            Sms::templateNotice($data['content']);
        }

        $sms = Media::create($data);

        return $this->responseJson($sms);
    }

    /**
     * 显示模板
     *
     * @param $request
     * @param  int  $id
     * @return json
     */
    public function show(Request $request, $id)
    {
        $sms = Media::where(['id' => $id, 'team_id' => $request->user()->team_id])->first();
        if (!$sms) {
            return $this->responseJsonError('短信不存在', 404);
        }

        return $this->responseJson($sms);
    }

    /**
     * 更新模板
     * @param  Request  $request
     * @param  int  $id
     * @return json
     */
    public function update(Request $request, $id)
    {
        $data = array_filter($request->only('title', 'content'));
        $media = Media::where(['id' => $id, 'team_id' => $request->user()->team_id])->first();
        $data['type'] = $media->type;
        $data['team_id'] = $media->team_id;

        if (!$media) {
            return $this->responseJsonError('短信模板不存在', 404);
        }

        if (isset($data['content']) && $media->content != $data['content']) {
            $exists = Media::where(['type' => Media::TYPE_SMS, 'content' => $data['content'], 'status' => Media::STATUS_SUCCESS])->first();
            if ($exists) {
                $data['status']  = Media::STATUS_SUCCESS;
            } else {
                $data['status'] = Media::STATUS_CHECKING;
                //　通知管理员审核模板
                Sms::templateNotice($data['content']);
            }
        }

        $validator = $this->validator($data, $id);
        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        $media->update($data, $id);

        return $this->responseJson($media);
    }

    /**
     * 删除
     *
     * @param $request
     * @param  int  $id
     * @return json
     */
    public function destroy(Request $request, $id)
    {
        $sms = Media::where(['id' => $id, 'team_id' => $request->user()->team_id])->first();
        if (!$sms) {
            return $this->responseJsonError('短信模板不存在', 404);
        }

        return $this->responseJson($sms->delete());
    }

    /**
     * 验证
     * @param array $data
     * @param null $teamId
     * @return object
     */
    public function validator($data, $id = null)
    {
        return Validator::make($data, [
            'title' => sprintf('required_without:id|unique:media,title,%s,id,team_id,%s,type,%s', $id, $data['team_id'], $data['type']),
            'content' => sprintf('required_without:id|unique:media,content,%s,id,team_id,%s,type,%s', $id, $data['team_id'], $data['type']),
        ], [
            'title.required_without' => '请填写模板标题',
            'title.unique' => '标题已存在',
            'content.required_without' => '请填写模板内容',
            'content.unique' => '模板已存在'
        ]);
    }
}
