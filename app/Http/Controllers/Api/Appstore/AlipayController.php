<?php

namespace App\Http\Controllers\Api\Appstore;

use App\Library\GenQrcode;
use App\Models\Payment;
use App\Services\Qiniu;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Appstore\Alipay\Alipay;
use App\Models\Appstore\Alipay\Config as AlipayConfig;

class AlipayController extends Controller
{
    public function getIndex(Request $request, $id = null)
    {
        if (!$id) abort(404);

        $payConfig = AlipayConfig::where('id', $id)->first();

        if ($payConfig) {
            $payConfig = AlipayConfig::where('team_id', intval($payConfig->team_id))
                ->where('name', $payConfig->name)
                ->first();
        } else {
            $payConfig = AlipayConfig::where('_id', $id)->firstOrFail();
        }

        return view('appstore.alipay.index', compact('payConfig'));
    }

    public function getPay(Request $request, $payConfigId = null, $fee = null)
    {
        if (!$payConfigId || !$fee) abort(404);

        $payConfig  = AlipayConfig::where('_id', $payConfigId)->first();
        $payment = Payment::create([
            'fee' => $fee,
            'type' => Payment::TYPE_ALIPAY
        ]);

        $pay = Alipay::create([
            'team_id' => $payConfig->team_id,
            'config_id' => $payConfig->id,
            'pay_id' => $payment->id
        ]);

        $alipay = app('alipay.wap');
        $alipay->setOutTradeNo($payment->trade_no);
        $alipay->setTotalFee($payment->fee);
        $alipay->setSubject($payConfig->name);

        $successUrl = 'https://wx.usingnet.com/appstore/alipay/success/' . $pay->_id;
        $request->session()->put('pay_referrer', $successUrl);

        return redirect()->to($alipay->getPayLink());
    }

    public function getSuccess(Request $request, $id = null)
    {
        if (!$id) abort(404);
        $pay = Alipay::where('_id', $id)->with('payment')->firstOrFail();
        $payConfig = AlipayConfig::where('_id', $pay->config_id)->firstOrFail();

        return view('appstore.alipay.success', compact('pay', 'payConfig'));
    }

    /****************** 后台代码 ********************/

    public function getAdmin(Request $request)
    {
        if (!$request->user()) abort(404);
        $teamId = intval($request->user()->team_id);
        $alipays = AlipayConfig::where('team_id', $teamId)
            ->orderBy('_id', 'desc')
            ->get();

        return view('appstore.alipay.admin', compact('alipays'));
    }

    public function postAdmin(Request $request)
    {
        if (!$request->user()) abort(404);
        $req = $request->only('name', 'id');
        $teamId = intval($request->user()->team_id);
        $req['team_id'] = $teamId;

        if ($file = $request->file('file')) {
            $path = $file->getRealPath();
            $content = file_get_contents($path);
            $img = Qiniu::upload($content);
            $req['img'] = $img;
        }

        if ($req['id']) {
            $alipayConfig = AlipayConfig::where(['team_id' => $teamId, '_id' => $req['id']])->first();
            $alipayConfig->fill($req);
            $alipayConfig->save();
        } else {
            $alipayConfig = AlipayConfig::create($req);
        }

        if (!$alipayConfig->qrcode) {
            $url = 'https://wx.usingnet.com/appstore/alipay/' . $alipayConfig->_id;
            $qrcode = GenQrcode::gen($url);
            $alipayConfig->update(['qrcode' => $qrcode]);
        }

        return redirect()->back();
    }

    public function getAdminshow(Request $request, $id = null)
    {
        if (!$request->user()) abort(404);
        $teamId = intval($request->user()->team_id);

        $payConfig = AlipayConfig::where(['team_id' => $teamId, '_id' => $id])->firstOrFail();
        if ($request->ajax()) {
            return $this->responseJson($payConfig);
        }

        $pays = Alipay::where(['config_id' => $id, 'team_id' => $teamId])
            ->with('payment')
            ->where('status', Payment::STATUS_SUCCESS)
            ->orderBy('_id', 'desc')
            ->paginate(20);

        return view('appstore.alipay.admin_show', compact('payConfig', 'pays'));
    }
}