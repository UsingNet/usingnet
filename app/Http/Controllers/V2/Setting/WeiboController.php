<?php

namespace App\Http\Controllers\V2\Setting;

use Config;
use App\Services\Qiniu;
use Validator;
use App\Models\Setting\Weibo;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class WeiboController extends Controller
{
    /**
     * 微博列表
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $weibos = Weibo::where('team_id', $request->user()->team_id)->get();

        foreach ($weibos as $weibo) {
            if ($weibo->verified) {
                $id = '100606' . $weibo->weibo_id;
            } else {
                $id = '100505' . $weibo->weibo_id;
            }
            $weibo->url = asset('/api/weibo/callback/' . $weibo->weibo_id);
            $weibo->appkey = Config::get('weibo.appkey');
            $weibo->redirect_uri = sprintf('http://weibo.com/p/%s/manage?iframe_url=%s', $id, urlencode('http://e.weibo.com/v1/public/devcenter/main#place'));
        }

        return $this->responseJson($weibos);
    }

    public function store(Request $request)
    {
        $data = $request->only('name', 'weibo_id', 'access_token', 'default_reply', 'not_online_agent_reply');
        $data['team_id'] = $request->user()->team_id;
        $validator = $this->validator($data);

        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        $weibo = new \App\Library\Weibo($data['access_token']);
        $user = $weibo->getUserInfo($data['weibo_id']);
        if (isset($user['error'])) {
            return $this->responseJsonError($user['error'], 403);
        }

        $data['img'] = Qiniu::upload(file_get_contents($user['avatar_large']), 'jpg');

        return $this->responseJson(Weibo::create($data)) ;
    }

    /**
     * 修改公众号
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $weibo = Weibo::where(['team_id' => $request->user()->team_id, 'id' => $id])->first();
        if (!$weibo) {
            return $this->responseJsonError('微博账号不存在', 404);
        }

        $data = array_filter($request->only('name', 'weibo_id', 'access_token', 'default_reply', 'not_online_agent_reply'));
        $validator = $this->validator($data, $id);
        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        $weibo->fill($data);
        $weibo->save();

        return $this->responseJson($weibo);
    }

    public function show(Request $request, $id)
    {
        $weibo = Weibo::where(['team_id' => $request->user()->team_id, 'id' => $id])->first();
        if (!$weibo) {
            return $this->responseJsonError('微博不存在', 404);
        }

        if ($weibo->verified) {
            $id = '100606' . $weibo->weibo_id;
        } else {
            $id = '100505' . $weibo->weibo_id;
        }
        $weibo->url = asset('/api/weibo/callback/' . $weibo->weibo_id);
        $weibo->appkey = Config::get('weibo.appkey');
        $weibo->redirect_uri = sprintf('http://weibo.com/p/%s/manage?iframe_url=%s', $id, urlencode('http://e.weibo.com/v1/public/devcenter/main#place'));

        return $this->responseJson($weibo);
    }

    /**
     * 删除公众号
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $id)
    {
        $weibo = Weibo::where(['team_id' => $request->user()->team_id, 'id' => $id])->first();
        if (!$weibo) {
            return $this->responseJsonError('微博账号不存在', 404);
        }

        return $this->responseJson($weibo->delete());
    }

    public function validator($data, $id = null)
    {
        if (\Input::get('type') === 'general') {
            return Validator::make($data, [
                'default_reply' => 'required',
                'not_online_agent_reply' => 'required'
            ], [
                'default_reply.required' => '默认回复不能为空',
                'not_online_agent_reply.required' => '无客服自动回复不能为空'
            ]);
        } else {
            return Validator::make($data, [
                'name' => 'required',
                'weibo_id' => 'required|unique:setting_weibo,weibo_id,' . $id,
                'access_token' => 'required'
            ], [
                'name.required' => '名字不能为空',
                'weibo_id.required' => '微博 ID 不能为空',
                'weibo_id.unique' => '微博 ID 已存在',
                'access_token.required' => 'access_token 不能为空'
            ]);
        }
    }
}
