<?php

namespace App\Http\Controllers\Api\Appstore;

use Config;
use App\Library\GenQrcode;
use App\Models\Appstore\VoteConfig;
use App\Models\Appstore\VoteRecord;
use App\Models\PluginContact;
use App\Models\Setting\Wechat;
use App\Models\Team;
use App\Services\Qiniu;
use App\Http\Controllers\Controller;
use App\Models\Appstore\Vote;
use Gibson\Wechat\Staff;
use Illuminate\Http\Request;

class VoteController extends Controller
{
    private $cookieKey = 'usingnet_plugin_vote_';
    public function __construct(Request $request)
    {
        $this->middleware('auth', ['only' => 'getIndex', 'getSetting', 'postIndex', 'getDetail', 'getDisable']);
    }

    public function getIndex(Request $request)
    {
        $team = $request->user()->team;
        $voteConfigs = VoteConfig::where('team_id', intval($team->id))->with('wechat')->get();
        foreach ($voteConfigs as $vote) {
            $vote->records = VoteRecord::where('vote_config_id', $vote->_id)->count();
            $vote->users = Vote::where('vote_config_id', $vote->_id)->count();
        }

        $wechats = Wechat::where('team_id', $team->id)->get();

        return view('appstore.vote.index', compact('voteConfigs', 'wechats'));
    }

    public function postIndex(Request $request)
    {
        $req = $request->only('app_id', 'name', 'end', 'record_txt', 'success_txt', 'btn_txt', 'btn_color',
            'title_color', 'signup_msg', 'style', 'footer');
        $req['end'] = intval($req['end']);
        $req['team_id'] = intval($request->user()->team_id);

        $config = VoteConfig::where('app_id', $req['app_id'])->first();
        if ($config) {
            $config->fill($req);
            $config->save();
        } else {
            $req['users']  = 0;
            $req['votes']  = 0;
            $req['qrcode'] = GenQrcode::gen('https://wx.usingnet.com/appstore/vote/upload/' . $req['app_id']);
            $config = VoteConfig::create($req);
        }

        if ($request->file('img')) {
            $file = $request->file('img');
            $path = $file->getRealPath();
            $content = file_get_contents($path);
            $img = Qiniu::upload($content);
            $config->update(['img' => $img]);
        }

        if ($request->file('logo')) {
            $file = $request->file('logo');
            $path = $file->getRealPath();
            $content = file_get_contents($path);
            $logo = Qiniu::upload($content);
            $config->update(['logo' => $logo]);
        }

        return redirect()->back();
    }

    public function getSetting(Request $request, $id)
    {
        $voteConfig = VoteConfig::where('_id', $id)->first();
        $votes = Vote::where('vote_config_id', $voteConfig->_id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        foreach ($votes as $vote) {
            $vote->num = VoteRecord::where('vote_config_id', $id)
                ->where('contact_id', $vote->contact_id)
                ->count();
        }

        return view('appstore.vote.user', compact('votes', 'voteConfig'));
    }

    public function getDetail(Request $request, $id)
    {
        $voteConfig = VoteConfig::where('_id', $id)->first();
        return $this->responseJson($voteConfig->toArray());
    }

    public function getDisable(Request $request, $id)
    {
        $vote = Vote::where('_id', $id)->first();
        $vote->disabled = $request->get('action') === 'disable';
        $vote->save();
        return redirect()->back();
    }



    // ---------- 下面为前台代码
    public function getUpload(Request $request, $appId = null)
    {
        if (!$appId) abort(404);
        $key = $this->cookieKey . $appId;
        $wechat = Wechat::where('app_id', $appId)->first();
        $voteConfig = VoteConfig::where('app_id', $appId)->first();
        if (!$wechat) {
            return abort(404);
        }

        $team = Team::where('id', $wechat->team_id)->first();
        $url = $request->fullUrl();
        $params = [
            'nonce' => rand(11111, 55555),
            'app_id' => $appId,
            'token' => $team->token,
            'key' => 'profile',
            'timestamp' => time(),
            'url' => $url
        ];

        // 用户登录
        if (!$request->session()->get($key)) {
            $openid = plugin_login($params);
            $contact = PluginContact::where('team_id', intval($team->id))
                ->where('openid', $openid)
                ->first();
            if (!$contact) {
                return view('errors.error', ['title' => '登录失败']);
            }
            $request->session()->put($key, $contact->id);
            return redirect('/' . $request->path());
        }

        $id = $request->session()->get($key);
        $contact  = PluginContact::where('_id', $id)->first();
        $vote = Vote::firstOrCreate([
            'team_id' => $team->id,
            'contact_id' => $contact->id,
            'vote_config_id' => $voteConfig->_id
        ]);

        if ($vote->disabled) {
            return view('errors.error', ['title' => '被禁用', 'desc' => '您的账号已被禁用，请联系管理员']);
        }

        $resp = request_plugin('GET', 'wechatjsticket', $params);
        $config = [];
        if (isset($resp['data']) && is_array($resp['data'])) {
            $config = $resp['data'];
        }

        if (!$vote->qrcode) {
            $params['nonce'] = mt_rand(11111, 99999);
            $params['activity_id'] = $voteConfig->_id;
            $params['user_id'] = $contact->_id;
            $resp = request_plugin('GET', 'voteqrcode', $params);
            if (isset($resp['data'])) {
                $vote->update(['qrcode' => $resp['data']]);
            }
            VoteConfig::where('_id', $voteConfig->_id)->increment('users');
        }

        if ($vote->img && $request->get('action') !== 'edit')  {
            $url = asset('/appstore/vote/show/' . $vote->_id);
            echo '<script>location.href="'.$url.'"</script>';
        }

        if (!is_array($vote->photos)) {
            $vote->photos = [];
        }

        return view('appstore.vote.upload', compact('config', 'vote', 'voteConfig'));
    }

    public function postUpload(Request $request)
    {
        $req = $request->only('media_id', 'local_id', 'vote_config_id');
        $voteConfig = VoteConfig::where('_id', $req['vote_config_id'])->firstOrFail();
        $team = Team::where('id', $voteConfig->team_id)->first();

        $url = $request->fullUrl();
        $params = [
            'nonce' => rand(11111, 55555),
            'app_id' => $voteConfig->app_id,
            'token' => $team->token,
            'key' => 'profile',
            'timestamp' => time(),
            'url' => $url,
            'local_id' => $req['local_id'],
            'media_id' => $req['media_id']
        ];

        $resp = request_plugin('GET', 'download', $params);
        $img = '';
        if (isset($resp['data'])) {
            $img = $resp['data'];
        }

        return $this->responseJson(['data' => $img]);
    }

    public function postSubmit(Request $request)
    {
        $req = $request->only('img', 'desc', 'id', 'photos', 'music');

        $vote = Vote::where('_id', $req['id'])->first();

        // 第一次上传图片推送报名消息
        if (!$vote->img) {
            try {
                $voteConfig = VoteConfig::where('_id', $vote->vote_config_id)->first();
                $wechat = Wechat::where('app_id', $voteConfig->app_id)->first();
                $staff = new Staff($wechat->getAccessToken());
                $contact = PluginContact::where('_id', $vote->contact_id)->first();
                if ($voteConfig->signup_msg) {
                    $staff->send($voteConfig->signup_msg)->to($contact->openid);
                }
            } catch (\Exception $e) {
            }
        }

        $vote->fill($req);
        $vote->save();

        $url = asset('/appstore/vote/show/' . $vote->_id);
        echo '<script>location.href="'. $url .'"</script>';
    }

    public function getShow(Request $request, $id)
    {
        $vote = Vote::where('_id', $id)
            ->with('contact')
            ->first();

        if (!$vote) {
            abort(404);
        }

        if ($vote->disabled) {
            return view('errors.error', ['title' => '被禁用', 'desc' => '您的账号已被禁用，请联系管理员']);
        }

        $voteConfig = VoteConfig::where('_id', $vote->vote_config_id)->first();
        $records = VoteRecord::where('vote_config_id', $voteConfig->_id)
            ->where('contact_id', $vote->contact->id)
            ->with('contact')
            ->orderBy('_id', 'desc')
            ->get();

        $team = Team::where('id', $vote->team_id)->first();
        $fullUrl = $request->fullUrl();
        $params = [
            'nonce' => rand(11111, 55555),
            'app_id' => $voteConfig->app_id,
            'token' => $team->token,
            'key' => 'profile',
            'timestamp' => time(),
            'url' => $fullUrl
        ];
        $config = [];
        $resp = request_plugin('GET', 'wechatjsticket', $params);
        if (isset($resp['data'])) {
            $config = $resp['data'];
        }

        if (preg_match('/^\/\//', $vote->img)) {
            $vote->img = 'https:' . $vote->img;
        }

        if (!$vote->qrcode) {
            $params['nonce'] = mt_rand(11111, 99999);
            $params['activity_id'] = $voteConfig->_id;
            $params['user_id'] = $vote->contact_id;
            $resp = request_plugin('GET', 'voteqrcode', $params);
            if (isset($resp['data'])) {
                $vote->update(['qrcode' => $resp['data']]);
            }
            VoteConfig::where('_id', $voteConfig->_id)->increment('users');
        }

        $expired = false;
        if ($voteConfig->end) {
            $end = $vote->created_at->timestamp + ($voteConfig->end * 24 * 3600);
            if ($end < time()) {
                $expired = true;
            }
        }

        $logined = $request->session()->get($this->cookieKey . $voteConfig->app_id);

        if (!is_array($vote->photos)) {
            $vote->photos = [];
        }

        return view('appstore.vote.show', compact('vote', 'voteConfig', 'records', 'logined', 'config', 'expired'));
    }
}