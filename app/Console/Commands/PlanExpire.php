<?php

namespace App\Console\Commands;

use App\Models\Message;
use Carbon\Carbon;
use App\Models\Team;
use App\Models\TeamPlan;
use App\Models\Plan;
use App\Services\Messanger;
use Illuminate\Console\Command;

class PlanExpire extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'plan:expired';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * 过期套餐恢复到体验版
     *
     * Execute the console command.
     * @return mixed
     */
    public function handle()
    {
        $plans = TeamPlan::where('end_at', '<', Carbon::now())
            ->where('slug', '<>', 'experience')
            ->get();

        $defaultPlan = Plan::where('slug', 'experience')->first();
        foreach ($plans as $plan) {
            TeamPlan::where('team_id', $plan->team_id)->update([
                'name' => $defaultPlan->name,
                'plan_id' => $defaultPlan->id,
                'agent_num' => $defaultPlan->agent_num,
                'price' => $defaultPlan->price,
                'slug' => $defaultPlan->slug,
            ]);
        }
    }
}
