<?php

namespace App\Observers;

use App\Models\Appstore\Alipay\Alipay;
use App\Models\Appstore\Wepay\Wepay;
use App\Models\Bill;
use App\Models\Payment;
use App\Models\Plan;
use App\Models\Team;
use App\Models\TeamPlan;
use Carbon\Carbon;

class PaymentObserver
{
    public function created($payment)
    {
        $payment->update(['trade_no' => mt_rand(111111111, 999999999) . $payment->id]);
    }

    public function updated($payment)
    {
        // 冗余支付状态
        if ($payment->type === Payment::TYPE_WEPAY) {
            Wepay::where('pay_id', $payment->id)->update(['status' => $payment->status]);
        }

        if ($payment->type === Payment::TYPE_ALIPAY) {
            Alipay::where('pay_id', $payment->id)->update(['status' => $payment->status]);
        }

        if ($payment->status === Payment::STATUS_SUCCESS) {
            // 充值
            if ($payment->mode === Payment::MODE_RECHARGE) {
                $team = Team::where('id', $payment->team_id)->first();
                $team->trade($payment->fee);
                Bill::create([
                    'money' => $payment->fee,
                    'type' => Bill::TYPE_RECHARGE,
                    'team_id' => $team->id
                ]);
            }
            // 套餐
            if ($payment->mode === Payment::MODE_PLAN) {
                $newPlan = Plan::where('id', $payment->remark['plan_id'])->first();
                $team = Team::where('id', $payment->team_id)->first();
                $year = $payment->remark['year'] - date('Y');
                Bill::create([
                    'money' => -$payment->fee,
                    'type' => Bill::TYPE_UPDATE_PLAN,
                    'team_id' => $team->id
                ]);
                TeamPlan::where('team_id', $team->id)->update([
                    'name' => $newPlan->name,
                    'slug' => $newPlan->slug,
                    'plan_id' => $newPlan->id,
                    'year' => $payment->remark['year'],
                    'agent_num' => $payment->remark['agent_num'],
                    'end_at' => Carbon::createFromTimestamp(strtotime($team->plan->start_at))->addYear($year),
                    'price' => $newPlan->price
                ]);
            }
        }
    }
}