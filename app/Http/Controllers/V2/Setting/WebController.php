<?php

namespace App\Http\Controllers\V2\Setting;

use App\Models\Plan;
use App\Models\Setting\Web;
use App\Models\Team;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;

class WebController extends Controller
{
    /**
     * Web 设置
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $handler = Web::where('team_id', $request->user()->team_id);
        $plan = $request->user()->team->plan;

        return $this->listToPage($handler, function (&$items) use ($plan) {
            if ($plan->slug !== Plan::PLAN_FLAGSHIP) {
                $items = [$items[0]];
            }
        });
    }

    public function update(Request $request, $id)
    {
        $web = Web::where(['team_id' => $request->user()->team_id, 'id' => $id])->first();
        if (!$web) {
            return $this->responseJsonError('配置不存在', 404);
        }


        $data = $request->all();

        $validator = $this->validator($data);
        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        $web->fill($data);
        $web->save();

        if (!empty($data['logo'])) {
            $request->user()->team->update(['logo' => $data['logo']]);
        }


        Team::clearTeamInfoCache($request->user()->team);

        return $this->responseJson($web);
    }

    public function show(Request $request, $id)
    {
        $web = Web::where('id', $id)->where('team_id', $request->user()->team_id)->first();
        if (!$web) {
            return $this->responseJsonError('配置不存在', 404);
        }

        return $this->responseJson($web);
    }

    public function destroy(Request $request, $id)
    {
        $web = Web::where('id', $id)->where('team_id', $request->user()->team_id)->first();
        if (!$web) {
            return $this->responseJsonError('配置不存在', 404);
        }

        return $this->responseJson($web->delete());
    }

    /**
     * 保存 web 设置
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $data = $request->all();
        $data['team_id'] = $request->user()->team_id;

        $validator = $this->validator($data);
        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        $count = Web::where('team_id', $request->user()->team_id)->count();
        if ($count === intval(env('MAX_SETTING_WEB'))) {
            return $this->responseJsonError('最多只允许接入 5 个网站', 403);
        }

        if ($count && $request->user()->team->plan->slug != Plan::PLAN_FLAGSHIP) {
            return $this->responseJsonError('您的套餐只支持部署 1 个网站，如需部署多个网站请升级到旗舰版', 403);
        }

        if (!empty($data['logo'])) {
            $request->user()->team->update(['logo' => $data['logo']]);
        }

        $web = Web::create($data);

        // 清理缓存
        Team::clearTeamInfoCache($request->user()->team);

        return $this->responseJson($web);
    }

    public function validator($data) {
        return Validator::make($data, [
            'name' => 'required|max:10',
        ], [
            'name.required' => '网站名字不能为空',
            'name.max' => '网站名字不能大于 10 个字符'
        ]);
    }
}
