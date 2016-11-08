<?php

namespace App\Services;

use App\Library\Curl;
use Illuminate\Support\Facades\Config;
use Mockery\CountValidator\Exception;

class Youzan
{
    const API_AUTH_URI = 'https://open.koudaitong.com/oauth/authorize?client_id=%s&response_type=code&state=%s&redirect_uri=%s';
    const API_AUTH_TOKEN = 'https://open.koudaitong.com/oauth/token';
    const API_BASE = 'https://open.koudaitong.com/api/oauthentry?access_token=%s&method=%s';

    public function __construct()
    {
        $this->client_id = Config::get('plugin.youzan.client_id');
        $this->client_secret = Config::get('plugin.youzan.client_secret');
        $this->redirect = Config::get('plugin.youzan.redirect_uri');
    }


    public function redirectAuth()
    {
        $api = sprintf(self::API_AUTH_URI, $this->client_id, $this->client_secret, $this->redirect);
        return redirect($api);
    }

    public function auth($code)
    {
        $response = Curl::to(self::API_AUTH_TOKEN)
            ->withData([
                'client_id' => $this->client_id,
                'client_secret' => $this->client_secret,
                'grant_type' => 'authorization_code',
                'code' => $code,
                'redirect_uri' => $this->redirect
            ])->post();

        return @json_decode($response, true);
    }

    public function getShop($accessToken)
    {
        $api = sprintf(self::API_BASE, $accessToken, 'kdt.shop.basic.get');
        $response = Curl::to($api)->get();

        $array =  @json_decode($response, true);

        return isset($array['response']) ? $array['response'] : false;
    }

    public function getOrder($accessToken, $userId)
    {
        $api = sprintf(self::API_BASE, $accessToken, 'kdt.trades.sold.get');
        $response = Curl::to($api)->withData(['user_id' => $userId])->get();

        $response = @json_decode($response, true);

        return $response['response']['trades'];
    }

    public function getUser($accessToken, $openid)
    {
        $api = sprintf(self::API_BASE, $accessToken, 'kdt.users.weixin.follower.get');
        $response = Curl::to($api)->withData(['weixin_openid' => $openid])->post();
        $response = @json_decode($response, true);

        return isset($response['response']['user']) ? $response['response']['user'] : [];
    }

    public function updateMemo($accessToken, $id, $content)
    {
        $api = sprintf(self::API_BASE, $accessToken, 'kdt.trade.memo.update') ;

        return Curl::to($api)->withData(['tid' => $id, 'memo' => $content])->post();
    }

    public function close($accessToken, $id)
    {
        $api = sprintf(self::API_BASE, $accessToken, 'kdt.trade.close');

        return Curl::to($api)->withData(['tid' => $id])->post();
    }

    public static function refreshToken($refreshToken)
    {
        $response = Curl::to(self::API_AUTH_TOKEN)
            ->withData([
                'grant_type' => 'refresh_token',
                'refresh_token' => $refreshToken,
                'client_id' => Config::get('plugin.youzan.client_id'),
                'client_secret' => Config::get('plugin.youzan.client_secret')
            ])->post();

        $response = @json_decode($response, true);


        if (!isset($response['access_token'])) {
            throw new \Exception('刷新 token 失败');
        }


        return $response;
    }
}
