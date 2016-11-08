<?php

use Illuminate\Database\Schema\Blueprint;
use App\Models\Plan;
use Illuminate\Database\Migrations\Migration;

class AddFiveDayPlan extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        \App\Models\TeamPlan::where('id', '<>', -1)->delete();
        $teams = \App\Models\Team::all();
        foreach ($teams as $team) {
            $plan = Plan::where('slug', 'profession')->first();
            \App\Models\TeamPlan::create([
                'start_at' => date('Y-m-d H:i:s', $team->created_at->timestamp),
                'end_at' => \Carbon\Carbon::now()->addDay(5),
                'plan_id' => $plan->id,
                'price' => $plan->price,
                'agent_num' => 1,
                'team_id' => $team->id,
                'slug' => $plan->slug,
                'name' => $plan->name,
                'year' => date('Y', time())
            ]);
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
}
