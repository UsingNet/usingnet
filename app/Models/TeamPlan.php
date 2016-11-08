<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TeamPlan extends Model
{
    protected  $table = 'team_plan';
    protected $fillable = ['team_id', 'plan_id', 'agent_num', 'start_at', 'end_at', 'name', 'price', 'slug', 'year'];
    public $timestamps = false;
    protected $casts = [
        'team_id' => 'integer',
        'plan_id' => 'integer'
    ];

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

}
