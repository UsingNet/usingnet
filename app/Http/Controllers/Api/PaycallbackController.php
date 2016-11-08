<?php
/**
 * 支付回调
 */

namespace App\Http\Controllers\Api;

use DB;
use Illuminate\Http\Request;
use App\Library\Syslog;
use App\Models\Appstore\Alipay;
use App\Http\Controllers\Controller;
use App\Models\Payment;
use Overtrue\Wechat\Utils\XML;
use Illuminate\Support\Facades\Config;

class PaycallbackController extends Controller
{
    public function anyWepay(Request $request)
    {
        $req = file_get_contents('php://input');
        $array = XML::parse($req);
        if ($array['result_code'] === 'SUCCESS') {
            // 验证签名
            $sign = $array['sign'];
            unset($array['sign']);
            ksort($array);
            $str = urldecode(http_build_query($array)) . '&key=' . Config::get('wechat.pay.secret_key');
            $signed = strtoupper(md5($str));
            if ($sign === $signed) {
                try {
                    Syslog::logger('PAY')->addDebug('PAY_STATUS', [$array]);
                    app('db')->transaction(function() use ($array) {
                        $payment = Payment::where('trade_no', $array['out_trade_no'])
                            ->where('status', Payment::STATUS_INIT)
                            ->first();
                        if ($payment) {
                            $payment->update(['status' => Payment::STATUS_SUCCESS]);
                            Syslog::logger('PAY')->addDebug('PAY_SUCCESS', [$payment->toArray()]);
                        }
                    });
                } catch (\Exception $e) {
                    Syslog::logger('PAY')->addCritical('PAY_FAIL', [$e->getMessage(), $array]);
                }
            }
        }
    }

    public function anyAlipay(Request $request)
    {
        if (!app('alipay.web')->verify()) {
            return view('errors.error', ['title' => '支付失败', 'desc' => '支付接口验证失败，请联系优信客服']);
        }
        $no = $request->get('out_trade_no');

        try {
            Syslog::logger('PAY')->addDebug('PAY_STATUS', [$request->all()]);
            app('db')->transaction(function() use ($no) {
                $payment = Payment::where('trade_no', $no)
                    ->where('status', Payment::STATUS_INIT)
                    ->first();
                if ($payment) {
                    $payment->update(['status' => Payment::STATUS_SUCCESS]);
                    Syslog::logger('PAY')->addDebug('PAY_SUCCESS', [$payment->toArray()]);
                }
            });
        } catch (\Exception $e) {
            Syslog::logger('PAY')->addCritical('PAY_FAIL', [$e->getMessage(), $request->all()]);
        }

        if ($request->method() === 'GET') {
            $redirect = session()->get('pay_referrer');
            return redirect($redirect);
        }
    }
}