<?php

namespace App\Http\Controllers\Api;

use App\Models\CustomerManage;
use App\Services\Messanger;
use App\Models\User;
use App\Models\Team;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class TeamController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth', ['except' => 'getTeaminfo']);
    }

    public function getIndex(Request $request)
    {
        $team = Team::where('id', $request->user()->team_id)
            ->select('id', 'name', 'logo', 'address' ,'fixed_phone', 'token', 'email', 'callback', 'balance', 'description')
            ->with(['plan' => function ($q) {
                $q->select('id', 'slug', 'team_id');
            }])
            ->first();

        if ($request->user()->role == User::ROLE_MEMBER) {
            unset($team->secret);
        }

        return $this->responseJson($team);
    }

    /**
     * 通过token　获取团队配置信息
     * @param $Request
     * @param $token
     * @return json
     */
    public function getTeaminfo(Request $request, $id)
    {
        $team = Team::getTeamInfo($id);
        if(!$team){
            return $this->responseJsonError('团队不存在', 403);
        }

        if ($userInfo = $request->get('user_info')) {
            $teamObj = Team::find($team['id']);
            $params = [
                'track_id' => $request->get('track_id'),
                'web_id' => $team['web']['id']
            ];

            $userInfo = @json_decode(urldecode($userInfo), true);
            if (!empty($userInfo) && is_array($userInfo)) {
                $params['user_info'] = array_only($userInfo, ['email', 'phone', 'extend_id', 'name',
                    'data', 'img', 'tags', 'extend']);
            }

            $local = [$request->get('track_id')];
            if (CustomerManage::inCustomers($teamObj->id)) {
                $remote = [CustomerManage::getManager()->token];
            } else {
                $remote = [$teamObj->token];
            }

            $self = ['token' => $request->get('track_id'), 'ip' => get_ip()];
            $token = \Cache::remember('team_user_info_' . $request->get('track_id'), 10, function () use ($remote, $local, $self) {
                return Messanger::generateToken('IM', $remote, $local, $self);
            });

            $team['im_token'] = $token;
        }

        if (CustomerManage::inCustomers($team['id'])) {
            $team['online'] = count(agent_online(CustomerManage::getManager()->id));
        }

        if ($callback = $request->get('callback')) {
            echo sprintf('%s(%s)', $callback, json_encode($team));
            exit;
        }

        return $this->responseJson(['data' => $team]);
    }
}
