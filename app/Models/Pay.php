<?php

namespace App\Models;

use DB;
use Illuminate\Database\Eloquent\Model;

class Pay extends Model
{
    const STATUS_INIT = 'INIT';
    const STATUS_FAIL = 'FAIL';
    const STATUS_SUCCESS = 'SUCCESS';
    const TYPE_ALIPAY = 'ALIPAY';
    const TYPE_TENPAY = 'TENPAY';
    const TYPE_RETURN = 'RETURN';
    const METHOD_PLAN = 'PLAN';
    const METHOD_RECHARGE = 'RECHARGE';
    protected $table = 'pay';
    protected $fillable = ['team_id', 'user_id', 'money', 'status', 'type', 'remark', 'method', 'agent_num', 'plan_id', 'pay_no', 'year'];
    protected $casts = [
        'id' => 'integer',
        'user_id' => 'integer',
        'team_id' => 'integer'
    ];


    /**
     * 升级套餐计算费用
     * @param $currentPlan
     * @param $newPlan
     * @return int
     */
    public static function left($currentPlan, $newPlan, $agentNum, $year)
    {
        $dayPrice = $currentPlan->price / 365;
        $leftDay = ceil((strtotime($currentPlan->end_at) - time()) / (24 * 3600));

        // 添加坐席
        if ($currentPlan->plan_id == $newPlan->id) {
            $left =  $dayPrice * $leftDay * ($agentNum - $currentPlan->agent_num);
            if ($year != $currentPlan->year) {
                $endYear = date('Y', strtotime($currentPlan->end_at)) - date('Y', time());
                $left += $newPlan->price * $agentNum * ($year - $endYear);
            }
        } else {
            // 升级套餐
            if ($year) {
                $total = $newPlan->price * $year * $agentNum;
            } else {
                $total = $newPlan->price / 356 * $leftDay * $agentNum;
            }
            $left = $total - $dayPrice * $leftDay * $currentPlan->agent_num;
        }

        return $left;
    }
}
