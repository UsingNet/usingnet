<?php

namespace App\Http\Controllers\V2\Account;

use App\Models\Payment;
use App\Models\Plan;
use DB;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;

class PayController extends Controller
{
    public function store(Request $request)
    {
        $req = $request->only('mode', 'type', 'fee', 'remark');
        $req['team_id'] = $request->user()->team_id;
        $team = $request->user()->team;

        $validator = Validator::make($req, [
            'mode' => 'required|in:' . implode(',', [Payment::MODE_PLAN, Payment::MODE_PLUGIN, Payment::MODE_RECHARGE]),
            'type' => 'required|in:'. implode(',', [Payment::TYPE_ALIPAY, Payment::TYPE_WEPAY]),
            'fee' => 'required',
        ]);

        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        if ($remark = $request->get('remark')) {
            $plan = Plan::where('id', $remark['plan_id'])->firstOrFail();
            $req['fee'] = Plan::left($team->plan, $plan, $remark['agent_num'], $remark['year'] - date('Y'));
            if ($req['fee'] < 0) {
                return $this->responseJsonError('参数错误', 403);
            }
        }

        $payment = Payment::create($req);

        return $this->responseJson($payment);
    }

    public function show(Request $request, $no)
    {
        $type = strtoupper($request->get('type'));
        if ($type === Payment::TYPE_ALIPAY) {
            $payment = Payment::where('trade_no', $no)->firstOrFail();
            if ($payment->mode === Payment::MODE_PLAN) {
                $request->session()->put('pay_referrer', asset('setting/combo'));
            } else {
                $request->session()->put('pay_referrer', asset('setting/recharge'));
            }
            $alipay = app('alipay.web');
            $alipay->setOutTradeNo($payment->trade_no);
            $alipay->setTotalFee($payment->fee);
            $alipay->setSubject('优信科技');
            return redirect($alipay->getPayLink());
        }
    }
}
