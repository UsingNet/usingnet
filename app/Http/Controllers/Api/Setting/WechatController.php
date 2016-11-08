<?php

namespace App\Http\Controllers\Api\Setting;

use Gibson\Wechat\MenuItem;
use Gibson\Wechat\Menu;
use Validator;
use App\Models\Setting\Wechat;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class WechatController extends Controller
{
    /**
     * 公众号列表
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $accounts = Wechat::where('team_id', $request->user()->team_id)->get();

        return $this->responseJson($accounts);
    }

    /**
     * 修改公众号
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $wechat = Wechat::where(['team_id' => $request->user()->team_id, 'id' => $id])->first();
        if (!$wechat) {
            return $this->responseJsonError('公众号不存在', 404);
        }

        $data = array_filter($request->only('url', 'token', 'mode', 'encoding_aes_key', 'use_template_message',
            'subscribe_reply', 'default_reply', 'not_online_agent_reply', 'evaluation', 'subscribe_reply'));

        if (!isset($data['evaluation'])) {
            $data['evaluation']  = 0;
        }

        if ($request->get('type') === 'general') {
        } else {
            $validator = Validator::make($data, [
                'url' => 'required|url',
                'encoding_aes_key' => 'min:43|max:43|regex:/^[a-zA-Z0-9]+$/|required_if:mode,' . Wechat::MODE_ENCRYPTION,
            ], [
                'url.required' => '服务器地址不能为空',
                'url.url' => '请输入正确的URL',
                'encoding_aes_key.min' => 'EncodingAeskey 只能为 43 位',
                'encoding_aes_key.max' => 'EncodingAeskey 只能为 43 位',
                'encoding_aes_key.required_if' => 'EncodingAeskey 不能为空',
                'encoding_aes_key.regex' => 'EncodingAeskey 只能为英文和数字',
            ]);

            if ($validator->fails()) {
                $errors = $validator->messages()->all();
                return $this->responseJsonError(implode(' ', $errors), 403);
            }
        }

        $wechat->fill($data);
        $wechat->save();

        return $this->responseJson($wechat);
    }

    /**
     * 删除公众号
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $id)
    {
        $account = Wechat::where(['team_id' => $request->user()->team_id, 'id' => $id])->first();
        if (!$account) {
            return $this->responseJsonError('公众号不存在', 403);
        }

        return $this->responseJson($account->delete());
    }
}
