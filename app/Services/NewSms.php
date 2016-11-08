<?php

namespace App\Services;

use App\Library\Curl;

class NewSms
{
    const API_SEND = 'http://%s/msg/HttpBatchSendSM?account=%s&pswd=%s&mobile=%s&msg=%s&needstatus=true';
    const API_BALANCE = 'http://222.73.117.156/msg/QueryBalance?account=%s&pswd=%s&';

    public static function sendNotice($mobile, $msg)
    {
        $api = sprintf(self::API_SEND, env('SMS_NOTICE_HOST'), env('SMS_NOTICE_ACCOUNT'), env('SMS_NOTICE_PASSWORD'), $mobile, urlencode($msg));
        $resp = Curl::to($api)->get();
        return self::getError($resp);
    }

    public static function sendMarket($mobile, $msg)
    {
        $api = sprintf(self::API_SEND, env('SMS_MARKET_HOST'), env('SMS_MARKET_ACCOUNT'), env('SMS_MARKET_PASSWORD'), $mobile, urlencode($msg));
        $resp = Curl::to($api)->get();
        return self::getError($resp);
    }

    public static function getBalance()
    {
        $api = sprintf(self::API_BALANCE, env('SMS_ACCOUNT'), env('SMS_PASSWORD'));
        $resp = Curl::to($api)->get();
        return self::getError($resp);
    }

    public static function getError($error)
    {
        $code = -1;
        $messageId = null;
        $pairs = explode(',', $error);
        if (is_array($pairs)) {
            $code = substr($pairs[1], 0, 1);
            if ($code == 0) {
                $pairs = explode("\n", $pairs[1]);
                return $pairs[1];
            }
            $code = $pairs[1];
        }

        $errors = [
            '101' => '无此用户',
            '102' => '密码错误',
            '103' => '提交过快（提交速度超过流速限制）',
            '104' => '系统忙（因平台侧原因，暂时无法处理提交的短信）',
            '105' => '敏感短信（短信内容包含敏感词）',
            '106' => '消息长度错（>536或<=0）',
            '107' => '包含错误的手机号码',
            '108' => '手机号码个数错（群发>50000或<=0;单发>200或<=0）',
            '109' => '无发送额度（该用户可用短信数已使用完）',
            '110' => '不在发送时间内',
            '111' => '超出该账户当月发送额度限制',
            '112' => '无此产品，用户没有订购该产品',
            '113' => 'extno格式错（非数字或者长度不对）',
            '115' => '自动审核驳回',
            '116' => '签名不合法，未带签名（用户必须带签名的前提下）',
            '117' => 'IP地址认证错,请求调用的IP地址不是系统登记的IP地址',
            '118' => '用户没有相应的发送权限',
            '119' => '用户已过期',
            '120' => '测试内容不是白名单',
        ];

        $error = isset($errors[$code]) ? $errors[$code] : '未知错误';

        throw new \Exception($error);
    }

    public function getStatus($status)
    {
        $statuses = [
            'DELIVRD' => '发送成功',
            'EXPIRED' => '短消息超过有效期',
            'UNDELIV' => '短消息是不可达的',
            'UNKNOWN' => '未知短消息状态',
            'REJECTD' => '短消息被短信中心拒绝',
            'DTBLACK' => '目的号码是黑名单号码',
            'ERR:104' => '系统忙',
            'REJECT' => '审核驳回',
            '其他' => '网关内部状态'
        ];

        if (isset($statuses[$status])) {
            return $statuses[$status];
        }
    }
}