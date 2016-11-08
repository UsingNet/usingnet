<?php

namespace App\Models\Setting;

use Illuminate\Database\Eloquent\Model;

class Holiday extends Model
{
    protected $table = 'setting_holiday';
    protected $fillable = ['team_id', 'date', 'work'];
    public $timestamps = false;
    protected $casts = [
        'id' => 'integer',
        'team_id' => 'integer',
        'date' => 'integer'
    ];
}
