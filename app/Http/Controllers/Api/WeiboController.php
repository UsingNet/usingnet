<?php

namespace App\Http\Controllers\Api;

use App\Library\Curl;
use App\Models\CustomerManage;
use App\Services\Qiniu;
use Config;
use App\Models\Message;
use App\Models\Order;
use App\Models\Team;
use App\Services\Messanger;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Library\Weibo;
use App\Models\Contact;
use App\Models\Setting\Weibo as SettingWeibo;

class WeiboController extends Controller
{

    public function __construct()
    {
        $this->middleware('auth', ['except' => 'anyCallback']);
    }

    public function anyCallback(Request $request, $id) {
        Weibo::check($request);

        $setting = SettingWeibo::where('weibo_id', $id)->first();
        if (!$setting) {
            return $this->responseJsonError('客服团队不存在', 404);
        }
        $team = Team::find($setting->team_id);
        $weibo = new Weibo($setting->access_token);
        $data = file_get_contents('php://input');
        $message = @json_decode($data, true);
        if (!is_array($message)) {
            throw new \Exception('');
        }

        $body = '';
        switch ($message['type']) {
            case 'text':
                $body = $message['text'];
                break;
            case 'voice':
                $src = $weibo->getVoice($message['data']['tovfid']);
                $body = sprintf('<audio src="%s" controls="controls"/>', $src);
                break;
            case 'image':
                $src = $weibo->getImage($message['data']['tovfid']);
                $body = sprintf('<img src="%s"/>', $src);
                break;
        }

        if (!$body) {
            exit;
        }

        try {
            $contact = Contact::firstOrCreate([
                'weibo_user_id' => $message['sender_id'],
                'weibo_id' => $setting->id,
            ], $team);
        } catch (\Exception $e) {
            return view('errors.error', ['title' => '授权失败', 'desc' => '微博授权失败，请重新授权']);
        }

        $order = Order::firstOrCreate($contact, $team, Message::TYPE_WEIBO, $setting);

        $to = $team->token;

        if (CustomerManage::inCustomers($team->id)) {
            $to = CustomerManage::getManager()->token;
        }

        $message = [
            'from' => $contact->token,
            'to' => $to,
            'direction' => Message::DIRECTION_RECEIVE,
            'body' => $body,
            'package' => [
                'team_id' => $team->id,
                'order_id' => $order->id,
                'contact' => array_only($contact->toArray(), ['id', 'name', 'img'])
            ]
        ];

        if ($order->user) {
            $message['package']['agent'] = array_only($order->user->toArray(), ['id', 'name', 'img']);
        }

        $response = Messanger::weibo($message);
        if (!$response['connectors']['im']) {
            $order->reAssign($contact, $message);
        }
    }

    public function getAuth(Request $request)
    {
        $code = $request->get('code');
        $redirectURI = 'https://home.usingnet.com/api/weibo/auth';
        if (!$code) {
            $params = [
                'client_id' => Config::get('weibo.appkey'),
                'redirect_uri' => $redirectURI,
            ];
            return redirect('https://api.weibo.com/oauth2/authorize?' . http_build_query($params));
        }

        $json = Curl::to('https://api.weibo.com/oauth2/access_token')->withData([
            'client_id' => Config::get('weibo.appkey'),
            'client_secret' => Config::get('weibo.appsecret'),
            'grant_type' => 'authorization_code',
            'code' => $code,
            'redirect_uri' => $redirectURI
        ])->post();

        $array = @json_decode($json, true);
        if (is_array($array) && isset($array['uid'])) {
            $weibo = \App\Models\Setting\Weibo::where('weibo_id', $array['uid'])->first();
            if ($weibo) {
                return view('errors.error', ['title' => '授权失败', 'desc' => '该微博已经在优信授权']);
            }

            $json = @file_get_contents('https://api.weibo.com/2/users/show.json?' . http_build_query($array));
            $userInfo  = @json_decode($json, true);
            if (!isset($userInfo['name']) || !isset($userInfo['avatar_large'])) {
                return view('errors.error', ['title' => '授权失败', 'desc' => '获取用户信息失败']) ;
            }

            $img = Qiniu::upload(Curl::to($userInfo['avatar_large'])->get());
            $weibo = \App\Models\Setting\Weibo::create([
                'name' => $userInfo['name'],
                'img' => $img,
                'weibo_id' => $array['uid'],
                'team_id' => $request->user()->team_id,
                'access_token' => $array['access_token'],
                'expires_in' => $array['expires_in'],
                'verified' => $userInfo['verified']
            ]);

            return redirect(asset('/setting/weibo?id=' . $weibo->id));
        }
        return redirect(asset('/setting/weibo'));
    }

    public function __call($method, $parameters)
    {
        parent::__call($method, $parameters); // TODO: Change the autogenerated stub
    }
}