<?php

namespace App\Http\Controllers\Auth;

use Carbon;
use DB;
use Config;
use Validator;
use Session;
use App\Models\User;
use App\Models\Invite;
use App\Models\Team;
use App\Services\Mail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\Controller;
use Illuminate\Support\Str;
use App\Library\Geetest;
use App\Models\Veritication;
use App\Models\Setting\Plugin;
use App\Services\Sms;

class AuthController extends Controller
{
    /**
     * 登陆页
     * @return  mixed
     */
    public function getLogin(Request $request)
    {
        return view('auth.login');
    }

    /**
     * 注册页
     * @return mixed
     */
    public function getRegister(Request $request)
    {
        Session::put('promo', $request->get('promo'));
        Session::put('seller', $request->get('seller'));
        $type = $request->get('type', 'phone');
        if(!in_array($type, ['email', 'phone'])){
            $type = 'phone';
        }
        return view('auth.register', compact('type'));
    }

    /**
     * 提交登陆
     * @param Request $request
     * @return $this
     */
    public function postLogin(Request $request)
    {
        $data = $request->all();
        $validator = $this->loginValidator($data);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator);
        }
        $username = trim($request->get('username'));
        $password = trim($request->get('password'));

        $phoneReg = Config::get('regular.phone');

        if (preg_match($phoneReg, $username)) {
            $user = User::where('phone', $username)->first();
        } else  {
            $user = User::where('email', $username)->first();
        }

        if (!$user) {
            return redirect()->back()->withErrors(['用户不存在'])->withInput();
        }

        if ($user->status !== User::STATUS_ACTIVE) {
            return redirect()->back()->withErrors(['请先验证邮箱'])->withInput();
        }
        if (!Hash::check($password, $user->password)) {
            return redirect()->back()->withErrors(['用户或密码不正确'])->withInput();
        }
        $remember = isset($data['remember']) && $data['remember'] == 'on' ? true : false;
        Auth::login($user, $remember);
        $sso = Str::random(30);
        $user->sso = $sso;
        $user->save();
        $soo = cookie()->forever('usingnet_sso', $sso);
        setcookie('online', 0, time()+3600, '/', env('DOMAIN'));

        // 判断插件 跳转 http OR https
        $plugin = Plugin::where('team_id', $user->team_id)->first();
        $url = Config::get('app.url');
        if ($plugin && strpos($plugin->plugin, 'https') !== 0) {
            $url = str_replace('https', 'http', $url);
        }

        return redirect($url)->withCookie($soo);
    }

    /**
     * 提交注册
     * @param Request $request
     * @return $this|\Illuminate\Http\RedirectResponse
     */
    public function postRegister(Request $request)
    {
        $data = array_filter($request->only('team', 'email', 'password', 'password_confirmation', 'phone'));
        $validator = $this->registerValidator($data);

        if (isset($data['phone'])) {
            $phoneReg = Config::get('regular.phone');
            if (!preg_match($phoneReg, $data['phone'])) {
                $request->session()->flash('class', 'alert alert-danger');
                $request->session()->flash('msg', '手机号码格式不正确');
                return redirect()->back()->withInput();
            }
            $veritication = Veritication::where('code', $request->get('code'))
                ->where('source', $data['phone'])
                ->first();
            if (!$veritication || time() - strtotime($veritication->created_at) > 60 * 10) {
                $request->session()->flash('class', 'alert alert-danger');
                $request->session()->flash('msg', '验证码已过期，请重新获取');
                return redirect()->back()->withInput();
            }
        }

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        $url = DB::transaction(function () use ($data) {
            $token = Hash::make(uniqid() . microtime(true));
            $url = Config::get('auth.login') . '/activation?token=' . $token;
            $data['role'] = User::ROLE_MASTER;
            $data['name'] = '超级管理员';
            if (isset($data['email'])) {
                $user = User::where(['email' => $data['email'], 'status' => User::STATUS_INIT])->first();
            } else {
                $user = User::where(['phone' => $data['phone'], 'status' => User::STATUS_INIT])->first();
                $data['status'] = User::STATUS_ACTIVE;
            }

            if (!$user) {
                $user = User::create($data);
            }


            DB::table('user_activation')->insert(['user_id' => $user['id'], 'token' => $token]);

            if ($user->team_id == 0) {
                $team = Team::create(['name' => $data['team'], 'user_id' => $user->id]);
                $user->team_id = $team->id;
                $user->save();
            }

            if (Session::has('promo') && Session::has('seller')) {
                Team\Sales::create([
                    'promo_id' => Session::get('promo'),
                    'seller_id' => Session::get('seller'),
                    'user_id' => $user->id
                ]);
            }

            return $url;
        });

        if (isset($data['email'])) {
            $host = env('MAIL_HOST');
            $port = env('MAIL_PORT');
            $mode = \Config::get('mail.encryption');
            $username = env('MAIL_USERNAME');
            $password = env('MAIL_PASSWORD');
            $from = env('MAIL_FROM');
            $fromName = env('MAIL_FROM_NAME');
            $to = $data['email'];
            $toName  = null;
            $subject = '请激活您的优信帐号';
            $content = view('emails.activation', ['url' => $url, 'team' => $data['team']])->render();
            Mail::send($host, $port, $mode, $username, $password, $from, $fromName, $to, $toName, $subject, $content, true);

            $request->session()->flash('class', 'alert alert-success');
            $request->session()->flash('msg', '已向您的邮箱发送验证邮件');
        } else {
            $request->session()->flash('class', 'alert alert-success');
            $request->session()->flash('msg', '注册成功');
        }

        return redirect('/login');
    }

    /**
     * 从邮箱激活账号
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Routing\Redirector
     */
    public function getActivation(Request $request) {
        $token = $request->get('token');
        $activation = DB::table('user_activation')->where('token', $token)->first();

        if (!$activation) {
            $request->session()->flash('class', 'alert alert-danger');
            $request->session()->flash('msg', '链接已失效，请重新注册');
            return redirect('/register');
        }

        $user = User::find($activation->user_id);
        DB::table('user_activation')->where('user_id', $activation->user_id)->delete();

        if (!$user) {
            return redirect('register');
        }

        $user->status = User::STATUS_ACTIVE;
        $user->save();

        // 如果是从邀请链接的注册 加入邀请列表
        if (isset($_COOKIE['usingnet_invite'])) {
            if ($team = Team::where('token', $_COOKIE['usingnet_invite'])->first()) {
                Invite::create([
                    'team_id' => $team->id,
                    'invite_team_id' => $user->team_id
                ]);
            }
        }

        $request->session()->flash('class', 'alert alert-success');
        $request->session()->flash('msg', '账号激活成功');

        return redirect('login');
    }

    public function postSendsms(Request $request) {
        $challengge = $request->get('geetest_challenge');
        $validate = $request->get('geetest_validate');
        $secode = $request->get('geetest_seccode');
        $geetest = new Geetest(Config::get('geetest.id'), Config::get('geetest.key'));
        $phone = $request->get('phone');

        if (!$geetest->check($challengge, $validate, $secode, $phone)) {
            return $this->responseJsonError('验证失败', 403);
        }

        if (empty($phone)) {
            return $this->responseJsonError('手机号码不能为空', 403);
        }

        $phoneReg = Config::get('regular.phone');
        if (!preg_match($phoneReg, $phone)) {
            return $this->responseJsonError('手机号码格式不正确', 403);
        }

        $veritication = Veritication::where('source', $phone)->orderBy('id', 'desc')->first();
        if ($veritication) {
            if (($sec = time() - strtotime($veritication->created_at)) < 60) {
                return $this->responseJsonError(sprintf('请 %s 秒后发送验证码', 60 - $sec), 403);
            }
        }

        $code = mt_rand(11111, 99999);
        Veritication::create([
            'code' => $code,
            'source' => $phone,
            'type' => Veritication::TYPE_PHONE
        ]);

        $response = Sms::sendNotice($phone,  sprintf('【优信科技】您的验证码是: %s, 请在 1 分钟内完成验证', $code));
        $response = json_decode($response, true);
        if ($response['code'] != 0) {
            return $this->responseJsonError($response['detail'], 403);
        }

        return $this->responseJson('ok');
    }

    /**
     * 退出
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Routing\Redirector
     */
    public function getLogout() {
        Auth::logout();
        return redirect('login');
    }

    /**
     * @param array $data
     * @return mixed
     */
    public function getGeetest(Request $request) {
        $geetest = new Geetest(Config::get('geetest.id'), Config::get('geetest.key'));
        $geetest->pre_process($request->get('phone'));
        $response = $geetest->response;
        $response['token'] = csrf_token();

        return $response;
    }

    protected function registerValidator(array $data) {
        return Validator::make($data, [
            'team' => 'required|min:2|max:15',
            'email' => 'required_without:phone|email|max:255|unique:user,email,NULL,id,status,' . USER::STATUS_ACTIVE,
            'phone' => 'required_without:email',
            'password' => 'required|confirmed|min:6',
        ], [
            'team.required' => '团队名不能为空',
            'team.min' => '团名为2-8个字符',
            'team.max' => '团名为2-8个字符',
            'email.required_without' => '请填写邮箱',
            'phone.required_without' => '请填写手机号码',
            'email.email' => '请填写正确的邮箱',
            'email.unique' => '邮箱已被注册',
            'password.required' => '请填写密码',
            'password.confirmed' => '确认密码不正确',
            'password.min' => '密码不能少于 6 位',
        ]);
    }

    protected  function loginValidator(array $data) {
        return Validator::make($data, [
            'username' => 'required',
            'password' => 'required'
        ], [
            'email.required' => '用户名不能为空',
            'password.required' => '请填写密码'
        ]);
    }
}
