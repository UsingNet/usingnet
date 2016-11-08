<?php

namespace App\Http\Controllers\Api\Setting;

use App\Models\Setting\QuickReply;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;

class QuickreplyController extends Controller
{
    /**
     * 回复列表
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $handler = QuickReply::where('user_id', $request->user()->id);

        if ($type = $request->get('type')) {
            $handler = QuickReply::where(['team_id' => $request->user()->team_id])
                ->where('type', $type)->orderBy('id', 'desc');

            if ($type === QuickReply::TYPE_PERSONAL) {
                $handler->where('user_id', $request->user()->id);
            }
        }

        return $this->responseJson($handler->get());
    }

    /**
     * 添加回复
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $data = $request->only('content', 'shortcut');
        $data['user_id'] = $request->user()->id;
        $data['team_id'] = $request->user()->team_id;
        $data['type'] = $request->get('type', QuickReply::TYPE_PERSONAL);

        // 限制快捷回复数量
        $count = QuickReply::where('user_id', $request->user()->id)->count();
        if ($count >= QuickReply::MAX_NUM) {
            //return $this->responseJsonError(sprintf('最多添加 %s 条快捷回复', QuickReply::MAX_NUM), 403);
        }

        $validator = $this->validator($data);
        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        $quickReply = QuickReply::create($data);

        return $this->responseJson($quickReply);
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
        $data = array_filter($request->only('content', 'id', 'shortcut'));
        $data['user_id'] = $request->user()->id;

        $validator = $this->validator($data, $id);
        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        $reply = QuickReply::where(['team_id' => $request->user()->team_id, 'id' => $id])->first();
        if (!$reply) {
            return $this->responseJsonError('回复不存在', 403);
        }

        $reply->update($data);

        return $this->responseJson($reply);
    }

    /**
     * 删除回复
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $id)
    {
        $reply = QuickReply::where(['id' => $id, 'team_id' => $request->user()->team_id])->first();
        if (!$reply) {
            return $this->responseJsonError('回复不存在', 404);
        }

        return $this->responseJson($reply->delete());
    }

    public function validator($data, $id = null)
    {
        return $validator = Validator::make($data, [
            'shortcut' => 'required_without:id|max:10|unique:setting_quick_reply,shortcut,'.$id.',id,user_id,' . $data['user_id'],
            'content' => 'required_without:id|max:255|unique:setting_quick_reply,content,'.$id.',id,user_id,' . $data['user_id'],
        ], [
            'content.required_without' => '内容不能为空',
            'content.max' => '内容不能大于255个字',
            'content.unique' => '内容已存在',
            'shortcut.required_without' => '快捷词不能为空',
            'shortcut.max' => '快捷词不能大于10个字',
            'shortcut.unique' => '快捷词已存在',
        ]);
    }
}
