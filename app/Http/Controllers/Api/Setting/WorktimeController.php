<?php

namespace App\Http\Controllers\Api\Setting;

use App\Models\User;
use App\Models\Setting\Voip;
use App\Models\Setting\Worktime;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class WorktimeController extends Controller
{
    /**
     * 显示工作时间
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $worktime = Worktime::firstOrCreate(['team_id' => $request->user()->team_id]);

        return $this->responseJson($worktime);
    }

    /**
     * 添加工作时间
     * @param Request $request
     * @return mixed
     */
    public function store(Request $request)
    {
        $data = $request->only('worktime', 'workday', 'offworkday');
        $worktime = Worktime::where('team_id', $request->user()->team_id)->first();
        $worktime->fill($data);
        $worktime->save();

        if ($request->user()->team->voip->status === Voip::STATUS_SUCCESS) {
            $cmd = sprintf('nohup /usr/bin/php %s %s %s >> /dev/null 2>&1 &', base_path() . '/artisan', 'UpdateVoipQueue', $request->user()->team_id);
            system($cmd);
        }

        return $this->responseJson($worktime);
    }
}

