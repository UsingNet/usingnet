<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tasklist extends Model
{
    const STATUS_INIT = 'INIT';
    const STATUS_COMPILE = 'COMPILE';
    const STATUS_FINISH = 'FINISH';

    protected $table = 'task_list';
    protected $fillable = ['user_id', 'task_id', 'team_id', 'status', 'status', 'contact_id'];
    protected $casts = [
        'id' => 'integer',
        'user_id' => 'integer'
    ];

    public function contact()
    {
        return $this->belongsTo(\App\Models\Contact::class);
    }

    public function task()
    {
        return $this->belongsTo(\App\Models\Task::class);
    }
}