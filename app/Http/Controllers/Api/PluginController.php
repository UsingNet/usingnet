<?php

namespace App\Http\Controllers\Api;


use App\Library\WechatWeb;
use App\Models\PluginContact;
use App\Library\Curl;
use App\Library\Qzone;
use App\Models\Appstore;
use App\Library\Weibo;
use App\Models\Contact;
use App\Models\Developer\Error;
use App\Models\Media;
use App\Models\Message;
use App\Models\Order;
use App\Models\Plugin\Winning;
use App\Models\Setting\Sms;
use App\Models\Team;
use App\Models\Setting\Wechat;
use App\Models\Qrcode\Qrcode as QrcodeModel;
use Gibson\Wechat\QRCode;
use App\Services\Messanger;
use App\Services\NewSms;
use App\Services\Qiniu;
use Gibson\Wechat\Auth;
use Gibson\Wechat\Staff;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Validator;
use MongoDB\BSON\ObjectID;

class PluginController extends Controller
{
    private $team;
    const prefix = 'usingnet:plugin:';

    public function __construct(Request $request)
    {
        // auth 接口不验证
        if ($request->path() !== 'api/plugin/auth' && $request->path() !== 'api/plugin/error') {
            $params = $request->all();
            if (empty($params['key']) || empty($params['nonce']) || empty($params['timestamp']) || empty($params['signature'])) {
                header("content-type:application/json;charset=utf8");
                exit('{"success": false, "msg": "缺少参数"}');
            }
            if (isset($params['signature'])) unset($params['signature']);
            $plugin = Appstore::where('key', $params['key'])->first();
            if (!$plugin) {
                header("content-type:application/json;charset=utf8");
                exit('{"success": false, "msg": "插件不存在"}');
            }

            $redis = \Redis::connection();
            $key = 'usingnet:plugin:nonce:' . $params['nonce'];
            if ($redis->get($key)) {
                header("content-type:application/json;charset=utf8");
                exit('{"success": false, "msg": "请求失败"}');
            }
            $redis->setex($key, 5 * 60, 1);

            $signature = $request->get('signature');
            ksort($params);
            $url = preg_replace('/\?.*/', '', $request->fullUrl()) . '?';
            $baseStr = $url . http_build_query($params) . '$' . $plugin->token;
            $sign = sha1($baseStr);
            if ($signature !== $sign) {
                header("content-type:application/json;charset=utf8");
                exit('{"success": false, "msg": "验证失败"}');
            }
        }

        if ($request->path() !== 'api/plugin/error') {
            $team = Team::where('token', $request->get('token'))->first();
            if (!$team) {
                header("content-type:application/json;charset=utf8");
                exit('{"success": false, "msg": "团队不存在"}');
            }

            $this->team = $team;
        }
    }

    /**
     * 获取微信列表
     */
    public function getWechat()
    {
        $wechats = Wechat::where('team_id', $this->team->id)->get();
        $resp = [];
        foreach ($wechats as $wechat) {
            $resp[] = [
                'app_id' => $wechat->app_id,
                'name' => $wechat->nick_name,
                'img' => $wechat->head_img
            ];
        }

        return $this->responseJson(['data' => $resp]);
    }

    /**
     *  微信 js api 签名
     */
    public function getWechatjsticket(Request $request)
    {
        $wechat = Wechat::where(['app_id' => $request->get('app_id'), 'team_id' => $this->team->id])->first();
        if (!$wechat) {
            return $this->responseJsonError('公众号不存在', 403);
        }
        try {
            $ticket = $wechat->getJsTicket();
        } catch (\Exception $e) {
            return $this->responseJsonError('获取失败: '. $e->getMessage(), 403);
        }
        $params = [
            'noncestr' => 'rad' . mt_rand(111111, 999999),
            'jsapi_ticket' => $ticket,
            'timestamp' => time(),
            'url' => $request->get('url')
        ];

        ksort($params, SORT_ASC);
        $str = urldecode(http_build_query($params));
        $params['signature'] = sha1($str);

        $resp = [
            'jsApiList' => ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo',
                'onMenuShareQZone', 'chooseImage', 'uploadImage', 'scanQRCode', 'chooseWXPay'],
            'appId' => $request->get('app_id'),
            'nonceStr' => $params['noncestr'],
            'timestamp' => $params['timestamp'],
            'signature' => $params['signature']
        ];

        return $this->responseJson(['data' => $resp]);
    }

    public function getCardsign(Request $request)
    {
        $req = $request->only('app_id', 'card_id');
        $wechat = Wechat::where(['team_id' => $this->team->id, 'app_id' => $req['app_id']])->first();
        if (!$wechat) {
            return $this->responseJsonError('公众号不存在', 404);
        }
        $key = 'usingnet:plugin:apiticket:' . $wechat->id;
        $redis = Redis::connection();
        $ticket = $redis->get($key);
        if (!$ticket) {
            $api = sprintf('https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=%s&type=wx_card', $wechat->getAccessToken());
            $resp = Curl::to($api)->get();
            $arr = @json_decode($resp, true);
            if ($arr) {
                $ticket = $arr['ticket'];
                $redis->setex($key, $arr['expires_in'], $ticket);
            }
        }

        $timestamp = time();
        $rand = mt_rand(1111111111, 9999999999);
        $tmpArr = [$timestamp, $rand, $ticket, $req['card_id']];
        sort($tmpArr, SORT_STRING);
        $sign = sha1(implode($tmpArr));

        return $this->responseJson(['data' => [
            'timestamp' => $timestamp,
            'nonce_str' => $rand,
            'signature' => $sign
        ]]);
    }

    /**
     * 获取联系人信息
     */
    public function getContact(Request $request)
    {
        $unionid = $request->get('unionid');
        $contact = PluginContact::where('team_id', $this->team->id)
            ->where('openid', $unionid)
            ->first();

        if (!$contact) {
            return $this->responseJsonError('联系人不存在', 404);
        }

        if ($contact->type === PluginContact::TYPE_WECHAT) {
            $exists = Contact::where('team_id', $this->team->id)
                ->where('openid', $unionid)
                ->first();
            if ($exists) {
                $contact->unsubscribed = $exists->unsubscribed;
            }
        }

        return $this->responseJson(['data' => array_only($contact->toArray(), ['name', 'img', 'unionid', 'openid', 'unsubscribed'])]);
    }

    /**
     * 留言
     */
    public function postLm(Request $request)
    {
        $params = $request->only('email', 'phone', 'body', 'user_agent', 'ip', 'name', 'avatar', 'unionid', 'notify', 'app_id', 'name', 'msg');
        $regex = Config::get('regular.phone');
        $validator = Validator::make($params, [
            'phone' => ['regex:' . $regex],
            'email' => 'email|required_without:phone',
            'body' => 'required'
        ], [
            'phone.regex' => '手机格式不正确',
            'email.email' => '邮件格式不正确',
            'email.required_without' => '缺少联系方式',
            'body.required' => '缺少内容',
        ]);

        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        $condition = ['team_id' => $this->team->id];
        if ($params['email']) {
            $condition['email'] = $params['email'];
        }
        if ($params['phone']) {
            $condition['phone'] = $params['phone'];
        }

        $contact = null;
        $union = null;
        if ($params['unionid']) {
            $contact = Contact::where('team_id', $this->team->id)
                ->where('openid', $params['unionid'])
                ->first();

            $union = PluginContact::where('unionid', $params['unionid'])
                ->where('team_id', $this->team->id)
                ->first();

            if (!$contact && $union && $union->finger) {
                $contact = Contact::where('wechat_fingerprint', $union->finger)
                    ->where('team_id', $this->team->id)
                    ->first();
            }
        }

        if (!$contact) {
            $params['track_id'] = new ObjectID();
            $params['team_id'] = $this->team->id;
            $params['user_info'] = array_only($params, ['email', 'phone']);
            $contact = Contact::createByIp($params);
            $contact->openid = $params['unionid'];

            if ($params['name']) {
                $contact->name = $params['name'];
            }
            if ($params['avatar']) {
                $contact->img = $params['avatar'];
            }

            if ($union) {
                $contact->wechat_fingerprint = $union->wechat_fingerprint;
                $contact->nickname = $union->nickname;
            }

            $package = $contact->package;
            $contact->package = array_merge($package, ['user_agent' => $params['user_agent']]);
            $contact->save();
        } else {
            $contact->fill($params);
            $contact->save();
        }

        $order = Order::firstOrCreate($contact, $this->team, Message::TYPE_IM);
        $order->update(['type' => Message::TYPE_WECHAT, 'status' => Order::STATUS_OPEN]);
        $message = [
            'from' => $order->from,
            'to' => $this->team->token,
            'body' => $params['body'],
            'direction' => Message::DIRECTION_RECEIVE,
            'package' => [
                'team_id' => $this->team->id,
                'order_id' => $order->id,
                'contact' => array_only($contact->toArray(), ['id', 'img', 'name']),
                'signup' => $params['msg']
            ]
        ];
        if ($order->user) {
            $message['package']['agent'] = array_only($order->user->toArray(), ['id', 'img', 'name']);
        }

        if (intval($params['notify']) && $params['msg']) {
            $wechat = Wechat::where('app_id', $params['app_id'])->first();
            if ($wechat) {
                $staff = new Staff($wechat->getAccessToken());
                try {
                    $staff->send($params['msg'])->to($contact->openid);
                } catch (\Exception $e) {
                    \Log::info('报名失败:' . $e->getMessage());
                }
            }
        }

        $response = Messanger::wechat($message);
        if (!$response['connectors']['im'] && $order->user_id) {
            $order->reAssign($contact, $params);
        }

        return $this->responseJson('ok');
    }

    /**
     * 网页验证
     */
    public function getAuth(Request $request)
    {
        $type = strtoupper($request->get('type', 'wechat'));
        $redirect = $request->get('referrer');
        if (preg_match('/\?/', $redirect)) {
            $redirect .= '&';
        } else {
            $redirect .= '?';
        }

        try {
            if ($type === PluginContact::TYPE_QZONE) {
                $qzone = new Qzone();
                $userInfo = $qzone->authorize();
            } elseif ($type === PluginContact::TYPE_WEIBO) {
                $weibo = new Weibo();
                $userInfo = $weibo->authorize();
            } elseif ($type === PluginContact::TYPE_WECHAT_WEB) {
                $wechat = new WechatWeb();
                $userInfo = $wechat->authorize();
            } else {
                $wechat = Wechat::where('app_id', $request->get('app_id'))->first();
                if ($wechat->service_type_info !== 2) {
                    $wechat = Wechat::where('id', 33)->first();
                }

                $auth = new Auth($wechat->app_id);
                $userInfo = $auth->authorize();
                if (!$userInfo) {
                    exit;
                }
                $userInfo = [
                    'name' => $userInfo['nickname'],
                    'img' => $userInfo['headimgurl'],
                    'finger' => md5(Curl::to($userInfo['headimgurl'])->get() . $userInfo['nickname']),
                    'openid' => $userInfo['openid']
                ];
            }
        } catch (\Exception $e) {
            return view('errors.error', ['title' => '授权失败', 'desc' => $e->getMessage()]);
        }

        $contact = PluginContact::where('type', $type)
            ->where('team_id', $this->team->id)
            ->where('openid', $userInfo['openid'])
            ->first();

        if (!$contact) {
            $con = Curl::to($userInfo['img'])->get();
            $img = Qiniu::upload($con);
            $contact = PluginContact::create([
                'name' => $userInfo['name'],
                'img' => $img,
                'type' => $type,
                'finger' => isset($userInfo['finger']) ? $userInfo['finger'] : '',
                'openid' => $userInfo['openid'],
                'team_id' => $this->team->id
            ]);
        }

        $json = $contact->toJson();
        $key = new ObjectID();
        $redis = Redis::connection();
        $redis->setex(self::prefix . $key, 60, $json);

        return redirect($redirect . 'secret_key=' . $key);
    }

    /**
     * 获取用户信息
     * @param Request $request
     * @return mixed
     */
    public function getContactinfo(Request $request)
    {
        $key = self::prefix . $request->get('secret_key');
        $redis = Redis::connection();
        if ($contact = $redis->get($key)) {
            $redis->del($key);
            $contact = json_decode($contact, true);
            return $this->responseJson(['data' => $contact['openid']]);
        }

        return $this->responseJsonError('key expired', 404);
    }

    /**
     * 获取二维码地址
     * @param Request $request
     * @return mixed
     */
    public function getQrcode(Request $request)
    {
        $wechat = Wechat::where(['team_id' => $this->team->id, 'app_id' => $request->get('app_id')])->first();
        if (!$wechat) {
            return $this->responseJsonError('公众号不存在', 403);
        }

        return $this->responseJson(['data' => $wechat->qrcode_url]);
    }

    /**
     * 投票二维码
     */
    public function getVoteqrcode(Request $request)
    {
        $wechat = Wechat::where(['team_id' => $this->team->id, 'app_id' => $request->get('app_id')])->first();
        if (!$wechat) {
            return $this->responseJsonError('公众号不存在', 404);
        }

        $params = $request->only('user_id', 'activity_id');
        $message = $request->get('message');
        $messageType = $request->get('message_type', QrcodeModel::MESSAGE_TYPE_TEXT);


        $sceneId = QrcodeModel::genSceneId();
        try {
            $qrcode = new QRCode($wechat->getAccessToken());
            $result = $qrcode->temporary($sceneId, 30 * 24 * 3600);
        } catch(\Exception $e) {
            return $this->responseJsonError($e->getMessage(), 403);
        }

        $url = 'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=' . $result->ticket;
        $con = Curl::to($url)->get();
        $url = Qiniu::upload($con);

        $qrcode = QrcodeModel::where('team_id', intval($this->team->id))
            ->where('params', $params)
            ->first();
        if ($qrcode) {
            $qrcode->update([
                'url' => $url,
                'scene_id' => $sceneId
            ]);
        } else {
            QrcodeModel::create([
                'message' => $message,
                'message_type' => $messageType,
                'url' => $url,
                'params' => $params,
                'team_id' => intval($this->team->id),
                'scene_id' => $sceneId,
                'type' => QrcodeModel::TYPE_TEMP,
                'action' => QrcodeModel::ACTION_VOTE
            ]);
        }

        return $this->responseJson(['data' => $url]);
    }

    /**
     * 下载素材
     */
    public function getDownload(Request $request)
    {
        $mediaId = $request->get('media_id');
        $appId = $request->get('app_id');
        $localId = $request->get('local_id');

        if (!$mediaId || !$appId) {
            return $this->responseJsonError('缺少 app_id OR media_id', 403);
        }

        $redis = Redis::connection();
        $key = 'plugin:file:' . $localId;
        $file = $redis->get($key);
        if ($file) {
            return $this->responseJson(['data' => $file]);
        }

        $wechat = Wechat::where(['team_id' => $this->team->id, 'app_id' => $appId])->first();
        if (!$wechat) {
            return $this->responseJsonError('公众号不存在', 403);
        }

        $media = new \Gibson\Wechat\Media($wechat->getAccessToken());
        $name = new ObjectID();
        $tmp = storage_path($name);
        try {
            $tmp = $media->download($mediaId, $tmp);
        } catch (\Exception $e) {
            return $this->responseJsonError($e->getMessage(), 403);
        }

        $con = @file_get_contents($tmp);
        @unlink($tmp);

        if (!$con) {
            return $this->responseJsonError('下载失败', 403);
        }

        $file = Qiniu::upload($con, 'jpg');
        $file = str_replace(['http:', 'https:'], '', $file);

        $redis->setex($key, 3600 * 24 * 30, $file);

        return $this->responseJson(['data' => $file]);
    }

    /**
     * 发送中奖用户短信
     */
    public function anySms(Request $request)
    {
        $req = $request->only('title', 'people');
        $people = json_decode($req['people'], true);
        if (!isset($people[0]) || !isset($people[0]['phone']) || !isset($people[0]['name']) || !isset($people[0]['level'])) {
            return $this->responseJsonError('缺少字段', 403);
        }

        $people = $people[0];
        $media = Media::find(86);
        $token = Winning::genToken();

        $winning = Winning::firstOrCreate([
            'title' => $req['title'],
            'people' => $people,
            'status' => Winning::STATUS_INIT
        ]);

        $winning->token = $token;
        $winning->save();

        $url = asset('api/winning/' . Crypt::encrypt($token));
        $short = Weibo::genShort($url);

        $level = sprintf('第 %s 名', $people['level']);
        $content = str_replace(['#活动名称#', '#奖品名称#', '#网址#'], [$req['title'], $level, $short], $media->content);

        $sign = Sms::where('team_id', $this->team->id)->first();
        if (!$sign || $sign->status !== 'SUCCESS') {
            return $this->responseJsonError('短信签名未通过', 403);
        }

        $content = sprintf('【%s】%s', $sign->signature, $content);
        NewSms::sendMarket($people['phone'], $content);

        return $this->responseJson('ok');
    }

    /**
     * 发送错误信息
     */
    public function anyError(Request $request)
    {
        $error = $request->get('error');
        Error::create([
            'type' => Error::TYPE_PLUGIN,
            'desc' => '插件错误',
            'content' =>  $error,
            'status' => Error::STATUS_INIT
        ]);
    }
}
