<?php

/**
 * 支付宝
 */

namespace App\Services;

use Config;
use App\Models\Payment;
use mytharcher\sdk\alipay\Alipay as SDK;

class Alipay
{
    const API = 'https://mapi.alipay.com/gateway.do?';
    const PID = '2088121179225569';
    const SIGN = 'tob3effqg212s3rg5xsdsed4x7l4x6w5';
    const CHARSET = 'utf-8';
    const SERVICE = 'create_direct_pay_by_user';

    // 支付 10 分钟超时
    const TIMEOUT = 600;

    /**
     * 跳转支付宝
     * @param $data
     */
    public static function to($data)
    {
        $config = Config::get('alipay');
        $sdk = new SDK($config);

        echo $sdk->buildRequestFormHTML([
            'out_trade_no'      => $data['out_trade_no'],
            'subject'           => $data['subject'],
            'total_fee'         => $data['total_fee'],
            '_input_charset'    => 'utf-8'
        ]);
    }

    /**
     * 判断状态
     * @param Payment $payment
     */
    public static function checkStatus(Payment $payment)
    {
        if (time() - $payment->created_at->timestamp >= self::TIMEOUT) {
            $payment->update(['status' => Payment::STATUS_TIMEOUT]);
        } else {

        }
    }
}