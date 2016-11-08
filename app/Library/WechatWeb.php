<?php

namespace App\Library;

use Illuminate\Support\Facades\Config;


class WechatWeb
{
    const REDIRECT_URI = 'https://open.weixin.qq.com/connect/qrconnect?';
    const GET_TOKEN = 'https://api.weixin.qq.com/sns/oauth2/access_token?';
    const GET_USER = 'https://api.weixin.qq.com/sns/userinfo?';

    public function authorize()
    {
        $callback = Config::get('app.url')  . $_SERVER['REQUEST_URI'];
        if (!isset($_GET['code'])) {
            $params = [
                'appid' => Config::get('wechat-web.appid'),
                'redirect_uri' => $callback,
                'response_type' => 'code',
                'scope' => 'snsapi_login'
            ];

            $redirect = self::REDIRECT_URI . http_build_query($params);
            header('Location: ' . $redirect);
            exit;
        }

        $code = $_GET['code'];
        $params = [
            'code' => $code,
            'appid' => Config::get('wechat-web.appid'),
            'secret' => Config::get('wechat-web.appsecret'),
            'grant_type' => 'authorization_code',
        ];

        $api = self::GET_TOKEN . http_build_query($params);
        $resp = Curl::to($api)->get();
        $info = json_decode($resp, true);

        $params = [
            'access_token' => $info['access_token'],
            'openid' => $info['openid']
        ];

        $api = self::GET_USER . http_build_query($params);
        $resp = Curl::to($api)->get();
        $userInfo = @json_decode($resp, true);
        $user = [
            'name' => $userInfo['nickname'],
            'img' => $userInfo['headimgurl'],
            'openid' => $userInfo['openid'],
            'unionid' => $userInfo['unionid'],
            'finger' => md5(Curl::to($userInfo['headimgurl'])->get() . $userInfo['nickname'])
        ];

        return $user;
    }
}

