<?php

namespace App\Models\Stats;

use Jenssegers\Mongodb\Eloquent\Model;

class AgentTiming extends Model
{
    protected $connection = 'mongodb';
    protected $table = 'stats_agent_timing';
    protected $fillable = ['user_id', 'date', 'pre_online_time', 'first_online_time', 'last_offline_time', 'online_time'];
}