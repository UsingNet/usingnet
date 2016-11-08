<?php

namespace App\Models\Setting;

use Illuminate\Database\Eloquent\Model;

class AutoReply extends Model
{
    const STATUS_OPEN = 'open';
    const STATUS_CLOSE = 'close';

    protected $table = 'setting_auto_reply';
    protected $fillable = ['welcome', 'timeout', 'bye', 'team_id'];
    protected $casts = [
        'id' => 'integer',
        'team_id' => 'integer'
    ];

    public function getWelcomeAttribute($json)
    {
        $arr = json_decode($json, true);
        if (empty($arr['message'])) {
            $arr['message'] = '请问有什么可以帮助您？';
        }
        return $arr;
    }

    public function getTimeoutAttribute($json)
    {
        $arr = json_decode($json, true);
        if (empty($arr['message'])) {
            $arr['message'] = '客服忙碌，请稍等';
        }

        return $arr;
    }

    public function getByeAttribute($json)
    {
        $arr = json_decode($json, true);
        if (empty($arr['message'])) {
            $arr['message'] = '对话结束';
        }

        return $arr;
    }

    public function getOffworkAttribute($json)
    {
        $arr = json_decode($json, true);
        if (empty($arr['message'])) {
            $arr['message'] = '对话结束';
        }

        return $arr;
    }

    public function setWelcomeAttribute($array)
    {
        $this->attributes['welcome'] = json_encode($array);
    }

    public function setTimeoutAttribute($array)
    {
        $this->attributes['timeout'] = json_encode($array);
    }

    public function setByeAttribute($array)
    {
        $this->attributes['bye'] = json_encode($array);
    }

    public function setOffworkAttribute($array)
    {
        $this->attributes['offwork'] = json_encode($array);
    }
}
