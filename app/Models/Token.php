<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Token extends Model
{
    protected $table = 'voip_token';
    protected $fillable = ['user_id', 'token'];
    public $timestamps = false;
    protected $casts = [
        'id' => 'integer',
        'user_id' => 'integer'
    ];
}