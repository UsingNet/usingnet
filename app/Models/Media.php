<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Media extends Model
{
    const TYPE_MAIL = 'MAIL';
    const TYPE_VOICE = 'VOICE';
    const TYPE_SMS = 'SMS';
    const STATUS_CHECKING = 'CHECKING';
    const STATUS_FAIL = 'FAIL';
    const STATUS_SUCCESS = 'SUCCESS';

    protected $table = 'media';
    protected $fillable = ['team_id', 'user_id', 'title', 'content', 'remark', 'send', 'likes', 'views', 'refuses', 'type',
        'system_media_id', 'status', 'tpl_id', 'fail_message'];
    protected $casts = [
        'id' => 'integer',
        'user_id' => 'integer',
        'team_id' => 'integer'
    ];


    public static function exists()
    {

    }
}
