<?php

namespace App\Models\Knowledge;

use Jenssegers\Mongodb\Eloquent\Model;

class Comment extends Model
{
    const STATUS_CREATED = 'CREATED';
    const STATUS_REPLY = 'REPLY';
    const STATUS_IGNORE = 'IGNORE';
    const STATUS_DELAY = 'DELAY';

    protected $connection = 'mongodb';
    protected $table = 'knowledge_comment';
    protected $fillable = ['team_id', 'knowledge_id', 'question', 'status'];
    protected $casts = [
        'team_id' => 'integer'
    ];
}