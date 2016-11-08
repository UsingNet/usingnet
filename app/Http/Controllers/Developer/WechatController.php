<?php

namespace App\Http\Controllers\Developer;

use Config;
use App\Models\Developer\Error;
use App\Models\Developer\User;
use App\Models\Developer\Wechat;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Overtrue\Wechat\Utils\JSON;
use Overtrue\Wechat\Utils\XML;


class WechatController extends Controller
{

    private $key;
    private $config;
    private $wechat;

    public function __construct()
    {
        $this->config = Config::get('developer');
        $this->key = base64_decode($this->config['encoding_aes_key'], '=');
        $this->wechat = new Wechat();
    }

    public function anyIndex(Request $request)
    {
        $echoStr  = $request->get('echostr');
        $repyEchostr = null;
        $msgSignature = $request->get('msg_signature');
        $timestamp = $request->get('timestamp');
        $nonce = $request->get('nonce');
        $this->wechat->VerifyURL($msgSignature, $timestamp, $nonce, $echoStr, $repyEchostr);
        if ($repyEchostr) {
            exit($repyEchostr);
        }

        $data = file_get_contents('php://input');
        $msg = '';
        $this->wechat->DecryptMsg($msgSignature, $timestamp, $nonce, $data, $msg);
        $msg = XML::parse($msg);

        $user = User::where('userid', $msg['FromUserName'])->first();
        if (!$user) {
            $userInfo = $this->wechat->getUser($msg['FromUserName']);
            if ($userInfo) {
                $user = User::create($userInfo);
            }
        }

        if ($msg['MsgType'] == 'event') {
            if (isset($msg['EventKey']) && is_string($msg['EventKey'])) {
                $error = Error::orderBy('_id', 'desc')->first();
                if (!$error->user_id) {
                    $error->update(['user_id' => $user->_id]);
                }
                $status = strtoupper($msg['EventKey']);
                $error->update(['status' => $status]);
                $msg = $status === Error::STATUS_FINISH ? '已修复错误' : '正在处理';
                $msg = $user->name . ' ' . $msg;
                Wechat::notice($msg, '@all');
            }
        }
    }

    /**
     * 创建菜单
     *
     * @return string
     */
    public function getCreatemenu()
    {
        $menu = [
            'button' => [
                [
                    'name' => '我来处理',
                    'type' => 'click',
                    'key' => 'view',
                ],
                [
                    'name' => '已经修复',
                    'type' => 'click',
                    'key' => 'finish'
                ]
            ]
        ];

        $json = JSON::encode($menu);

        return Wechat::createMenu($json, $this->config['agentid']);
    }
}
