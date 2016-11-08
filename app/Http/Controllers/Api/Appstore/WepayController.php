<?php

namespace App\Http\Controllers\Api\Appstore;

use App\Models\Team;
use App\Models\Payment;
use App\Library\GenQrcode;
use App\Models\Setting\Wechat;
use App\Services\Qiniu;
use App\Services\Wepay;
use Gibson\Wechat\Auth;
use App\Library\Curl;
use Illuminate\Http\Request;
use App\Models\PluginContact;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Config;
use App\Models\Appstore\Wepay\Wepay as Pay;
use App\Models\Appstore\Wepay\Config as PayConfig;

class WepayController extends Controller
{
    private $key = 'appstore_wepay';

    public function getIndex(Request $request, $appId = null)
    {
        if (!$appId) abort(404);
        $payConfig = PayConfig::where('app_id', $appId)->firstOrFail();

        $config = Config::get('plugin.wechatpay');
        $team = Team::where('id', $payConfig->team_id)->firstOrFail();
        $params = [
            'nonce' => mt_rand(11111, 99999),
            'token' => $team->token,
            'url' => $request->fullUrl(),
            'app_id' => $appId,
            'key' => $config['key'],
            'timestamp' => time()
        ];

        $key = $this->key . $appId;
        if (!$request->session()->get($key)) {
            $wechat = Wechat::where('team_id', $team->id)
                ->where('app_id', $payConfig->app_id)
                ->firstOrFail();
            $auth = new Auth($wechat->app_id);
            try {
                $user = $auth->authorize();
            } catch (\Exception $e) {
                return view('errors.error', ['title' => '授权失败', 'desc' => $e->getMessage()]);
            }

            if (!$user) {
                return view('errors.error', ['title' => '授权失败', 'desc' => '']);
            }

            $contact = PluginContact::where('team_id', intval($team->id))
                ->where('openid', $user->openid)
                ->first();

            if (!$contact) {
                $avatar = preg_replace(['/^http/', '/\/0$/'], ['https', '/132'], $user->headimgurl);
                $img = Qiniu::upload(Curl::to($avatar)->get());
                $contact = PluginContact::create([
                    'name' => $user->nickname,
                    'team_id' => intval($team->id),
                    'img' => $img,
                    'openid' => $user->openid,
                ]);
            }

            $request->session()->put($key, $contact->_id);
            return redirect('/' . $request->path());
        }

        $params['nonce'] = mt_rand(11111, 99999);
        $jsConfig = request_plugin('GET', 'wechatjsticket', $params);
        if (isset($jsConfig['data'])) {
            $jsConfig = $jsConfig['data'];
        }

        return view('appstore.wepay.index', compact('payConfig', 'jsConfig'));
    }

    public function postPay(Request $request, $appId = null)
    {
        if (!$appId) abort(404);
        $contactId = $request->session()->get($this->key . $appId);
        $contact = PluginContact::where('_id', $contactId)->firstOrFail();
        $payConfig = PayConfig::where('app_id', $appId)->firstOrFail();
        $team = Team::where('id', $payConfig->team_id)->firstOrFail();
        $money = $request->get('money');

        $pay = Pay::create([
            'status' => Payment::STATUS_INIT,
            'contact_id' => $contactId,
            'team_id' => $team->id,
            'config_id' => $payConfig->id
        ]);

        $payment = Payment::create([
            'fee' => $money,
            'type' => Payment::TYPE_WEPAY
        ]);

        $pay->update(['pay_id' => $payment->id]);

        // 微信支付
        $wepay = new Wepay();
        $resp = $wepay->pay($payment->trade_no, $payConfig->name, $payment->fee, $contact->openid, $payConfig->app_id, $payConfig->mchid, $payConfig->key);
        $resp['id'] = $pay->_id;

        return $this->responseJson($resp);
    }

    /**
     * 支付成功页面
     * @param Request $request
     * @param null $appId
     * @param null $id
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function getSuccess(Request $request, $appId = null, $id = null)
    {
        if (!$appId || !$id) abort(404);
        $contact = PluginContact::where('_id', $request->session()->get($this->key . $appId))->firstOrFail();
        $pay = Pay::where(['_id' => $id, 'contact_id' => $contact->_id])
            ->with('payment')
            ->firstOrFail();
        $payConfig = PayConfig::where('_id', $pay->config_id)->firstOrFail();

        $team = Team::where('id', $payConfig->team_id)->first();

        $config = Config::get('wechatpay');
        $params = [
            'nonce' => mt_rand(11111, 99999),
            'token' => $team->token,
            'url' => $request->fullUrl(),
            'app_id' => $appId,
            'key' => $config['key'],
            'timestamp' => time()
        ];

        $jsConfig = request_plugin('GET', 'wechatjsticket', $params);
        if (isset($jsConfig['data'])) {
            $jsConfig = $jsConfig['data'];
        }

        return view('appstore.wepay.success', compact('pay', 'payConfig', 'jsConfig'));
    }

    public function getRecord(Request $request, $appId = null)
    {
        $contact = PluginContact::where('_id', $request->session()->get($this->key . $appId))->firstOrFail();
        $payConfig = PayConfig::where('app_id', $appId)->firstOrFail();
        $records = Pay::where('contact_id', $contact->_id)
            ->where('config_id', $payConfig->id)
            ->orderBy('id', 'desc')
            ->where('status', Payment::STATUS_SUCCESS)
            ->with('payment')
            ->get();

        return view('appstore.wepay.record', compact('records', 'appId'));
    }

    // 测试是否支付成功
    public function postTest(Request $request, $id = null)
    {
        if (!$id) abort(404);
        $pay = Pay::where('_id', $id)->firstOrFail();

        return $this->responseJson($pay->status);
    }

    /* --------------- 后台代码 ----------------- */
    public function getAdmin(Request $request)
    {
        if (!$request->user()) abort(404);
        $teamId = intval($request->user()->team_id);
        $pays = PayConfig::where('team_id', $teamId)
            ->orderBy('_id', 'desc')
            ->get();

        $wechats = Wechat::where('team_id', $request->user()->team_id)
            ->get();

        return view('appstore.wepay.admin', compact('pays', 'wechats'));
    }

    public function postAdmin(Request $request)
    {
        if (!$request->user()) abort(404);
        $req = $request->only('app_id', 'name', 'mchid', 'key');
        $teamId = intval($request->user()->team_id);
        $req['team_id'] = $teamId;
        $payConfig = PayConfig::firstOrCreate(['app_id' => $req['app_id']]);
        $payConfig->fill($req);
        $payConfig->save();

        if (!$payConfig->qrcode) {
            $url = 'https://wx.usingnet.com/appstore/wepay/' . $req['app_id'];
            $qrcode = GenQrcode::gen($url);
            $payConfig->update(['qrcode' => $qrcode]);
        }

        if ($file = $request->file('file')) {
            $path = $file->getRealPath();
            $content = file_get_contents($path);
            $img = Qiniu::upload($content);
            $payConfig->update(['img' => $img]);
        }

        return redirect()->back();
    }

    public function getAdminshow(Request $request, $id = null)
    {
        if (!$request->user()) abort(404);
        $teamId = intval($request->user()->team_id);
        $payConfig = PayConfig::where(['team_id' => $teamId, '_id' => $id])->firstOrFail();

        if ($request->ajax()) {
            return $this->responseJson($payConfig);
        }

        $pays = Pay::where(['config_id' => $id, 'team_id' => $teamId])
            ->where('status', \App\Models\Payment::STATUS_SUCCESS)
            ->orderBy('_id', 'desc')
            ->with('contact')
            ->with('payment')
            ->paginate(20);

        return view('appstore.wepay.admin_show', compact('payConfig', 'pays'));
    }

    public function getDelete(Request $request, $id)
    {
        $team = $request->user()->team;
        PayConfig::where(['team_id' => intval($team->id), '_id' => $id])->delete();

        return redirect()->back();
    }
}