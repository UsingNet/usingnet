<?php

namespace App\Library;

use Illuminate\Support\Facades\Config;


class Qzone
{
    const AUTH_REDIRECT = 'https://graph.qq.com/oauth2.0/authorize?';
    const GET_TOKEN = 'https://graph.qq.com/oauth2.0/token?';
    const GET_ME = 'https://graph.qq.com/oauth2.0/me?access_token=';
    const GET_USER_INFO = 'https://graph.qq.com/user/get_user_info?';

    public function authorize()
    {
        $callback = (Config::get('app.url')  . $_SERVER['REQUEST_URI']);

        // 跳转授权
        if (!isset($_GET['code']))  {
            $params = [
                'response_type'  => 'code',
                'client_id' => Config::get('qzone.appid'),
                'redirect_uri' => $callback,
                'state' => 'state'
            ];

            $redirect = self::AUTH_REDIRECT . http_build_query($params);
            header('Location: ' . $redirect);
            exit;
        }

        // 获取 accessToken
        $code = $_GET['code'];
        $params = [
            'grant_type' => 'authorization_code',
            'client_id' => Config::get('qzone.appid'),
            'client_secret' => Config::get('qzone.appkey'),
            'code' => $code,
            'redirect_uri' => $callback
        ];

        $api = self::GET_TOKEN . http_build_query($params);
        $resp = Curl::to($api)->get();

        $arr = [];
        parse_str($resp, $arr);

        // 获取 openid
        $api = self::GET_ME . $arr['access_token'];
        $resp = Curl::to($api)->get();
        preg_match('/"openid":"(.*?)"/', $resp, $match);

       $params = [
            'access_token' => $arr['access_token'],
            'openid' => $match[1],
            'oauth_consumer_key' => Config::get('qzone.appid')
        ];
        $api = self::GET_USER_INFO . http_build_query($params);

        $json = Curl::to($api)->get();
        $userInfo = @json_decode($json, true);
        $user = [
            'name' => $userInfo['nickname'],
            'openid' => 'qzone_' . $match[1],
            'img' => $userInfo['figureurl_qq_2'],
            'unionid' => 'qzone_' . $match[1]
        ];

        return $user;
    }
}

