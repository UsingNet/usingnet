<?php

namespace App\Http\Controllers\Api\Setting;

use App\Models\Plan;
use App\Models\Setting\Plugin;
use Validator;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;


class PluginController extends Controller
{
    public function index(Request $request)
    {
        $plugin = Plugin::firstOrCreate(['team_id' => $request->user()->team_id]);

        return $this->responseJson($plugin);
    }

    public function store(Request $request)
    {
        $plan = $request->user()->team->plan;
        if (!in_array($plan->slug, [Plan::PLAN_FLAGSHIP, Plan::PLAN_PROFESSION])) {
            return $this->responseJsonError(sprintf('您当前套餐是 %s，不能使用插件功能', $plan->name), 403);
        }

        $data = $request->only('callback', 'secret', 'plugin');
        $validator = Validator::make($data, [
            'callback' => 'url',
            'plugin' => 'url',
        ], [
            'callback.url' => '回调地址格式不正确',
            'plugin.url' => '回调地址格式不正确',
        ]);

        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError($errors, 403);
        }

        $plugin = Plugin::where('team_id', $request->user()->team_id)->first();
        $plugin->fill($data);
        $plugin->save();

        return $this->responseJson($plugin);
    }

}

