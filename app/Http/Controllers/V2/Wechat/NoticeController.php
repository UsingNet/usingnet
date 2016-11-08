<?php

namespace App\Http\Controllers\V2\Wechat;

use Config;
use Redis;
use App\Models\Order;
use App\Services\Messanger;
use Illuminate\Http\Request;
use App\Models\Setting\Wechat;
use Overtrue\Wechat\Crypt;
use App\Http\Controllers\Controller;
use Gibson\Wechat\ComponentVerifyTicket;


class NoticeController extends Controller
{

    public function postIndex()
    {
        $xml = file_get_contents('php://input');
        if (!isset($_REQUEST['msg_signature']) || !isset($_REQUEST['nonce']) || !isset($_REQUEST['timestamp'])) {
            throw new \Exception('请求参数不正确');
        }
        
        $config = Config::get('wechat.component');
        $crypt = new Crypt($config['appid'], $config['token'], $config['encoding_aes_key']);
        $msg = $crypt->decryptMsg($_REQUEST['msg_signature'], $_REQUEST['nonce'], $_REQUEST['timestamp'], $xml);

        // 获取微信服务器 ticket
        if ($msg['InfoType'] == 'component_verify_ticket') {
            ComponentVerifyTicket::setTicket($msg['ComponentVerifyTicket']);
        }
        // 用户取消授权通知
        if ($msg['InfoType'] == 'unauthorized') {
            Wechat::where('app_id', $msg['AuthorizerAppid'])->delete();
        }

        echo 'success';
    }


    /**
     * 七牛文件转换完成通知
     * @param $request
     */
    public function postQiniu(Request $request)
    {
        $messageId = $request->get('message_id');
        $redis = Redis::connection();
        $data =$redis->get($messageId);
        try {
            $data = json_decode($data, true);
            if ($data) {
                $order = Order::find($data['package']['order_id']);
                $contact = Order::find($data['package']['contact']['id']);
                $response = Messanger::wechat($data);
                if (!$response['connectors']['im'] && $order->user_id) {
                    $order->reAssign($contact, $data);
                }
            }
        } catch (\Exception $e) {
        }
    }

}
