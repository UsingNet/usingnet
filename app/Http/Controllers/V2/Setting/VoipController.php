<?php

namespace App\Http\Controllers\V2\Setting;

use App\Models\Media;
use App\Models\User;
use App\Models\Setting\Voip;
use App\Services\WechatTeam;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class VoipController extends Controller
{
    /**
     * voip 设置
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $voip = Voip::where('team_id', $request->user()->team_id)->first();
        return $this->responseJson($voip);
    }

    /**
     * 保存 voip 设置
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $data = array_filter($request->only('bind_number', 'display_number', 'display_number_files', 'evaluation'));
        if (!isset($data['evaluation'])) {
            $data['evaluation'] = 0;
        }

        $voip = Voip::where('team_id', $request->user()->team_id)->first();
        if ($voip->status === Voip::STATUS_INIT) {
            $voip->status = Voip::STATUS_CHECKING;
            $voip->save();
            return $this->responseJson($voip);
        }

        if (isset($data['bind_number'])) {
            $exists = Voip::where('bind_number', $data['bind_number'])
                ->where('team_id', '<>', $voip->team_id)
                ->first();
            if ($exists) {
                return $this->responseJsonError('团队电话已存在', 403);
            }
        }

        if (isset($data['display_number'])) {
            $exists = Voip::where('display_number', $data['display_number'])
                ->where('team_id', '<>', $voip->team_id)
                ->first();

            $data['display_number_status'] = Voip::STATUS_CHECKING;
            if ($exists) {
                return $this->responseJsonError('团队电话已存在', 403);
            }
        }

        $voip->fill($data);
        $voip->save();

        if ($voip->status === Voip::STATUS_CHECKING) {
            WechatTeam::notice('用户提交了电话申请');
        }

        return $this->responseJson($voip);
    }
}
