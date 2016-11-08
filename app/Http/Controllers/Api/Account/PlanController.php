<?php

namespace App\Http\Controllers\Api\Account;

use App\Models\Pay;
use App\Models\Team;
use DB;
use App\Library\Syslog;
use App\Models\Bill;
use Carbon\Carbon;
use App\Models\Plan;
use Illuminate\Http\Request;
use App\Http\Requests;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;

class PlanController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $handle = Plan::where('price', '<>', 0)->orderBy('order');
        return $this->listToPage($handle);
    }

    /**
     * 购买套餐
     * 套餐只允许升不允许降
     * 升级套餐将原有的套餐剩余时间折算成钱抵挡新套餐的价格
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        Team::clearTeamInfoCache($request->user()->team);
        $data = $request->only('plan_id', 'agent_num', 'year');
        $team = $request->user()->team;

        $validator = $this->validator($data);
        if ($validator->fails()) {
            $errors  = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        $plan = Plan::find($data['plan_id']);
        $billType = Bill::TYPE_NEW_PLAN;
        $startAt = Carbon::now();

        // 新套餐
        if ($team->plan->price == 0) {
            $year = $data['year']- date('Y');
            $endAt = Carbon::now()->addYear($year);
            $costs = $plan->price * $data['agent_num'] * $year;
        } else { // 升级套餐
            if ($data['year'] < $team->plan->year) {
                return $this->responseJsonError('数据不正确', 403);
            }

            $time = strtotime($team->plan->end_at);
            $year = $data['year'] - date('Y', $time);
            $endAt = Carbon::createFromTimestamp($time)->addYear($year);

            if ($year < 1 && $team->plan->plan_id == $plan->id && $team->plan->agent_num == $data['agent_num']) {
                return $this->responseJsonError('套餐未变动', 403);
            }

            if ($data['agent_num'] < $team->plan->agent_num) {
                return $this->responseJsonError('坐席人数只能增加', 403);
            }
            if ($team->plan->plan_id > $plan->id) {
                return $this->responseJsonError('套餐只能升级', 403);
            }

            $billType = Bill::TYPE_UPDATE_PLAN;
            $costs = Plan::left($team->plan, $plan, $data['agent_num'], $year);
        }

        if ($costs < 0) {
            return $this->responseJsonError('参数错误', 403);
        }

        // 余额不足
        if ($costs > $team->balance) {
            return $this->responseJsonError(number_format($costs - $team->balance, 2, '.', ''), 411);
        }

        try {
            Syslog::logger('PLAN')->addDebug('UPDATE_PLAN_START', [$costs, $billType, $team->toArray()]);
            DB::table($team->getTable())->where('id', $team->id)->lockForUpdate()->first();
            DB::table($team->getTable())->where('id', $team->id)->increment('balance', -$costs);
            DB::table($team->plan->getTable())->where('team_id', $team->id)->lockForUpdate()->first();
            DB::table($team->plan->getTable())->where('team_id', $team->id)->update([
                'start_at' => $startAt,
                'end_at' => $endAt,
                'plan_id' => $plan->id,
                'year' => $data['year'],
                'price' => $plan->price,
                'name' => $plan->name,
                'slug' => $plan->slug,
                'agent_num' => $data['agent_num']
            ]);
            DB::table('bill')->insert([
                'team_id' => $team->id,
                'type' => $billType,
                'money' => -$costs,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now()
            ]);
            DB::commit();
            // 更新销售记录
            DB::table('team_sales')->where(['user_id' => $request->user()->id, 'money' => 0])
                ->update(['money' => $costs, 'plan_id' => $plan->id]);
            Syslog::logger('PLAY')->addDebug('UPDATE_PLAN_END', [$costs, $billType, $team->toArray()]);
        } catch (\Exception $e) {
            DB::rollback();
            Syslog::logger('ERROR')->addCritical('UPDATE_PLAN_ERROR', $e->getTrace());
        }

        return $this->responseJson(true);
    }

    /**
     * 显示套餐
     * @param Request $request
     */
    public function show(Request $request, $id)
    {
        $plan = $request->user()->team->plan;
        $plan['plan'] = $plan->plan;
        return $this->responseJson($plan);
    }

    /**
     * 计算套餐费用
     *
     * @param $pan
     */
    public function getBalance(Request $request)
    {
        $team = $request->user()->team;
        $data = $request->only('plan_id', 'agent_num', 'year');

        $validator = $this->validator($data);
        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        $year = $data['year'] - date('Y');
        $plan = Plan::find($data['plan_id']);

        // 新增套餐
        if ($team->plan->price == 0) {
            $costs = $plan->price * $data['agent_num'] * $year;
        } else {
            if ($year == $team->plan->year && $team->plan->plan_id == $plan->id && $team->plan->agent_num == $data['agent_num']) {
                $costs = 0;
            } else {
                if ($data['agent_num'] < $team->plan->agent_num) {
                    return $this->responseJsonError('坐席人数只能增加', 403);
                }
                if ($team->plan->plan_id > $plan->id) {
                    return $this->responseJsonError('套餐只能升级', 403);
                }
                $costs = Plan::left($team->plan, $plan, $data['agent_num'], $year);
            }
        }

        $discount = 0;
        $data = [
            'costs' => number_format($costs, 2, '.', ''),
            'discount' => $discount
        ];

        return $this->responseJson($data);
    }

    /**
     * 验证
     * @param $data
     * @return mixed
     */
    public function validator($data)
    {
        $validator = Validator::make($data, [
            'plan_id' => 'required|integer|exists:plan,id',
            'agent_num' => 'required|integer|min:1',
            'year' => 'required|integer|min:' . (date('Y'))
        ], [
            'plan_id.required' => '请选择套餐',
            'agent_num.required' => '请填写坐席',
            'year.required' => '请选择合约时间',
            'plan_id.exists' => '套餐不存在',
            'year.min' => '至少添加一年合约',
            'agent_num.min' => '至少添加一位坐席'
        ]);

        return $validator;
    }
}
