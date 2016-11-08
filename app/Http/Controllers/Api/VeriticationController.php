<?php

namespace App\Http\Controllers\Api;

use App\Models\Veritication;
use App\Services\Sms;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class VeriticationController extends Controller
{

    /**
     * 发送短信 限制 90 秒发送一次
     *
     * @param Request $request
     * @return mixed
     */
    public function postPhone(Request $request)
    {
        $phone = $request->get('phone');

        if (empty($phone)) {
            return $this->responseJsonError('手机号码不能为空', 403);
        }

        if (!preg_match('/134[0-8]\d{7}|1[34578][0-35-9]\d{8}/', $phone)) {
            return $this->responseJsonError('手机号码格式不正确', 403);
        }

        $vertication = Veritication::where('source', $phone)->orderBy('id', 'desc')->first();

        if ($vertication) {
           if (($sec = time() - strtotime($vertication->created_at)) < 90) {
               return $this->responseJsonError(sprintf('请 %s 秒后发送验证码', 90 - $sec), 403);
           }
        }

        $vertication = Veritication::firstOrCreate([
            'source' => $phone,
            'user_id' => $request->user()->id,
            'type' => Veritication::TYPE_PHONE
        ]);

        if (!$vertication->code) {
            $vertication->code = mt_rand(11111, 99999);
        }

        $vertication->created_at = Carbon::now();
        $vertication->save();

        $response = Sms::send($vertication->source,  sprintf('【优信科技】您的验证码是%s', $vertication->code));
        $response = json_decode($response, true);
        if ($response['code'] != 0) {
            return $this->responseJsonError($response['detail'], 403);
        }

        return $this->responseJson('ok');
    }
}
