<?php

namespace App\Library;

use Config;
use App\Library\Curl;
use App\Services\Qiniu;

class Weibo {

    const GET_USER_INFO = 'https://api.weibo.com/2/users/show.json?';
    const GET_IMAGE = 'https://upload.api.weibo.com/2/mss/msget?access_token=%s&fid=%s';
    const GET_VOICE = 'https://upload.api.weibo.com/2/mss/msget?access_token=%s&fid=%s';
    const SEND_MESSAGE = 'https://m.api.weibo.com/2/messages/reply.json?access_token=%s';
    const AUTH_REDIRECT = 'https://api.weibo.com/oauth2/authorize?';
    const GET_SHORT_URL = 'https://api.weibo.com/2/short_url/shorten.json?access_token=%s&url_long=%s';
    const GET_TOKEN = 'https://api.weibo.com/oauth2/access_token';

    private $accessToken;

    public function __construct($token = null)
    {
        $this->accessToken = $token;
    }

    public static function genShort($url)
    {
        $token = '2.00tTkfOG1v3ZCE628b8febeeZgxNPB'; // UsingNet 微博token
        $api = sprintf(self::GET_SHORT_URL, $token, urlencode($url));
        $resp = Curl::to($api)->get();
        $arr = @json_decode($resp, true);

        return isset($arr['urls'][0]['url_short']) ? $arr['urls'][0]['url_short'] : null;
    }

    public function authorize()
    {
        $callback = Config::get('app.url')  . $_SERVER['REQUEST_URI'];
        if (!isset($_GET['code']))  {
            $params = [
                'client_id' => Config::get('weibo.appkey'),
                'redirect_uri' => $callback,
            ];

            $redirect = self::AUTH_REDIRECT . http_build_query($params);
            header('Location: ' . $redirect);
            exit;
        }

        $code = $_GET['code'];
        $json = Curl::to(self::GET_TOKEN)->withData([
            'client_id' => Config::get('weibo.appkey'),
            'client_secret' => Config::get('weibo.appsecret'),
            'grant_type' => 'authorization_code',
            'code' => $code,
            'redirect_uri' => $callback
        ])->post();

        $array = @json_decode($json, true);
        $api = self::GET_USER_INFO . http_build_query($array);
        $json = Curl::to($api)->get();

        $userInfo = @json_decode($json, true);
        $user = [
            'openid' => 'weibo_' . $userInfo['id'],
            'name' => $userInfo['name'],
            'img' => $userInfo['avatar_hd'],
            'unionid' => 'weibo_' . $userInfo['id']
        ];

        return $user;
    }

    public function sendMessage($message, $receiverId, $type = 'text', $saveSenderBox = 1)
    {
        $api = sprintf(self::SEND_MESSAGE, $this->accessToken);

        if ($type == 'text') {
            $data = ['text' => $message];
        } else {
            $data = [
                'articles' => [
                    [
                        'display_name' => '分享图片',
                        'summary' =>  '点击查看 ',
                        'image' => $message,
                        'url' => $message
                    ]
                ]
            ];
        }

        $data = [
            'type' => $type,
            'data' => json_encode($data),
            'receiver_id' => intval($receiverId),
            'save_sender_box' => $saveSenderBox
        ];

        $resp =  Curl::to($api)->withData($data)->post();
        $resp = @json_decode($resp, true);

        if (!$resp) {
            throw new \Exception('发送失败');
        } elseif (isset($resp['error'])) {
            throw new \Exception($resp['error'], $resp['error_code']);
        }

        return true;
    }

    public function getUserInfo($uid)
    {
        $api = self::GET_USER_INFO . http_build_query(['uid' => $uid, 'access_token' => $this->accessToken]);
        $response = Curl::to($api)->get();

        return @json_decode($response, true);
    }

    public function getImage($id)
    {
        $api = sprintf(self::GET_IMAGE, $this->accessToken, $id);
        $con = Curl::to($api)->get();
        return  Qiniu::upload($con, 'jpg');
    }

    public function getVoice($id)
    {
        $api = sprintf(self::GET_VOICE, $this->accessToken, $id);
        $con = Curl::to($api)->get();

        return  Qiniu::upload($con, 'mp3');
    }

    public static function check($request)
    {
        $signature = $request->get('signature');
        $timestamp = $request->get('timestamp');
        $nonce = $request->get('nonce');
        $tmpArr = [$nonce, $timestamp, Config::get('weibo.appsecret')];
        sort($tmpArr, SORT_STRING);
        $tmp = sha1(implode($tmpArr));
        if ($tmp !== $signature) {
            exit('signature fail');
        }

        if ($str = $request->get('echostr')) {
            echo $str;
            exit;
        }
    }
}