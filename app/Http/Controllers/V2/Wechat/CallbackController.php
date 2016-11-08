<?php

namespace App\Http\Controllers\V2\Wechat;

use App\Models\Appstore\VoteRecord;
use App\Models\CustomerManage;
use App\Models\CustomLog;
use App\Models\Evaluation;
use App\Models\PluginContact;
use App\Models\Qrcode\Qrcode;
use App\Models\Qrcode\Record;
use App\Services\Messenger;
use App\Models\User;
use App\Services\Qiniu;
use App\Services\PluginAction;
use Exception;
use App\Library\Syslog;
use Gibson\Wechat\Component;
use Config;
use Gibson\Wechat\Staff;
use Redis;
use App\Library\Curl;
use App\Models\Order;
use App\Models\Contact;
use App\Models\Team;
use App\Models\Setting\Wechat as Account;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use App\Models\Message;
use App\Http\Requests;
use App\Http\Controllers\Controller;
use Overtrue\Wechat\Crypt;
use Gibson\Wechat\Media;
use Overtrue\Wechat\Utils\XML;

class CallbackController extends Controller
{
    /**
     * 接收公众号消息
     * @param $appid
     * @return mixed
     * @throws
     */
    public function anyCallback(Request $request, $appid = null)
    {
        if ($request->get('auth_code')) {
            return $this->auth($request);
        }

        $msgSignature = $request->get('msg_signature');
        $nonce = $request->get('nonce');
        $timestamp = $request->get('timestamp');
        $xml = file_get_contents('php://input');
        if (!$xml) {
            abort(404);
        }
        $config = Config::get('wechat.component');
        $crypt = new Crypt($config['appid'], $config['token'], $config['encoding_aes_key']);

        try {
            $message = $crypt->decryptMsg($msgSignature, $nonce, $timestamp, $xml);
        } catch (\Exception $e) {
            Syslog::logger('MESSAGE')->addDenug('Illegal request', []);
            abort(404);
        }

        Syslog::logger('MESSAGE')->addDebug('ACCEPT_WECHAT_MESSAGE', is_array($message) ? $message : []);

        // 微信公众平台测试样例
        if ($appid == 'wx570bc396a51b8ff8') {
            $this->testCase($message, $crypt, $nonce, $timestamp);
            exit;
        }

        $account = Account::where('app_id', $appid)->first();
        if (!$account) {
            Syslog::logger('ERROR')->addDebug('NOT_FOUND_WECHAT_ACCOUNT', ['公众号未接入', $appid]);
            exit;
        }

        if ($account->verify_type_info == -1) {
            Syslog::logger('ERROR')->addDebug('NOT_VERTIFY_WECHAT_ACCOUNT', ['公众号未认证', $appid]);
            exit;
        }

        $team = Team::find($account->team_id);
        if (!$team) {
            throw  new Exception('客服团队不存在');
        }

        // 收集投票祝福语
        if (isset($message['Content'])) {
            $pluginContact = PluginContact::where('openid', $message['FromUserName'])
                ->where('team_id', intval($team->id))
                ->first();
            if ($pluginContact) {
                $record = VoteRecord::where('contact_id', $pluginContact->_id)
                    ->orderBy('_id', 'desc')
                    ->first();
                if ($record && !$record->message) {
                    $record->update(['message' => $message['Content']]);
                    exit;
                }
            }
        }

        // 插件相关操作
        $pluginAction = new PluginAction();
        if (isset($message['Content']) && trim($message['Content']) === '日历') {
            $pluginAction->calendarpush($account, $message);
        }

        // 转发消息
        if (isset($message['MsgId'])) {
            // 评价
            $evaluations = [
                '好评' => Evaluation::LEVEL_GOOD,
                '中评' => Evaluation::LEVEL_GENERAL,
                '差评' => Evaluation::LEVEL_BAD
            ];

            $index = isset($message['Content']) ? trim($message['Content']) : -1;
            if (isset($evaluations[$index])) {
                $redis = Redis::connection();
                if ($orderId = $redis->get(Evaluation::REDIS_PREFIX . $message['FromUserName'])) {
                    $order = Order::find($orderId);
                    if ($order) {
                        $evaluation = Evaluation::firstOrCreate(['order_id' => $order->id, 'team_id' => $order->team_id]);
                        $data['content_name']  = $order->contact->name;
                        $data['user_name']  = $order->user->name;
                        $data['user_id']  = $order->user_id;
                        $data['contact_id']  = $order->contact_id;
                        $data['level'] = $evaluations[$index];
                        $evaluation->fill($data);
                        $evaluation->save();
                        Messenger::wechat([
                            'from' => $order->from,
                            'to' => $order->to,
                            'body' => '感谢您的评价',
                            'direction' => Message::DIRECTION_SEND,
                            'type' => Message::TYPE_WECHAT,
                            'package' => [
                                'order_id' => $order->id,
                                'team_id' => $order->team_id,
                                'agent' => array_only($order->user->toArray(), ['id', 'img', 'name']),
                                'contact' => array_only($order->contact->toArray(), ['id', 'img', 'name']),
                                'read' => true
                            ]
                        ]);
                        exit;
                    }
                };
            }

            $contact = Contact::firstOrCreate([
                'openid' => $message['FromUserName'],
                'wechat_id' => $account->id
            ], $team);

            $order = Order::where(['team_id' => $team->id, 'contact_id' => $contact->id])
                ->whereIn('status', [Order::STATUS_OPEN, Order::STATUS_SLEEP])
                ->first();

            // 转发给客户处理
            if (!$order && $account->url) {
                $response = $this->forwardingMessage($account, $message);
                $xml = @simplexml_load_string($response);
                if (!$xml) {
                    CustomLog::create([
                        'team_id' => $team->id,
                        'message' => sprintf('API: %s 没有返回正确的XML ', $account->url),
                        'data' => $response
                    ]);
                } else {
                    if (stripos($response, 'transfer_customer_service') === false) {
                        echo $crypt->encryptMsg($response, $nonce, $timestamp);
                        exit;
                    }
                }
            }

            $this->sendMessage($message, $account, $team, $order, $contact);
        } else {
            $staff = new Staff($account->getAccessToken());
            if ($message['ToUserName'] == Config::get('wechat.id') ) {
                // 客服绑定到优信公众号
                if (isset($message['Ticket'])) {
                    $redis = Redis::connection();
                    $userId = $redis->get($message['Ticket']);
                    if ($userId) {
                        User::where('openid', $message['FromUserName'])->update(['openid' => '']);
                        User::where('id', $userId)->update(['openid' => $message['FromUserName']]);
                        $staff->send('您的账号已绑定成功')->to($message['FromUserName']);
                    }
                }
                if ($message['Event'] === 'unsubscribe') {
                    User::where('openid', $message['FromUserName'])->update(['openid' =>  '']);
                }
            }

            if (isset($message['Event'])) {
                if ($message['Event'] === 'unsubscribe') {
                    $contact = Contact::where('openid', $message['FromUserName'])->first();
                    if ($contact) {
                        $contact->update(['unsubscribed' => 1]);
                        //Record::where('contact_id', $contact->id)->delete();
                        $record = Record::where('contact_id', intval($contact->id))
                            ->where('action', Qrcode::ACTION_VOTE)
                            ->orderBy('_id', 'desc')
                            ->first();
                        if ($record) {
                            $qrcode = Qrcode::where('_id', $record->qrcode_id)->first();
                            if ($qrcode && $qrcode->action) {
                                $method = strtolower($qrcode->action);
                                $action = new PluginAction();
                                $params = $qrcode->params;
                                $params['action'] = 'delete';
                                $params['unionid'] = $contact->openid;
                                $params['openid'] = $contact->openid;
                                $action->$method($params);
                            }
                        }
                    }
                }
                if ($message['Event'] === 'subscribe') {
                    $staff = new Staff($account->getAccessToken());
                    $contact = Contact::firstOrCreate(['openid' => $message['FromUserName'], 'wechat_id' => $account->id], $team);
                    if ($contact->unsubscribed) {
                        $contact->update(['unsubscribed' => 0]);
                    }

                    //　添加扫码记录
                    if (isset($message['EventKey']) && is_string($message['EventKey']) &&preg_match('/^qrscene_/', $message['EventKey'])) {
                        $sceneId = str_replace('qrscene_', '', $message['EventKey']);
                        $qrcode = Qrcode::where('scene_id', intval($sceneId))->first();
                        if ($qrcode) {
                            $qrcode->increment('subscribes');
                            Record::create([
                                'team_id' => $contact->team_id,
                                'contact_id' => $contact->id,
                                'qrcode_id' => $qrcode->_id,
                                'type' => Record::TYPE_SUBSCRIBE,
                                'action' => $qrcode->action
                            ]);

                            if ($qrcode->action) {
                                $method = strtolower($qrcode->action);
                                $action = new PluginAction();
                                $params = $qrcode->params;
                                $params['action'] = 'vote';
                                $params['unionid'] = $contact->openid;
                                $params['openid'] = $contact->openid;
                                $resp = $action->$method($params);
                                if (isset($resp['msg'])) {
                                    $staff->send($resp['msg']) ->to($message['FromUserName']);
                                    exit;
                                }
                            }

                            if ($qrcode->message && $qrcode->message_type) {
                                $type = strtolower($qrcode->message_type);
                                if ($type === 'text') {
                                    $staff->send($qrcode->message)->to($message['FromUserName']);
                                } else {
                                    if ($type === 'news') {
                                        $type = 'mp_news';
                                    }
                                    $msg = \Overtrue\Wechat\Message::make($type)->media($qrcode->message);
                                    $staff->send($msg)->to($message['FromUserName']);
                                }
                            }

                            if (isset($xml)) {
                                echo $crypt->encryptMsg($xml, $nonce, $timestamp);
                                exit;
                            }
                        }
                    } else if ($account->subscribe_reply) {
                        $staff->send($account->subscribe_reply)->to($message['FromUserName']);
                    }
                }

                if ($message['Event'] === 'SCAN') {
                    $qrcode = Qrcode::where('scene_id', intval($message['EventKey']))->first();
                    if ($qrcode) {
                        $contact = Contact::where('openid', $message['FromUserName'])->first();
                        $qrcode->increment('scans');
                        if ($contact) {
                            Record::create([
                                'team_id' => $contact->team_id,
                                'contact_id' => $contact->id,
                                'qrcode_id' => $qrcode->id,
                                'type' => Record::TYPE_SCAN
                            ]);
                        }

                        if ($qrcode->action && $contact) {
                            $method = strtolower($qrcode->action);
                            $action = new PluginAction();
                            $params = $qrcode->params;
                            $params['action'] = 'vote';
                            $params['unionid'] = $contact->openid;
                            $params['openid'] = $contact->openid;
                            $resp = $action->$method($params);
                            if (isset($resp['msg'])) {
                                $staff->send($resp['msg']) ->to($message['FromUserName']);
                                exit;
                            }
                        }

                        if ($qrcode->message && $qrcode->message_type) {
                            $type = strtolower($qrcode->message_type);
                            if ($type === 'text') {
                                $staff->send($qrcode->message)->to($message['FromUserName']);
                            } else {
                                if ($type === 'news') {
                                    $type = 'mp_news';
                                }
                                $msg = \Overtrue\Wechat\Message::make($type)->media($qrcode->message);
                                $staff->send($msg)->to($message['FromUserName']);
                            }
                        }
                    }
                }
            }
            // 转发事件
            if ($account->url) {
                $response = $this->forwardingMessage($account, $message);
                $xml = @simplexml_load_string($response);
                if (!$xml) {
                    CustomLog::create([
                        'team_id' => $team->id,
                        'message' => sprintf('API: %s 没有返回正确的XML ', $account->url),
                        'data' => $response
                    ]);
                    exit;
                }
                echo $crypt->encryptMsg($response, $nonce, $timestamp);
            }
        }
    }

    /**
     * 转发消息
     * @param $account
     * @param $xml
     * @return string
     */
    private function forwardingMessage($account, $message)
    {
        $sign['token'] = $account->token;
        $sign['nonce'] = rand(11111111111, 99999999999);
        $sign['timestamp'] = time();
        $arr = [$sign['token'], $sign['nonce'], $sign['timestamp']];
        sort($arr, SORT_STRING);
        $sign['signature'] = sha1(implode($arr));
        $xml = XML::build($message);

        // 加密模式 加密后发送
        if ($account->mode == Account::MODE_ENCRYPTION) {
            $crypt = new Crypt($account->app_id, $account->token, $account->encoding_aes_key);
            $xml = $crypt->encryptMsg($xml, $sign['nonce'], $sign['timestamp']);
            $arr = XML::parse($xml);
            $xml = XML::build([
                'ToUserName' => $message['ToUserName'],
                'Encrypt' => $arr['Encrypt']
            ]);
            $sign['msg_signature'] = $arr['MsgSignature'];
        }

        $url = $account->url . (stripos($account->url, '?') === false ? '?' : '&') . http_build_query($sign);
        $response = Curl::to($url)
            ->withData($xml)
            ->withHeader('Content-Type', 'text/xml')
            ->post();

        // 密码模式 解密用户消息
        if ($account->mode == Account::MODE_ENCRYPTION) {
            $xml = @simplexml_load_string($response);
            if ($xml) {
                try {
                    $response = XML::parse($response);
                    $message = $crypt->decryptMsg($response['MsgSignature'], $response['nonce'], $response['timestamp'], $response);
                    $response = XML::build($message);
                } catch (\Exception $e) {
                }
            }
        }

        return $response;
    }

    /**
     * 发送消息到客服系统
     * @param $message
     */
    private function sendMessage($message, $account, $team, $order, $contact)
    {
        $disk = Storage::disk('qiniu');
        $media = new Media($account->getAccessToken());

        switch ($message['MsgType']) {
            case 'text':
                $body = $message['Content'];
                break;
            case 'image':
                $body = Qiniu::upload(file_get_contents($message['PicUrl']), 'jpg');
                break;
            case 'voice':
                $voiceId = $message['MediaId'];
                $filename = $voiceId . '.mp3';
                $path = storage_path($filename);
                $path = $media->download($message['MediaId'], $path);
                // 发到七牛转换语音格式
                $config = Config::get('filesystems.disks.qiniu');
                $uri = \Qiniu\base64_urlSafeEncode($config['bucket'] . ':' . $filename);
                $auth = new \Qiniu\Auth($config['access_key'], $config['secret_key']);
                $token = $auth->uploadToken($config['bucket'], null, 3600, [
                    'persistentOps' =>  'avthumb/mp3|saveas/' . $uri,
                    'persistentPipeline' =>  'wechat',
                    'persistentNotifyUrl' => url('api/wechat/notice/qiniu?message_id=' . $voiceId)
                ]);
                $upload = new \Qiniu\Storage\UploadManager();
                $upload->putFile($token, $filename, $path);
                $disk->put($filename, file_get_contents($path));
                $body = sprintf('<audio src="%s" controls="controls" />', $disk->downloadUrl($filename));
                @unlink($path);
                break;
            case 'video':
            case 'shortvideo':
                $filename =  $message['MediaId'];
                $path =  storage_path($filename);
                $path = $media->download($message['MediaId'], $path);
                $pair = explode('/', $path);
                $filename = end($pair);
                $disk->put($filename, file_get_contents($path));
                $body = sprintf('<video src="%s" controls="controls" />', $disk->downloadUrl($filename));
                @unlink($path);
                break;
            case 'link':
                $body = sprintf('<a target="_blank" href="%s">%s</a>', $message['Url'], $message['Title']);
                break;
            case 'location':
                $api = Config::get('mpa.api');
                $key = Config::get('mpa.key');
                $map = sprintf($api, $message['Location_X'], $message['Location_Y'], $message['Location_X'], $message['Location_Y'], $key);
                $body = sprintf('<img src="%s" alt="%s">', $map, $message['Label']);
                break;
        }

        // 不知道什么乱七八糟的消息
        if (!isset($body)) {
            Syslog::logger('MESSAGE')->addCritical('UNKNOW_WECHAT_MESSAGE_TYPE', $message);
            exit;
        }

        if (!$order) {
            $order = Order::firstOrCreate($contact, $team, Message::TYPE_WECHAT, $account);
        }

        $message = [
            'from' => $contact->token,
            'to' => $order->user->token,
            'direction' => Message::DIRECTION_RECEIVE,
            'body' => $body,
            'package' => [
                'team_id' => $team->id,
                'order_id' => $order->id,
                'contact' => array_only($contact->toArray(), ['id', 'name', 'img']),
            ]
        ];

        if ($order->user) {
            $message['package']['agent'] = array_only($order->user->toArray(), ['id', 'name', 'img']);
        }

        // 录音消息需要在七牛的类型转换 callback 中发出
        if (isset($voiceId)) {
            $redis = Redis::connection();
            $redis->set($voiceId, json_encode($message));
        } else {
            $response = Messenger::wechat($message);
            if (!$response['connectors']['im'] && $order->user_id) {
                $order->reAssign($contact, $message);
            }
        }
    }

    /**
     * 公众号授权
     * @param $request
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Routing\Redirector
     * @throws \Exception
     */
    public function auth($request)
    {
        try {
            $authCode = $request->get('auth_code');
            $component = new Component();
            $response = $component->queryAuth($authCode);
            $authInfo = $response['authorization_info'];
        } catch (\Exception $e) {
            return view('errors.error', ['title' => '授权失败,请重试', 'desc' => $e->getMessage()]);
        }

        $account = Account::where('app_id', $authInfo['authorizer_appid'])->first();
        if ($account) {
            return view('errors.error', ['title' => '绑定失败', 'desc' => '公众号已绑定优信客服绑定']);
        }

        try {
            $response = $component->getAuthorizerInfo($authInfo['authorizer_appid']);
            $userInfo = $response['authorizer_info'];
            if ($userInfo['verify_type_info']['id'] != 0) {
                return view('errors.error', ['title' => '绑定失败', 'desc' => '请到微信后台完成认证']);
            }

            $headImg = '//o1hpnn7d6.qnssl.com/default-avatar.png';
            if (isset($userInfo['head_img'])) {
                $headImg = Qiniu::upload(Curl::to($userInfo['head_img'])->get());
            }
            $qrcodeImg = Qiniu::upload(Curl::to($userInfo['qrcode_url'])->get());
            $account = Account::firstOrCreate(['app_id' => $authInfo['authorizer_appid']]);
            $account->team_id = $request->user()->team_id;
            $account->type = Account::TYPE_AUTH;
            $account->access_token = $authInfo['authorizer_access_token'];
            $account->refresh_token = $authInfo['authorizer_refresh_token'];
            $account->expires_in = $authInfo['expires_in'];
            $account->func_info = $authInfo['func_info'];
            $account->nick_name = $userInfo['nick_name'];
            $account->user_name = $userInfo['user_name'];
            $account->head_img = $headImg;
            $account->service_type_info = $userInfo['service_type_info']['id'];
            $account->verify_type_info = $userInfo['verify_type_info']['id'];
            $account->qrcode_url = $qrcodeImg;
            $account->business_info = $userInfo['business_info'];
            $account->updated_token_at = time();
            $account->save();
        } catch (\Exception $e) {
            return view('errors.error', ['title' => '授权失败,请重试', 'desc' => $e->getMessage()]);
        }

        return redirect(Config::get('app.url') . '/setting/wechat');
    }

    /**
     * 微信公众平台测试样例
     * @param $message
     * @param $crypt
     * @param  $nonce
     * @param $timestamp
     */
    public function testCase($message, $crypt, $nonce, $timestamp)
    {
        if (isset($message['Event'])) {
            $response = [
                'FromUserName' => $message['ToUserName'],
                'ToUserName' => $message['FromUserName'],
                'CreateTime' => time(),
                'MsgType' => 'text',
                'Content' => $message['Event'] . 'from_callback'
            ];

            $xml = XML::build($response);

            echo $crypt->encryptMsg($xml, $nonce, $timestamp);
            exit;
        }

        if (isset($message['MsgId'])) {
            if ($message['Content'] == 'TESTCOMPONENT_MSG_TYPE_TEXT') {
                $response = [
                    'FromUserName' => $message['ToUserName'],
                    'ToUserName' => $message['FromUserName'],
                    'CreateTime' => time(),
                    'MsgType' => 'text',
                    'Content' => 'TESTCOMPONENT_MSG_TYPE_TEXT_callback'
                ];

                $xml = XML::build($response);
                echo $crypt->encryptMsg($xml, $nonce, $timestamp);
                exit;
            }

            if (stripos($message['Content'], 'QUERY_AUTH_CODE') !== false) {
                $authCode = explode(':', $message['Content'])[1];
                $component = new Component();
                $response = $component->queryAuth($authCode);
                $authInfo = $response['authorization_info'];
                $staff = new \Gibson\Wechat\Staff($authInfo['authorizer_access_token']);
                $staff->send($authCode . '_from_api')->to($message['FromUserName']);
            }
        }
    }
}
