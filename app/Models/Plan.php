<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    const PLAN_EXPERIENCE = 'experience';
    const PLAN_BASIS = 'basis';
    const PLAN_PROFESSION = 'profession';
    const PLAN_FLAGSHIP = 'flagship';

    protected $table = 'plan';
    protected $fillable = ['name', 'slug', 'message_save_time', 'agent_count', 'agent_account_count', 'user_count',
        'price', 'allows', 'color','desc', 'order', 'agent_num', 'fit_for'];
    protected $casts = [
        'id' => 'integer',
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

        return  number_format($left, 2, '.', '');
    }
}
