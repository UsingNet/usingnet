<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TeamApp extends Model
{
    protected $table = 'team_app';
    protected $fillable = ['team_id', 'appstore_id'];

    public function appstore()
    {
        return $this->belongsTo(Appstore::class);
    }
}
