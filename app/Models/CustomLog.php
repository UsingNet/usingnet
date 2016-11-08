<?php

namespace App\Models;

use Jenssegers\Mongodb\Eloquent\Model;

class CustomLog extends Model
{
    protected $connection = 'mongodb';
    protected $table = 'custom_log';
    protected $fillable = ['team_id', 'message', 'data'];
    protected $casts = [
        'team_id' => 'integer'
    ];
}

