<?php

namespace App\Models\Setting;

use Illuminate\Database\Eloquent\Model;

class Assign extends Model
{
    protected $table = 'setting_assign';
    protected $fillable = ['team_id', 'web', 'web_rule', 'wechat', 'weibo', 'voip', 'repeat', 'mail'];


    public function setWebAttribute($value)
    {
        $this->attributes['web'] = json_encode($value);
    }

    public function getWebAttribute($value)
    {
        $array = json_decode($value, true);

        return $array ? $array : [];
    }

    public function setWechatAttribute($value)
    {
        $this->attributes['wechat'] = json_encode($value);
    }

    public function getWechatAttribute($value)
    {
        $array = json_decode($value, true);

        return $array ? $array : [];
    }

    public function setWeiboAttribute($value)
    {
        $this->attributes['weibo'] = json_encode($value);
    }

    public function getWeiboAttribute($value)
    {
        $array = json_decode($value, true);

        return $array ? $array : [];
    }

    public function setVoipAttribute($value)
    {
        $this->attributes['voip'] = json_encode($value);
    }

    public function getVoipAttribute($value)
    {
        $array = json_decode($value, true);

        return $array ? $array : [];
    }

    public function setWebRuleAttribute($value)
    {
        $this->attributes['web_rule'] = json_encode($value);
    }

    public function getWebRuleAttribute($value)
    {
        $array = json_decode($value, true);

        return $array ? $array : [];
    }

    public function setMailAttribute($value)
    {
        $this->attributes['mail'] = json_encode($value);
    }

    public function getMailAttribute($value)
    {
        $array = json_decode($value, true);

        return $array ? $array : [];
    }

}
