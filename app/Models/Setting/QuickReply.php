<?php

namespace App\Models\Setting;

use Illuminate\Database\Eloquent\Model;

class QuickReply extends Model
{
    const MAX_NUM = 10;

    const TYPE_PERSONAL = 'PERSONAL';
    const TYPE_COMMON = 'COMMON';

    protected $table = 'setting_quick_reply';
    protected $fillable = ['shortcut', 'content', 'user_id', 'type', 'team_id'];
    protected $casts = [
        'id' => 'integer',
        'team_id' => 'integer'
    ];
}
