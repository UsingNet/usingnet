<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Appstore extends Model
{
    protected $table = 'appstore';
    protected $fillable = ['name', 'desc', 'url', 'callback', 'secret', 'img', 'token', 'key', 'mobile_url'];
}
