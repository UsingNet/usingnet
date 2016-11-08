<?php

namespace App\Models\Setting;

use Illuminate\Database\Eloquent\Model;

class Voip extends Model
{
    const STATUS_INIT = 'INIT';
    const STATUS_CHECKING = 'CHECKING';
    const STATUS_SUCCESS = 'SUCCESS';
    protected $table = 'setting_voip';
    protected $fillable = ['team_id', 'status', 'number', 'bind_number', 'worktime',
        'offworkweekday', 'offworkdate', 'offworkprompt', 'display_number', 'display_number_status', 'display_number_files'];
    protected  $casts = [
        'id' => 'integer',
        'team_id' => 'integer'
    ];

    public function team()
    {
        return $this->belongsTo(\App\Models\Team::class);
    }

    public function getDisplayNumberFilesAttribute($json)
    {
        $arr = json_decode($json, true);

        return $arr ? $arr : [];
    }

    public function setDisplayNumberFilesAttribute($array)
    {
        $this->attributes['display_number_files'] = json_encode($array);
    }
}
