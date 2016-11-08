<?php

namespace App\Models\Setting;

use App\Models\Team;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Redis;
use Overtrue\Wechat\Notice;

class Sms extends Model
{
    //　推送微信消息，通过 key 判断审核员权限
    const REDIS_PREFIX = 'usingnet:sms:check:';

    const STATUS_INIT = 'INIT';
    const STATUS_CHECKING = 'CHECKING';
    const STATUS_FAIL = 'FAIL';
    const STATUS_SUCCESS = 'SUCCESS';

    protected $table = 'setting_sms';
    protected $fillable = ['team_id', 'status', 'signature', 'phone', 'fail_message'];
    protected $casts = [
        'id' => 'integer',
        'team_id' => 'integer'
    ];

    public function team()
    {
        return $this->belongsTo(Team::class);
    }


    public static function signatureNotice($team, $signature)
    {
        $notice = new Notice(Config::get('wechat.appid'), Config::get('wechat.secret'));
        $to  = env('WECHAT_SMS_SIGNATURE_INSPECTOR');
        $templateId = env('WECHAT_SMS_TEMPLATE_ID');

        $params = [
            'first' => '有新的短信签名要审核',
            'keyword1' => $team->name,
            'keyword2' => $signature
        ];

        $notice->send($to, $templateId, $params, 'https://admin.' . env('APP_DOMAIN') . '/checking/sms');
    }

    public static function templateNotice($template)
    {
        $notice = new Notice(Config::get('wechat.appid'), Config::get('wechat.secret'));
        $to  = env('WECHAT_SMS_TEMPLATE_INSPECTOR');
        //$to = 'oLOwHuKOkZ-ZuMwawuwGhZ1tb7_8';
        $templateId = env('WECHAT_SMS_TEMPLATE_ID');
        $params = [
            'first' => '有新的短信模板要审核',
            'keyword1' => $template
        ];

        $rand = uniqid();
        $key = self::REDIS_PREFIX . $rand;
        $redis = Redis::connection();
        $redis->setex($key, 3600 * 24, 1);
        $url = 'https://wx.usingnet.com/api/sms/check?key=' . $rand;
        $resp = $notice->send($to, $templateId, $params, $url);
    }
}
