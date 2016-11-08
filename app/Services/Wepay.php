<?php

namespace App\Services;

use App\Library\Curl;
use App\Models\Payment;
use Illuminate\Support\Str;
use Overtrue\Wechat\Utils\XML;
use Illuminate\Support\Facades\Config;

class Wepay
{
    const API_ORDER = 'https://api.mch.weixin.qq.com/pay/unifiedorder';
    const API_CLOSE = 'https://api.mch.weixin.qq.com/pay/closeorder';
    const API_QUERY = 'https://api.mch.weixin.qq.com/pay/orderquery';

    // 支付 10 分钟超时
    const TIMEOUT = 600;

    public function pay($tradeNo, $body, $fee, $openid, $appid, $mchid, $key)
    {
        $config = Config::get('wechat.pay');
        $params = [
            'appid' => $appid,
            'mch_id' => $mchid,
            'nonce_str' => Str::random(16),
            'body' => $body,
            'device_info' => 'WEB',
            'out_trade_no' => $tradeNo,
            'total_fee' => intval($fee * 100),
            'spbill_create_ip' => get_ip(),
            'notify_url' => $config['notify'],
            'trade_type' => 'JSAPI',
            'openid' => $openid
        ];

        ksort($params);
        $str = urldecode(http_build_query($params)) . '&key=' . $key;
        $sign = strtoupper(md5($str));
        $params['sign'] = $sign;
        $xml = XML::build($params);
        $resp = Curl::to(self::API_ORDER)->withData($xml)->post();
        $arr = XML::parse($resp);

        $params = [
            'timeStamp' => time(),
            'nonceStr' => Str::random(16),
            'appId' => $appid,
            'package' => 'prepay_id=' . $arr['prepay_id'],
            'signType' => 'MD5',
        ];

        ksort($params);
        $str = urldecode(http_build_query($params)) . '&key=' . $key;
        $sign = strtoupper(md5($str));
        $params['paySign'] = $sign;

        return $params;
    }

    public static function checkStatus(Payment $payment)
    {
        $params = [
            'appid' => Config::get('wechat.pay.appid'),
            'mch_id' => Config::get('wechat.pay.mch_id'),
            'out_trade_no' => $payment->trade_no,
            'nonce_str' => Str::random(16)
        ];
        ksort($params);
        $str = urldecode(http_build_query($params)) . '&key=' . Config::get('wechat.pay.secret_key');
        $params['sign'] = strtoupper(md5($str));
        $xml = XML::build($params);

        // 超时, 关闭订单
        if (time() - $payment->created_at->timestamp >= self::TIMEOUT) {
            $resp = Curl::to(self::API_CLOSE)->withData($xml)->post();
            $arr = XML::parse($resp);
            if (isset($arr['result_code']) && $arr['result_code'] === 'SUCCESS') {
                $payment->update(['status' => Payment::STATUS_TIMEOUT]);
            }
        } else {
            // 查询订单状态
            $resp = Curl::to(self::API_QUERY)->withData($xml)->post();
            $arr = XML::parse($resp);
            if ((isset($arr['err_code']) && $arr['err_code'] === 'ORDERPAID') || (isset($arr['trade_state']) && $arr['trade_state'] === 'SUCCESS')) {
                $payment->update(['status' => Payment::STATUS_SUCCESS]);
            }
        }
    }
}