<?php

namespace App\Models;

use Jenssegers\Mongodb\Eloquent\Model;

class Visit extends Model
{
    protected $connection = 'mongodb';
    protected $table = 'visit';
    protected $fillable = ['team_id', 'times', 'second', 'track_id', 'contact_id', 'referrer',
        'ip', 'location', 'is_login', 'referrer', 'tags', 'created_at', 'updated_at', 'date'];
    protected $casts = [
        'team_id' => 'integer',
    ];

    public function contact()
    {
        return $this->belongsTo(\App\Models\Contact::class);
    }
}
