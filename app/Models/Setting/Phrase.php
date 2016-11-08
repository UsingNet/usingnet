<?php

namespace App\Models\Setting;

use Illuminate\Database\Eloquent\Model;

class Phrase extends Model
{
    protected $table = 'setting_phrase';
    protected $fillable = ['content', 'team_id'];
    protected $casts = [
        'id' => 'integer',
        'team_id' => 'integer'
    ];
}
