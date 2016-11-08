<?php

namespace App\Http\Controllers\Api\Plugin;


use App\Http\Controllers\Controller;
use App\Models\Plugin\Youzan as YouzanModel;
use App\Models\Contact;
use Illuminate\Http\Request;
use App\Services\Youzan;

class YouzanController extends Controller
{

    public function __construct(Youzan $youzan)
    {
        $this->youzan = $youzan;
    }

    public function getIndex(Request $request)
    {
        $handler = \App\Models\Plugin\Youzan::where('team_id', $request->user()->team_id);

        return $this->listToPage($handler);
    }

    public function getOrder($contactId)
    {
        $contact = Contact::find($contactId);
        if (!$contact) {
            return view('errors.error', ['title' => '用户不存在', 'desc' => '']);
        }

        $youzan = YouzanModel::where('wechat_id', $contact->wechat_id)->first();
        if (!$youzan) {
            return view('errors.error', ['title' => '未授权有赞账号', 'desc' => '']);
        }

        $user = $this->youzan->getUser($youzan->getAccessToken(), $contact->openid);
        $orders = $this->youzan->getOrder($youzan->getAccessToken(), $user['user_id']);

        return view('plugin.youzan.index', compact('orders', 'contact'));
    }

    public function postMemo(Request $request)
    {
        $data = $request->only('id', 'content', 'contact_id');
        $contact = Contact::find($data['contact_id']);
        $youzan = YouzanModel::where('wechat_id', $contact->wechat_id)->first();
        $this->youzan->updateMemo($youzan->getAccessToken(), $data['id'], $data['content']);

        return redirect()->back();
    }

    public function getClose(Request $request, $contactId)
    {
        $tid =$request->get('tid');
        $contact = Contact::find($contactId);
        $youzan = YouzanModel::where('wechat_id', $contact->wechat_id)->first();
        $this->youzan->close($youzan->getAccessToken(), $tid);

        return redirect()->back();
    }

    public function getAuth()
    {
        return $this->youzan->redirectAuth();
    }

    public function getCallback(Request $request)
    {
        $code = $request->get('code');
        $res = $this->youzan->auth($code);

        if (!isset($res['access_token'])) {
            return view('errors.error', ['title' => '授权失败', 'desc' => '获取　token 失败']);
        }

        $shop = $this->youzan->getShop($res['access_token']);

        if (!isset($shop['name'])) {
            return view('errors.error', ['title' => '授权失败', 'desc' => '获取店铺信息失败']);
        }

        $youzan = \App\Models\Plugin\Youzan::where(['sid' => $shop['sid']])->first();
        if ($youzan) {
            return view('errors.error', ['title' => '授权失败', 'desc' => '该账号已经授权']);
        }

        \App\Models\Plugin\Youzan::create([
            'name' => $shop['name'],
            'logo' => $shop['logo'],
            'url' => $shop['url'],
            'access_token' => $res['access_token'],
            'expires_in' => $res['expires_in'],
            'scope' => $res['scope'],
            'team_id' => $request->user()->team_id,
            'refresh_token' => $res['refresh_token']
        ]);

        return redirect('/#plugin');
    }
}