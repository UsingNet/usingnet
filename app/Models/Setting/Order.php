<?php

namespace App\Models\Setting;

use Jenssegers\Mongodb\Eloquent\Model;

class Order extends Model
{
    protected $connection = 'mongodb';
    protected $table = 'setting_order';
    protected $fillable = ['title', 'items', 'team_id'];
}
