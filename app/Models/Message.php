<?php

namespace App\Models;

use Jenssegers\Mongodb\Eloquent\Model;

class Message extends Model
{
    const TYPE_MAIL = 'MAIL';
    const TYPE_SMS = 'SMS';
    const TYPE_VOIP = 'VOIP';
    const TYPE_IM = 'IM';
    const TYPE_WECHAT = 'WECHAT';
    const TYPE_WEIBO = 'WEIBO';
    const TYPE_LISTENER = 'LISTENER';
    const TYPE_NOTE = 'NOTE';
    const TYPE_SYSTEM = 'SYSTEM';
    const TYPE_LM = 'LM';
    const TYPE_NOTIFICATION = 'NOTIFICATION';
    const DIRECTION_SEND = 'SEND';
    const DIRECTION_RECEIVE = 'RECEIVE';

    // 电话消息存入阵列　待录音完成后发送
    const VOICE_MESSAGE_REDIS_KEY = 'voice_message_queues';

    protected $connection = 'message';
    protected $table = 'message';
    protected $fillable = ['type', 'from', 'to', 'body', 'peer', 'direction', 'created_at', 'updated_at', 'package'];
    public $timestamps = false;

    public static function typeToText($type)
    {
        
    }
}
