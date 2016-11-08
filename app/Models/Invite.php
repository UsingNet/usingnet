<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invite extends Model
{
    protected $table = 'invite';
    protected $fillable = ['team_id', 'invite_team_id'];
    protected $casts = [
        'id' => 'integer',
        'team_id' => 'integer'
    ];
}
