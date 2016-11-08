<?php

namespace App\Models\Setting;

use Config;
use App\Library\Curl;
use App\Library\Syslog;
use Gibson\Wechat\ComponentAccessToken;
use Illuminate\Database\Eloquent\Model;
use Mockery\CountValidator\Exception;
use Illuminate\Database\Eloquent\SoftDeletes;

class Weibo extends Model
{
    protected $table = 'setting_weibo';
    protected $fillable = ['name', 'team_id', 'weibo_id', 'access_token', 'img', 'default_reply', 'not_online_agent_reply', 'expires_in', 'verified'];
    protected $casts = [
        'verified' => 'bool'
    ];
}
