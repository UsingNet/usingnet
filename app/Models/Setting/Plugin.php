<?php

namespace App\Models\Setting;

use Illuminate\Database\Eloquent\Model;

class Plugin extends Model
{
     protected $table = 'setting_plugin';
     protected $fillable = ['team_id', 'callback', 'secret', 'plugin'];
     protected $casts = [
          'id' => 'integer',
          'team_id' => 'integer'
     ];
}
