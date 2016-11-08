<?php

namespace App\Http\Controllers\V2\Wechat;

use Auth;
use Config;
use Validator;
use App\Models\User;
use App\Library\Syslog;
use Gibson\Wechat\Auth as oAuth;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Gibson\Wechat\Component;
use App\Http\Controllers\Controller;

class AuthController extends Controller
{
    const API_AUTH = 'https://mp.weixin.qq.com/cgi-bin/componentloginpage?component_appid=%s&pre_auth_code=%s&redirect_uri=%s';
    const API_GET_ACCESS_TOKEN = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=%s&secret=%s';

    public function __construct()
    {
        $this->appId = Config::get('wechat.component.appid');
        $this->redirect_uri = Config::get('wechat.component.redirect_uri');
    }

    public function getIndex()
    {
        try {
            $url = sprintf(self::API_AUTH, $this->appId, $this->getPreauthcode(), urlencode($this->redirect_uri));
        } catch (\Exception $e) {
            return view('errors.error', ['title' => '授权验证失败', 'desc' => $e->getMessage()]);
        }

        echo sprintf('<script>location.href="%s"</script>', $url);
        //return redirect($url);
    }

    /**
     * 网页授权
     */
    public function getWeb(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            $auth = new oAuth(Config::get('wechat.appid'));
            $user = $auth->authorize();
            $user = User::where('openid', $user['openid'])->first();
            if (!$user) {
                return view('errors.error', ['title' => '请先绑定微信',
                    'desc' => '登录优信后台，点击 【个人设置】，扫描二维码将您的账号和微信绑定']);
            }
            Auth::login($user);
    }

        /*
        $sso = Str::random(30);
        $user->sso = $sso;
        $user->save();
        */
        $soo = cookie()->forever('usingnet_sso', $user->sso);
        

        return redirect(Config::get('wechat.im') . '?order_id=' . $request->get('order_id'))->withCookie($soo);
    }

    /**
     * 获取预授权码
     * @return mixed
     */
    private function getPreauthcode()
    {
        $component = new Component();
        return $component->createPreAuthCode(rand(111111, 999999));
    }

    /**
     *
     */
    public function notice()
    {

    }

}
