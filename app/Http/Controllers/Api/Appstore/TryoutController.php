<?php

namespace App\Http\Controllers\Api\Appstore;

use Carbon\Carbon;
use Config;
use App\Models\Appstore\Tryout;
use App\Models\PluginContact;
use App\Services\Wepay;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;

class TryoutController extends Controller
{
    private $cookieKey = 'usingnet_plugin_tryout';

    public function getIndex(Request $request)
    {
        $config = Config::get('plugin.tryout');
        $params = [
            'nonce' => mt_rand(11111, 99999),
            'token' => $config['token'],
            'url' => $request->fullUrl(),
            'app_id' => $config['app_id'],
            'key' => $config['key'],
            'timestamp' => time()
        ];

        if (!$request->cookie($this->cookieKey)) {
            $unionid = plugin_login($params);
            $contact = PluginContact::where('unionid', $unionid)
                ->where('team_id', 1)
                ->first();

            if (!$contact) return view('errors.error', ['title' => '登录失败']);
            $cookie = cookie()->forever($this->cookieKey, $contact->id);
            return redirect('/'. $request->path())->withCookie($cookie);
        }

        $contact = PluginContact::where('_id', $request->cookie($this->cookieKey))->first();
        $tryout = Tryout::firstOrCreate([
            'contact_id' => $contact->_id
        ]);

        if (!$tryout->trade_no) {
            $tryout->update(['trade_no' => Tryout::genTradeNo()]);
            $expire = Carbon::now()->addMinute(70);
            $tryout->update(['time_expire' => $expire]);
        }

        if (time() - strtotime($tryout->time_expire) > 60 * 60) {
            $tryout->update(['trade_no' => Tryout::genTradeNo()]);
        }

        // jssdk 配置
        $params['nonce'] = mt_rand(111111, 555555);

        $config = request_plugin('GET', 'wechatjsticket', $params)['data'];
        $price = Config::get('plugin.tryout.price');

        return view('appstore.tryout.index', compact('price', 'tryout', 'config'));
    }

    public function postSuccess(Request $request)
    {
        $id = $request->only('id');
        $tryout = Tryout::where('id', $id)->first();
        if ($tryout) {
            return $this->responseJson(['data' => $tryout->payed ? 'ok' : 'no']);
        }

        return $this->responseJsonError('订单不存在', 403);
    }

    public function postIndex(Request $request)
    {
        $req = $request->only('name', 'business', 'phone');
        $validator = Validator::make($req, [
            'name' => 'required',
            'business' => 'required',
            'phone' => 'required'
        ]);

        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError($errors, 403);
        }

        $contactId = $request->cookie($this->cookieKey);
        $contact = PluginContact::where('_id', $contactId)->first();
        $tryout = Tryout::where('contact_id', $contactId)->first();

        if (!$tryout->trade_no) {
            $tryout->trade_no = Tryout::genTradeNo();
        }

        $tryout->fill($req);
        $tryout->save();

        // 微信支付
        $wepay = new Wepay(Config::get('wechat.pay'));
        $name  = Config::get('plugin.tryout.name');
        $fee = Config::get('plugin.tryout.price');
        $resp = $wepay->pay($tryout->trade_no, $name, $fee, $request->ip(), $contact->openid, $tryout->time_expire);

        return $this->responseJson($resp);
    }

    public function getUser(Request $request)
    {
        if ($request->user() && $request->user()->team_id == 1) {
            $tryouts = Tryout::with('contact')
                ->where('name', '<>', '')
                ->paginate(20);

            return view('appstore.tryout.user', compact('tryouts'));
        }
    }
}
