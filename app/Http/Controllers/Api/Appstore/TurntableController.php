<?php

namespace App\Http\Controllers\Api\Appstore;

use App\Library\GenQrcode;
use App\Library\Syslog;
use App\Models\Team;
use Illuminate\Http\Request;
use App\Models\PluginContact;
use App\Models\Setting\Wechat;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Models\Appstore\TurntableStaff;
use App\Models\Appstore\TurntableConfig;
use App\Models\Appstore\TurntableLottery;

class TurntableController extends Controller
{

    private $cookieKey =  'usingnet_plugin_turntable_';

    public function __construct()
    {
        $this->middleware('auth', ['except' => ['getShow', 'postLottery', 'getRecent', 'postProfile', 'postLottery']]);
    }

    public function getIndex(Request $request)
    {
        $wechats = Wechat::where('team_id', $request->user()->team_id)->get();
        $configs = TurntableConfig::where('team_id', $request->user()->team_id)->get();

        return view('appstore.turntable.index', compact('wechats', 'configs'));
    }

    public function postSubmit(Request $request)
    {
        $req = $request->only('name', 'app_id', 'staffs', 'desc');

        $config = TurntableConfig::firstOrCreate([
            'app_id' => $req['app_id'],
            'team_id' => $request->user()->team_id
        ]);

        $config->fill($req);
        $config->save();

        TurntableStaff::where('config_id', $config->id)->delete();

        $pageUrl = 'https://wx.usingnet.com/appstore/turntable/show/' . $config->id;
        if (!$config->qrcode) {
            $qrcode = GenQrcode::gen($pageUrl);
            $config->update(['qrcode' => $qrcode]);
        }

        foreach ($req['staffs'] as $staff) {
            $staff['config_id'] = $config->id;
            TurntableStaff::create($staff);
        }

        return $this->responseJson('ok');
    }

    public function getConfig(Request $request, $id = null)
    {
        if (!$id) abort(404);
        $config = TurntableConfig::where('id', $id)
            ->with('staffs')
            ->first()
            ->toArray();

        return $this->responseJson($config);
    }

    public function getUser(Request $request, $id = null)
    {
        if (!$id) abort(404);
        $users = TurntableLottery::where('team_id', $request->user()->team_id)
            ->where('config_id', $id)
            ->where('staff_id', '<>', '')
            ->with('staff')
            ->get();

        foreach ($users as $user) {
            $user->contact = PluginContact::where('_id', $user->contact_id)->first();
        }

        return view('appstore.turntable.user', compact('users'));
    }


    // 前端
    // ---------------
    public function getShow(Request $request, $id = null)
    {
        if (!$id) abort(404);
        $key = $this->cookieKey . $id;
        $contactId = $request->session()->get($key);

        $config = TurntableConfig::where('id', $id)->first();
        if (!$config) abort(404);
        $team = Team::where('id', $config->team_id)->first();

        $params = [
            'nonce' => rand(11111, 55555),
            'app_id' => $config->app_id,
            'token' => $team->token,
            'key' => 'turntable',
            'timestamp' => time(),
            'url' => $request->fullUrl()
        ];

        if (!$contactId) {
            $openid = plugin_login($params);
            $contact = PluginContact::where('openid', $openid)
                ->where('team_id', intval($team->id))
                ->first();
            if (!$contact) return view('errors.error', ['title' => '登录失败']);
            $request->session()->put($key, $contact->id);
            return redirect('/' . $request->path());
        }

        $contact = PluginContact::where('_id', $contactId)->first();
        if (!$contact) {
            return view('errors.error', ['title' => '用户不存在']);
        }

        $lotters= TurntableLottery::where('config_id', $config->id)
            ->where('staff_id', '<>', '')
            ->with('staff')
            ->with('contact')
            ->get();

        $lotteryCount = TurntableLottery::where('contact_id', $contactId)->count();
        foreach ($lotters as $lottery) {
            $contact = PluginContact::where('_id', $lottery->contact_id)->first();
            $lottery->phone = preg_replace('/(\d{3})\d+(\d{4})/', '$1*****$2', $contact->phone);
            $lottery->name = $contact->name;
        }

        $params['nonce'] = rand(11111, 55555);
        $jsConfig = request_plugin('GET', 'wechatjsticket', $params)['data'];

        return view('appstore.turntable.show', compact('config', 'contact', 'lotters', 'lotteryCount', 'jsConfig'));
    }

    public function postProfile(Request $request, $id = null)
    {
        if (!$id) abort(404);
        $phone = $request->get('phone');
        if (!preg_match(\Config::get('regular.phone'), $phone)) {
            return $this->responseJsonError('手机号码格式不正确', 403);
        }

        $contactId = $request->session()->get($this->cookieKey . $id);
        PluginContact::where('_id', $contactId)->update(['phone' => $phone]);

        return $this->responseJson('ok');
    }

    public function postLottery(Request $request, $id = null)
    {
        if (!$id) abort(404);
        $config = TurntableConfig::where('id', $id)->first();
        if (!$config) abort(404);
        $contactId = $request->session()->get($this->cookieKey.$id);
        $contact = PluginContact::where('_id', $contactId)->first();
        if (!$contact) {
            return $this->responseJsonError('未登录', 403);
        }

        // 抽奖次数
        $lotteries = TurntableLottery::where('contact_id', $contactId)->get();
        if ($lotteries->count() == 3) {
            return $this->responseJsonError('您已经抽过 3 次了', 403);
        }

        $resp = '谢谢参与';
        // 判断是否已中奖
        $winning = false;
        foreach ($lotteries as $lottery) {
            if ($lottery->staff_id) {
                $winning = true;
            }
        }
        if ($winning) {
            $resp = '谢谢参与';
        }

        DB::beginTransaction();
        try {
            $staffs = DB::table('appstore_turntable_staff')->where('config_id', $config->id)
                ->where('num', '<>', 0)
                ->lockForUpdate()
                ->get();
            $staff = null;
            if (count($staffs)) {

                // 已抽奖两次的直接给奖
                if ($lotteries->count() == 2)  {
                    DB::table('appstore_turntable_staff')->where('id', $staffs[0]->id)->update(['num' => 0]);
                    $staff = $staffs[0];
                } else {
                    $rand = mt_rand(0, count($staffs) * 5 + 10);
                    if (isset($staffs[$rand])) {
                        $staff = $staffs[$rand];
                        DB::table('appstore_turntable_staff')->where('id', $staffs[$rand]->id)->update(['num' => 0]);
                    }
                }

                if ($staff) {
                    $resp = $staff->name;
                }
            }

            // 添加抽奖记录
            TurntableLottery::create([
                'team_id' => $config->team_id,
                'contact_id' => $contactId,
                'staff_id' => $staff && $staff->name != '谢谢参与' ? $staff->id : '',
                'config_id' => $config->id
            ]);
            DB::commit();
        } catch (\Exception $e){
            DB::rollback();
            Syslog::logger('PLAY')->addCritical('PLAY_FAILD', [$e->getMessage()]);
            throw $e;
        }

        return $this->responseJson($resp);
    }

    public function getRecent(Request $request, $id = null)
    {
        if (!$id) abort(404);

        $lotters= TurntableLottery::where('config_id', $id)
            ->where('staff_id', '<>', '')
            ->with('staff')
            ->with('contact')
            ->get()
            ->toArray();

        foreach ($lotters as &$lottery) {
            $contact = PluginContact::where('_id', $lottery['contact_id'])->first();
            $lottery['phone'] = preg_replace('/(\d{3})\d+(\d{4})/', '$1*****$2', $contact->phone);
            $lottery['name'] = $contact->name;
        }

        return $this->responseJson(['data' => $lotters]);
    }

}
