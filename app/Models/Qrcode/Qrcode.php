<?php

namespace App\Models\Qrcode;

use Jenssegers\Mongodb\Eloquent\Model;

class Qrcode extends Model
{
    const TYPE_TEMP = 'TEMP';
    const TYPE_FOREVER = 'FOREVER';
    const MESSAGE_TYPE_TEXT = 'TEXT';
    const MESSAGE_TYPE_IMAGE = 'IMAGE';
    const MESSAGE_TYPE_NEWS = 'NEWS';

    // 投票
    const ACTION_VOTE = 'VOTE';

    protected $connection = 'mongodb';
    protected $table = 'qrcode';
    protected $fillable = ['team_id', 'type', 'url', 'ticket', 'title', 'scene_id', 'message_type', 'message',
        'wechat_id', 'src', 'subscribes', 'scans', 'params', 'action'];

    /**
     * 生成场景ID
     */
    public static function genSceneId()
    {
        $sceneId = mt_rand(111111, 999999);
        if (self::where('scene_id', $sceneId)->first()) {
            self::genSceneId();
        }

        return $sceneId;
    }
}
