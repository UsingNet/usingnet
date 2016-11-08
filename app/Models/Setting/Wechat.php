<?php

namespace App\Models\Setting;

use Config;
use App\Library\Curl;
use App\Library\Syslog;
use Gibson\Wechat\ComponentAccessToken;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Wechat extends Model
{
    use SoftDeletes;

    const MODE_EXPRESS = 'EXPRESS';
    const MODE_ENCRYPTION = 'ENCRYPTION';
    const GET_ACCESS_TOKEN = 'https://api.weixin.qq.com/cgi-bin/component/api_authorizer_token?component_access_token=';
    const TYPE_AUTH = 'AUTH';
    const TYPE_SETUP = 'SETUP';

    protected $table = 'setting_wechat';
    protected $fillable = ['nick_name', 'head_img', 'team_id', 'service_type', 'verify_type_info', 'user_name', 'business_info',
        'alias', 'token', 'qrcode_url', 'app_id', 'app_secret', 'encoding_aes_key', 'type','func_info', 'access_token',
        'expires_in', 'refresh_token', 'updated_token_at', 'mode', 'url', 'template_id', 'use_template_message', 'default_reply',
        'not_online_agent_reply', 'evaluation', 'subscribe_reply'];

    protected $casts = [
        'id' => 'integer',
        'team_id' => 'integer',
        'verify_type_info' => 'integer',
        'use_template_message' => 'boolean',
        'evaluation' => 'integer'
    ];

    public function setFuncInfoAttribute($value)
    {
        $this->attributes['func_info'] = json_encode($value);
    }

    public function getFuncInfoAttribute($value)
    {
        $array = @json_decode($value, true);

        return is_array($array) ? $array : [];
    }

    public function setBusinessInfoAttribute($value)
    {
        $this->attributes['business_info'] = json_encode($value);
    }

    public function getBusinessInfoAttribute($value)
    {
        $array = @json_decode($value, true);

        return is_array($array) ? $array : [];
    }

    /**
     * 获取公众号 token
     * @return mixed
     */
    public function getAccessToken()
    {
        if (time() - $this->updated_token_at >= $this->expires_in) {
	        $accessToken = new ComponentAccessToken;
            $url = self::GET_ACCESS_TOKEN . $accessToken->getToken();
            $json = Curl::to($url)
                ->withData(json_encode([
                    'component_appid' => Config::get('wechat.component.appid'),
                    'authorizer_appid' => $this->app_id,
                    'authorizer_refresh_token' => $this->refresh_token
                ]))
                ->post();

            try {
                $data = json_decode($json);
                $this->access_token = $data->authorizer_access_token;
                $this->refresh_token = $data->authorizer_refresh_token;
                $this->expires_in = $data->expires_in;
                $this->updated_token_at = time();
                $this->save();
            } catch (\Exception $e) {
                Syslog::logger('AccessToken')->addCritical('GET_ACCESS_TOKEN_ERROR', $e->getTrace());
                throw new \Exception($e->getMessage());
            }
        }

        return $this->access_token;
    }

    public function getJsTicket()
    {
        $redis = \Redis::connection();
        $key = 'usingnet:wechat:js:ticket:' . $this->id;
        $token = $redis->get($key);
        if (!$token) {
            $api = sprintf('https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=%s&type=jsapi', $this->getAccessToken());
            $resp = Curl::to($api)->post();
            try {
                $resp = json_decode($resp, true);
                $token = $resp['ticket'];
                $redis->setex($key, $resp['expires_in'], $token);
            } catch (\Exception $e) {
                throw new \Exception('Js Ticket 获取失败');
            }
        }

        return $token;
    }

    public static function sendEvaluation()
    {

    }
}
