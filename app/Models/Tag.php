<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    protected $table = 'tag';
    protected $fillable = ['name', 'color', 'team_id'];
    public $timestamps = false;
    protected $casts = [
        'id' => 'integer',
        'team_id' => 'integer'
    ];
}