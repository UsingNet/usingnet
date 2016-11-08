<?php

namespace App\Models\Setting;

use Illuminate\Database\Eloquent\Model;

class Notice extends Model
{
    const TYPE_VOICE_LONG = 'LONG';
    const TYPE_VOICE_SHORT = 'SHORT';
    const TYPE_TIMES_ONCE = 'ONCE';
    const TYPE_TIMES_MULIT = 'MULIT';

    protected $table = 'setting_notice';
    protected $fillable = ['team_id', 'voice', 'times'];
    protected $casts = [
        'team_id' => 'integer'
    ];
}
