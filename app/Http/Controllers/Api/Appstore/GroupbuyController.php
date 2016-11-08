<?php

namespace App\Http\Controllers\Api\Appstore;

use App\Models\Team;
use App\Services\Qiniu;
use App\Models\Payment;
use App\Services\Wepay;
use App\Library\GenQrcode;
use Illuminate\Http\Request;
use App\Models\Appstore\Pay;
use App\Models\PluginContact;
use App\Models\Setting\Wechat;
use App\Models\Appstore\PayConfig;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Validator;
use App\Models\Appstore\Groupbuy\Groupbuy;
use App\Models\Appstore\Groupbuy\Config as GroupbuyConfig;
use App\Models\Appstore\Groupbuy\Member as GroupbuyMember;

class GroupbuyController extends Controller
{
    private $key = 'appstore_groupbuy_';

    public function getIndex(Request $request, $id = null)
    {
        if (!$id) abort(404);

        $key = $this->key . $id;
        $contactId = $request->session()->get($key);
        $groupbuyConfig = GroupbuyConfig::where('_id', $id)->firstOrFail();

        $config = Config::get('plugin.groupbuy');
        $team = Team::where('id', $groupbuyConfig->team_id)->firstOrFail();
        $params = [
            'nonce' => mt_rand(11111, 99999),
            'token' => $team->token,
            'url' => $request->fullUrl(),
            'app_id' => $groupbuyConfig->app_id,
            'key' => $config['key'],
            'timestamp' => time()
        ];

        if (!$contactId) {
            $openid = plugin_login($params);
            $contact = PluginContact::where('openid', $openid)
                ->where('team_id', intval($team->id))
                ->firstOrFail();
            $request->session()->put($key, $contact->id);
            return redirect('/' . $request->path());
        }

        $groups = Groupbuy::where('config_id', $id)
            ->orderBy('_id', 'desc')
            ->get();

        foreach ($groups as $group) {
            $group->contact = PluginContact::where('_id', $group->contact_id)->first();
            $members = GroupbuyMember::where('groupbuy_id', $group->id)->get();
            $group->member = $members->count();
            $group->expire = $group->created_at->timestamp + (($groupbuyConfig->max_day - 1) * 24 * 3600) - time();
            $group->joined = in_array($contactId, $members->lists('contact_id')->toArray()) ? true : false;
        }

        return view('appstore.groupbuy.index', compact('groupbuyConfig', 'groups'));
    }

    public function getMember(Request $request, $configId = null)
    {
        if (!$configId) abort(404);
        $id = $request->get('id');

        $contactId = $request->session()->get($this->key . $configId);
        $contact = PluginContact::where('_id', $contactId)->firstOrFail();
        $groupbuyConfig = GroupbuyConfig::where('_id', $configId)->firstOrFail();
        $groupbuy = Groupbuy::where('_id', $id)->firstOrFail();

        $members = GroupbuyMember::where('groupbuy_id', $id)->with('contact')->get();

        foreach ($members as $member) {
            $member->contact = PluginContact::where('_id', $member->contact_id)->first();
        }

        $groupbuy->expire = $groupbuy->created_at->timestamp + (($groupbuyConfig->max_day - 1) * 24 * 3600) - time();
        $self = GroupbuyMember::firstOrCreate([
            'contact_id' => $contact->_id,
            'groupbuy_id' => $groupbuy->id
        ]);

        if (!$self->pay_id) {
            $payment = Payment::create([
                'fee' => $groupbuyConfig->deposit,
                'type' => Payment::TYPE_WEPAY
            ]);
            $self->update(['pay_id' => $payment->id]);
        }

        $team = Team::where('id', $groupbuyConfig->team_id)->firstOrFail();
        $config = Config::get('plugin.groupbuy');
        $params = [
            'nonce' => mt_rand(11111, 99999),
            'token' => $team->token,
            'url' => $request->fullUrl(),
            'app_id' => $groupbuyConfig->app_id,
            'key' => $config['key'],
            'timestamp' => time()
        ];

        $jsConfig = request_plugin('GET', 'wechatjsticket', $params);
        if (isset($jsConfig['data'])) {
            $jsConfig = $jsConfig['data'];
        }

        return view('appstore.groupbuy.member', compact('groupbuyConfig', 'groupbuy', 'members', 'self', 'jsConfig', 'contact'));
    }

    public function postPay(Request $request, $configId)
    {
        if (!$configId) abort(404);
        $config = GroupbuyConfig::where('_id', $configId)->first();
        $req = $request->only('id', 'groupbuy_id');

        $member = GroupbuyMember::where('_id', $req['id'])
            ->where('groupbuy_id', $req['groupbuy_id'])
            ->firstOrFail();

        $contact = PluginContact::where('_id', $member->contact_id)->firstOrFail();
        if (!$member->pay_id) {
            $payment = Payment::create([
                'fee' => $config->deposit,
                'type' => Payment::TYPE_WEPAY
            ]);
        } else {
            $payment = Payment::where('id', $member->pay_id)->first();
        }

        if ($payment->status === Payment::STATUS_SUCCESS) {
            return $this->responseJsonError('已支付', 403);
        }

        // 微信支付要每次生成新的订单号
        $payment->update(['trade_no' => mt_rand(111111111, 999999999) . $payment->id]);

        // 微信支付
        $wepay = new Wepay();
        $resp = $wepay->pay($payment->trade_no, $config->name, $config->deposit, $contact->openid);

        return $this->responseJson($resp);
    }

    /**
     * 测试是否支付成功
     * @param Request $request
     * @param null $id
     * @return mixed
     */
    public function postTest(Request $request, $id = null)
    {
        if (!$id) abort(404);
        $pay = GroupbuyMember::where('_id', $id)->firstOrFail();

        return $this->responseJson($pay->status);
    }

    /**
     * 退出团购
     * @param Request $request
     * @param null $configId
     * @param null $id
     */
    public function getOut(Request $request, $configId = null, $id = null)
    {
        if (!$configId || !$id) abort(404);
        $contactId = $request->session()->get($this->key . $configId);
        $contact = PluginContact::where('_id', $contactId)->firstOrFail();
        GroupbuyMember::where(['contact_id' => $contact->_id, 'groupbuy_id' => $id])->delete();

        return redirect(asset('/appstore/groupbuy/' . $configId));
    }

    /**
     * 发起团购
     * @param Request $request
     */
    public function postAdd(Request $request, $id = null)
    {
        if (!$id) abort(404);
        $contactId = $request->session()->get($this->key . $id);
        $contact = PluginContact::where('_id', $contactId)->firstOrFail();

        $req = $request->only('name', 'phone');

        $validator = $this->validator($req);
        if ($validator->fails()) {
            $errors = $validator->errors()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        $groupbuy = Groupbuy::create([
            'contact_id' => $contact->_id,
            'name' => $req['name'],
            'phone' => $req['phone'],
            'config_id' => $id
        ]);

        // 添加团长进团
        GroupbuyMember::create([
            'contact_id' => $contact->id,
            'groupbuy_id' => $groupbuy->id,
            'name' => $req['name'],
            'phone' => $req['phone'],
        ]);

        return $this->responseJson($groupbuy);
    }

    /**
     * 加入团购
     * @param Request $request
     */
    public function postJoin(Request $request, $configId)
    {
        $req = $request->only('name', 'phone', 'id');
        $contactId = $request->session()->get($this->key . $configId);
        $contact = PluginContact::where('_id', $contactId)->firstOrFail();

        $validator = $this->validator($req);
        if ($validator->fails()) {
            $errors = $validator->errors()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        $groupbuyMember = GroupbuyMember::firstOrCreate([
            'contact_id' => $contact->id,
            'groupbuy_id' => $req['id'],
        ]);

        $groupbuyMember->fill($req);
        $groupbuyMember->save();

        return $this->responseJson($groupbuyMember);
    }

    /****************** 后台代码 *******************/

    public function getAdmin(Request $request)
    {
        if (!$request->user()) abort(404);
        $groups = GroupbuyConfig::where('team_id', $request->user()->team_id)
            ->orderBy('_id', 'desc')
            ->paginate(20);
        $teamId = intval($request->user()->team_id);

        $wechats = Wechat::where('team_id', $teamId)->get();
        foreach ($groups as $group) {
            $group->count = Groupbuy::where('config_id', $group->id)->count();
        }

        return view('appstore.groupbuy.admin', compact('groups', 'wechats'));
    }

    public function postAdmin(Request $request)
    {
        if (!$request->user()) abort(404);
        $req = $request->only('name', 'id', 'max_num', 'max_day', 'deposit', 'app_id');
        $teamId = intval($request->user()->team_id);
        $req['team_id'] = $teamId;

        if ($file = $request->file('file')) {
            $path = $file->getRealPath();
            $content = file_get_contents($path);
            $img = Qiniu::upload($content);
            $req['img'] = $img;
        }

        if ($req['id']) {
            $config = GroupbuyConfig::where(['team_id' => $teamId, '_id' => $req['id']])->first();
            $config->fill($req);
            $config->save();
        } else {
            $config = GroupbuyConfig::create($req);
        }

        if (!$config->qrcode) {
            $url = 'https://wx.usingnet.com/appstore/groupbuy/' . $config->_id;
            $qrcode = GenQrcode::gen($url);
            $config->update(['qrcode' => $qrcode]);
        }

        return redirect()->back();
    }

    public function getAdminshow(Request $request, $id = null)
    {
        if (!$request->user()) abort(404);

        $teamId = intval($request->user()->team_id);
        $config = GroupbuyConfig::where(['team_id' => $teamId, '_id' => $id])->first();
        if (!$config) abort(404);

        if ($request->ajax()) {
            return $this->responseJson($config);
        }

        $groupbuys = Groupbuy::where('config_id', $id)
            ->orderBy('id', 'desc')
            ->with('contact')
            ->with(['members' => function($q) {
                $q->with('contact');
            }])
            ->paginate(20);

        return view('appstore.groupbuy.admin_show', compact('config', 'groupbuys'));
    }

    public function validator($req)
    {
        $rules = [
            'name' => 'required',
            'phone' => ['required', 'regex:' . Config::get('regular.phone')]  //. Config::get('regular.phone')
        ];
        $messages = [
            'name.required' => '请填写名字',
            'phone.required' => '请填写手机号码',
            'phone.regex' => '手机号码格式不正确'
        ];
        return Validator::make($req, $rules, $messages);
    }
}