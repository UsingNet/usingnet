<?php

namespace App\Http\Controllers\Api;

use App\Models\Appstore\Groupbuy;
use App\Models\Appstore\GroupbuyMember;
use App\Models\Appstore\Pay;
use DB;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Overtrue\Wechat\Utils\XML;

class WepayController extends Controller
{
    public function anyCallback(Request $request)
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
                /*
                try {
                    DB::beginTransaction();
                    DB::table('appstore_tryout')->where('trade_no', $array['out_trade_no'])
                        ->lockForUpdate()
                        ->where('payed', false)
                        ->first();
                    DB::table('appstore_tryout')->where('trade_no', $array['out_trade_no'])
                        ->update(['payed' => true]);
                    DB::commit();
                } catch (\Exception $e) {
                    DB::rollback();
                    throw new \Exception('支付失败: ' . $e->getMessage());
                }
                */

                try {
                    DB::beginTransaction();
                    DB::table('appstore_pay')->where('pay_no', $array['out_trade_no'])
                        ->lockForUpdate()
                        ->where('status', Pay::STATUS_INIT)
                        ->first();
                    DB::table('appstore_pay')->where('pay_no', $array['out_trade_no'])
                        ->update(['status' => Pay::STATUS_SUCCESS]);
                    DB::commit();
                } catch (\Exception $e) {
                    DB::rollback();
                    throw new \Exception('支付失败: ' . $e->getMessage());
                }

                try {
                    DB::beginTransaction();
                    DB::table('appstore_groupbuy_member')->where('pay_no', $array['out_trade_no'])
                        ->lockForUpdate()
                        ->where('status', Pay::STATUS_INIT)
                        ->first();
                    DB::table('appstore_groupbuy_member')->where('pay_no', $array['out_trade_no'])
                        ->update(['status' => GroupbuyMember::STATUS_SUCCESS]);
                    DB::commit();
                } catch (\Exception $e) {
                    DB::rollback();
                    throw new \Exception('支付失败: ' . $e->getMessage());
                }
            }
        }
    }
}