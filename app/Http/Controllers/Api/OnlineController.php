<?php

namespace App\Http\Controllers\Api;

use App\Models\Order;
use App\Models\Plan;
use App\Models\Setting\Worktime;
use App\Models\Team;
use App\Models\TeamPlan;
use App\Models\User;
use App\Services\Connect;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class OnlineController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth', ['except' => ['show']]);
    }

    /**
     * 后台显示在线客服
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $team = $request->user()->team;
        if (!$team) {
            return $this->responseJsonError('客服团队不存在', 403);
        }

        $onlines = agent_online($request->user()->team_id);
        $userIds = array_fetch($onlines, 'id');

        $users = User::whereIn('id', $userIds)->select('id', 'name', 'email', 'img', 'extend', 'job_number')->get()->toArray();
        $onlines = agent_online($team->id);

        if (count($onlines) >= $team->plan->agent_num && !in_array($request->user()->id, $userIds)) {
            //return $this->responseJsonError(sprintf('您的套餐只允许 %s 个座席在线', $team->plan->agent_num), 403);
        }

        foreach ($users as &$user) {
            $user['order_count'] = Order::where('user_id', $user['id'])->where('status', Order::STATUS_OPEN)->count();
        }

        return $this->responseJson(['data' => $users]);
    }

    /**
     * 前台查看是否有客服在线
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($token)
    {
        $team = Team::where('token', $token)->first();
        if (!$team) {
            return $this->responseJsonError('客服团队不存在', 404);
        }

        $connect = new Connect(Connect::PUSH_SERVER);
        $onlines = $connect->search_listener(['team_id' => $team->id]);
        $onlines = $onlines['listeners'];
        $onlines = array_map('unserialize', array_unique(array_map('serialize', $onlines)));

        // 微信客服
        if (!$onlines) {
            $worktime = Worktime::where('team_id', $team->id)->first();
            if (worktime($worktime)) {
                $onlines = User::where('openid', '<>', '')->count();
            }
        }

        return $this->responseJson(['data' => count($onlines)]);
    }

    public function store(Request $request){
        switch($request->get('action')){
            case 'offline':
                switch($request->get('type')){
                    case 'pc':
                        $connect = new Connect(Connect::PUSH_SERVER);
                        return $this->responseJson(["data" => $connect->request($request->user()->token, 'offline', ['from'=>'wechat'])]);
                    case 'manage':
                        if($request->user()->role == User::ROLE_MEMBER){
                            return $this->responseJsonError('只有创始人和管理员有权使用离线功能', 405);
                        }
                        if(!$request->get('user_id')){
                            return $this->responseJsonError('缺少user_id', 404);
                        }
                        $user = User::find($request->get('user_id'));
                        if(!$user || $user->team_id != $request->user()->team_id){
                            return $this->responseJsonError('该成员不存在于团队中', 404);
                        }
                        $connect = new Connect(Connect::PUSH_SERVER);
                        return $this->responseJson(["data" => $connect->request($user->token, 'offline', ['from'=>'manage', 'name'=>$request->user()->name])]);
                    default:
                        return $this->responseJsonError('Unknown type', 405);
                }
                break;
            default:
                return $this->responseJsonError('Unknown action', 405);
        }
    }
}
