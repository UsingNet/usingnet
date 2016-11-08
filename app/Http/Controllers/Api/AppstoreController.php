<?php

namespace App\Http\Controllers\Api;

use App\Models\TeamApp;
use App\Models\Appstore;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class AppstoreController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $appIds = TeamApp::where('team_id', $request->user()->team_id)->lists('appstore_id')->toArray();

        $apps = Appstore::all();

        foreach ($apps as $app) {
            $app->used = false;
            if (in_array($app->id, $appIds))  {
                $app->used = true;
            }

            $nonce = mt_rand(1111111, 9999999);
            $timestamp = time();
            $params = [
                'nonce' => $nonce,
                'timestamp' => $timestamp,
                'extend_id' => $request->user()->team->token,
                'name' => $request->user()->team->name,
                'key' => $app->key
            ];

            $tmp = $params;
            ksort($tmp);
            $baseStr  = $app->url . '?' . http_build_query($tmp) . '$' . $app->token;
            $sign = sha1($baseStr);
            $params['signature'] = $sign;
            $app->url = $app->url . '?' . http_build_query($params);
        }

        $apps = $apps->toArray();

        usort($apps, function ($a, $b) {
            return $a['used'] < $b['used'];
        });

        return $this->responseJson(['data' => $apps]);
    }

    public function show(Request $request, $id)
    {
        if ($id === 'all') {
            $existsAppIds = TeamApp::where('team_id', $request->user()->team_id)->lists('appstore_id')->toArray();
            $apps = Appstore::whereNotIn('id', $existsAppIds)->get();
        } else {
            $apps = Appstore::find($id);
        }

        return $this->responseJson($apps);
    }

    public function store(Request $request)
    {
        $id = $request->get('id');
        $teamId = $request->user()->team_id;
        $exists = TeamApp::where(['team_id' => $teamId, 'appstore_id' => $id])->first();
        if ($exists) {
            return $this->responseJsonError('应用已存在', 403);
        }

        return $this->responseJson(TeamApp::create(['team_id' => $teamId, 'appstore_id' => $id]));
    }

    public function destroy(Request $request, $id)
    {
        $exists = TeamApp::where(['team_id' => $request->user()->team_id, 'appstore_id' => $id])->first();
        if (!$exists) {
            return $this->responseJson('应用不存在', 403);
        }

        return $this->responseJson($exists->delete());
    }
}
