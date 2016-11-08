<?php

namespace App\Http\Controllers\Api\Account;

use DB;
use Carbon\Carbon;
use App\Library\Curl;
use App\Models\Bill;
use App\Models\Plan;
use App\Models\Team;
use App\Models\TeamPlan;
use App\Library\Syslog;
use App\Models\Invite;
use App\Models\Pay;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;

class PayController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth', ['except' => 'anyCallback']);
    }

    public function getIndex(Request $request)
    {
        $handle = Pay::where('team_id', $request->user()->team_id)
            ->where('status', Pay::STATUS_SUCCESS);

        return $this->listToPage($handle);
    }

    public function postIndex(Request $request)
    {
        $data = $request->only('money', 'type');
        $validator = Validator::make($data, [
            'money' => 'required',
            'type' => 'required|in:' . implode(',', array_map('strtolower', [Pay::TYPE_TENPAY, Pay::TYPE_ALIPAY])),
        ], [
            'money.required' => '金额不能为空',
            'money.digits' => '金额必须为数字',
            'type.required' => '支付方式不能为空',
            'type.in' => '支付方式不正确'
        ]);

        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        $pay = Pay::firstOrCreate([
            'team_id' => $request->user()->team_id,
            'user_id' => $request->user()->id,
            'money' => $data['money'],
            'type' => $data['type'],
            'status' => Pay::STATUS_INIT
        ]);

        return $this->responseJson($pay);
    }

    /**
     * 支付跳转链接
     *
     */
    public function getTo(Request $request, $id = null)
    {
        session()->put('pay_referrer', $_SERVER['HTTP_REFERER']);
        if ($id) {
            $pay = Pay::find($id);
        } else {
            $data = $request->only('money', 'type', 'method', 'agent_num', 'plan_id', 'year');
            if (empty($data['method'])) {
                $data['method'] = Pay::METHOD_RECHARGE;
            }
            if (!empty($data['year'])) {
                $data['year'] = $data['year'] - date('Y');
                if ($data['year'] < 1) {
                    return $this->responseJsonError('年限不能为空', 403);
                }
            }

            $data = array_map('strtoupper', $data);
            $validator = Validator::make($data, [
                'money' => 'required',
                'type' => 'required|in:' . implode(',', [Pay::TYPE_TENPAY, Pay::TYPE_ALIPAY]),
                'method' => 'required|in:' . implode(',', [Pay::METHOD_RECHARGE, Pay::METHOD_PLAN]),
                'plan_id' => sprintf('required_if:method,%s|exists:plan,id', Pay::METHOD_PLAN),
                'agent_num' => sprintf('required_if:method,%s|numeric', Pay::METHOD_PLAN),
                'year' => sprintf('required_if:method,%s|numeric', Pay::METHOD_PLAN),
            ], [
                'money.required' => '金额不能为空',
                'money.digits' => '金额必须为数字',
                'type.required' => '支付方式不能为空',
                'type.in' => '支付方式不正确',
                'method.required' => '支付类型不能为空',
                'method.in' => '支付类型错误',
                'plan_id.required_if' => '套餐 id 不能为空',
                'agent_num.required_if' => '坐席数不能为空',
                'year.required_if' => '套餐年限不能为空'
            ]);

            if ($validator->fails()) {
                $errors = $validator->messages()->all();
                return $this->responseJsonError(implode(' ', $errors), 403);
            }

            $pay = Pay::firstOrCreate([
                'team_id' => $request->user()->team_id,
                'user_id' => $request->user()->id,
                'money' => $data['money'],
                'type' => $data['type'],
                'method' => $data['method'],
                'agent_num' => $data['agent_num'],
                'status' => Pay::STATUS_INIT,
                'plan_id' => $data['plan_id'],
                'year' => $data['year'],
                'pay_no' => strtoupper(new \MongoDB\BSON\ObjectID())
            ]);
        }

        if ($pay->status !== Pay::STATUS_INIT) {
            return redirect()->back();
        }

        $subject = $pay->method === Pay::METHOD_RECHARGE ? '优信科技账户充值' : '优信科技购买套餐';

        $alipay = app('alipay.web');
        $alipay->setOutTradeNo($pay->pay_no);
        $alipay->setTotalFee($pay->money);
        $alipay->setSubject($subject);

        return redirect()->to($alipay->getPayLink());
    }

    /**
     * 支付返回信息
     * @param Request $request
     * @throws
     * @return mixed
     */
    public function anyCallback(Request $request)
    {
        if (!app('alipay.web')->verify()) {
            return view('errors.error', ['title' => '支付失败', 'desc' => '支付接口验证失败，请联系优信客服']);
        }

        $no = $request->get('out_trade_no');
        DB::beginTransaction();
        try {
            $pay = DB::table('pay')->where(['pay_no' => $no, 'status' => Pay::STATUS_INIT])->lockForUpdate()->first();
            if ($pay) {
                DB::table('pay')->where('id', $pay->id)->update(['status' => Pay::STATUS_SUCCESS]);
                DB::table('team')->where('id', $pay->team_id)->increment('balance', $pay->money);
                // 添加充值记录
                DB::table('bill')->insert([
                    'team_id' => $pay->team_id,
                    'type' => Bill::TYPE_RECHARGE,
                    'money' => $pay->money,
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now()
                ]);
                // 邀请　返现
                /*
                $invite = Invite::where('invite_team_id', $pay->team_id)->first();
                if ($invite) {
                    $costs = max($pay->money * Config::get('price.invite'), 1);
                    DB::table('team')->where('id', $invite->team_id)->increment('balance', $costs);
                    DB::table('pay')->insert([
                        'team_id' => $invite->team_id,
                        'money' => $costs,
                        'type' => Pay::TYPE_RETURN,
                        'remark' => $invite->invite_team_id
                    ]);
                }
                */
                Syslog::logger('PAY')->addDebug('PAY_SUCCESS', ['pay_id' => $pay->id]);

                // 付费成功后 直接购买套餐
                if ($pay->method == Pay::METHOD_PLAN) {
                    $team = Team::find($pay->team_id);
                    $newPlan = Plan::find($pay->plan_id);
                    $left = Plan::left($team->plan, $newPlan, $pay->agent_num, $pay->year);
                    if ($team->balance >= $left) {
                        $team->trade(-$left);
                        // 添加消费记录
                        DB::table('bill')->insert([
                            'team_id' => $pay->team_id,
                            'type' => $team->plan->price == 0 ? Bill::TYPE_NEW_PLAN : Bill::TYPE_RENEWALS_PLAN,
                            'money' => -$left,
                            'created_at' => Carbon::now(),
                            'updated_at' => Carbon::now()
                        ]);
                        $startAt = $team->plan->end_at;
                        if ($team->plan->price == 0) {
                            $startAt = Carbon::now();
                        }
                        TeamPlan::where('team_id', $team->id)->update([
                            'name' => $newPlan->name,
                            'slug' => $newPlan->slug,
                            'plan_id' => $newPlan->id,
                            'year' => date('Y') + $pay->year,
                            'agent_num' => $pay->agent_num,
                            'start_at' => $startAt,
                            'end_at' => Carbon::createFromTimestamp(strtotime($startAt))->addYear($pay->year),
                            'price' => $newPlan->price
                        ]);
                    }
                }
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollback();
            DB::table('pay')->where('id', $no)->update(['status' => Pay::STATUS_FAIL]);
            Syslog::logger('PAY')->addCritical('PAY_FAIL', $e->getTrace());
        }

        if ($request->method() === 'GET') {
            $host = session()->get('pay_referrer');
            if (isset($pay) && $pay->method == Pay::METHOD_PLAN) {
                $host = str_replace('/recharge', '/combo', $host);
            }

            return redirect($host);
        }
    }

    /**
     * 支付成功查询
     */
    public function postSuccess(Request $request)
    {
        $pay = Pay::where('user_id', $request->user()->id)->orderBy('id', 'desc')->first();

        if ($pay) {
            $alipay = app('alipay.web');
            $alipay->setOutTradeNo($pay->id);
            $alipay->setTotalFee($pay->money);
            $alipay->setSubject($pay->method);
            $link = $alipay->getPayLink();
            Curl::to($link)->get();
            $pay = Pay::find($pay->id);
            if ($pay->statsu === Pay::STATUS_SUCCESS)  {
                return $this->responseJson('支付成功');
            }
        }

        return $this->responseJsonError('支付失败, 请联系客服', 403);
    }
}

