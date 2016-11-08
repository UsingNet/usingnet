<?php

namespace App\Models;

use Jenssegers\Mongodb\Eloquent\Model;

class PluginContact extends Model
{
    protected $table = 'plugin_contact';
    protected $connection = 'mongodb';

    const TYPE_WECHAT = 'WECHAT';
    const TYPE_QZONE = 'QZONE';
    const TYPE_WEIBO = 'WEIBO';
    const TYPE_WECHAT_WEB = 'WECHAT_WEB';

    protected $fillable = ['type', 'name', 'img', 'openid', 'unionid', 'finger', 'team_id'];
}