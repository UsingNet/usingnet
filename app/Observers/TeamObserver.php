<?php

namespace App\Observers;

use App\Models\Plan;
use App\Models\Setting\Assign;
use App\Models\Setting\Plugin;
use App\Models\Setting\Web;
use App\Models\TeamPlan;
use App\Models\Setting\Worktime;
use App\Models\Setting\Voip;
use App\Models\Setting\Sms;
use App\Models\Setting\Mail;
use App\Models\Setting\Notice;
use Carbon\Carbon;

class TeamObserver
{
    public function created($team)
    {
        $team->token = strval(new \MongoDB\BSON\ObjectID());
        $team->save();

        // 默认赠送 1 个坐席 15 天专业版套餐
        $plan = Plan::where('slug', 'profession')->first();
        if ($plan) {
            TeamPlan::create([
                'name' => $plan->name,
                'plan_id' => $plan->id,
                'agent_num' => 1,
                'team_id' => $team->id,
                'price' => $plan->price,
                'slug' => $plan->slug,
                'start_at' => Carbon::now(),
                'year' => date('Y'),
                'end_at' => Carbon::now()->addDay(30)
            ]);
        }

        // 生成配置
        Worktime::create(['team_id' => $team->id]);
        Voip::create(['team_id' => $team->id]);
        Sms::create(['team_id' => $team->id]);
        Web::create(['team_id' => $team->id, 'name' => $team->name]);
        Mail::create(['team_id' => $team->id]);
        Notice::create(['team_id' => $team->id]);
        Plugin::create(['team_id' => $team->id]);
        Assign::create(['team_id' => $team->id]);
    }
}
