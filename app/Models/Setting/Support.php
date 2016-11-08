<?php

namespace App\Models\Setting;


use Illuminate\Database\Eloquent\Model;

class Support extends Model
{
    protected $table = 'setting_support';
    protected $fillable = ['team_id', 'domain', 'theme'];
}