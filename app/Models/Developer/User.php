<?php

namespace App\Models\Developer;

use Jenssegers\Mongodb\Eloquent\Model;

class User extends Model
{
    protected $connection = 'mongodb';
    protected $table = 'developer_user';
    protected $fillable = ['userid', 'name', 'position', 'mobile', 'gender', 'email', 'weixinid', 'avatar'];
}