<?php

namespace App\Models;
use Jenssegers\Mongodb\Eloquent\Model;

class Track extends Model
{
    protected $connection = 'message';
    protected $table = 'track';
    protected $fillable = ['title', 'url', 'contact_id', 'track_id', 'page_id', 'referrer', 'team_id', 'ip',
        'location', 'created_at', 'updated_at', 'user_agent', 'date', 'counted'];
    protected $casts = [
        'id' => 'integer',
        'contact_id' => 'integer    '
    ];
}