<?php

namespace App\Http\Controllers\Auth;

use App\Library\Geetest;
use App\Models\Veritication;
use App\Services\Sms;
use Session;
use DB;
use Config;
use Hash;
use Validator;
use App\Models\User;
use App\Services\Mail;
use App\Models\Password;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class PasswordController extends Controller
{

    /**
     * 找回密码
     * @param Request $request
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function getReset(Request $request)
    {
        $geetest = new Geetest(Config::get('geetest.id'), Config::get('geetest.key'));
        $geetest->pre_process($request->get('phone'));
        $type = $request->get('type');
        if ($type === 'email') {
            $token = $request->get('token');
            $password = DB::table('password_resets')->where('token', $token)->first();
            if (!$password || strtotime($password->created_at) + Config::get('auth.password.expire') * 60 < time()) {
                $request->session()->flash('class', 'alert alert-danger');
                $request->session()->flash('msg', '链接已失效，请重新发送');
            } else {
                return view('auth.change.email', ['token' => $token, 'type' => $type]);
            }
        } else if ($type === 'phone') {
            return view('auth.change.phone', ['type' => $type, 'phone' => Session::get('phone')]);
        }

        return view('auth.reset', ['geetest' => $geetest->response]);
    }

    /**
     * 发送邮件
     * @param Request $request
     * @return $this|\Illuminate\Http\RedirectResponse|\Illuminate\Routing\Redirector
     */
    public function postSend(Request $request)
    {
        $challengge = $request->get('geetest_challenge');
        $validate = $request->get('geetest_validate');
        $secode = $request->get('geetest_seccode');
        $geetest = new Geetest(Config::get('geetest.id'), Config::get('geetest.key'));
        if (!$geetest->check($challengge, $validate, $secode)) {
            return $this->responseJsonError('验证失败', 403);
        }

        $username = $request->get('username');
        $phoneReg = Config::get('regular.phone');
        if (preg_match($phoneReg, $username)) {
            $user = User::where('phone', $username)->first();
            $type = 'phone';
        } else {
            $user = User::where('email', $username)->first();
            $type = 'email';
        }

        if (!$user) {
            return $this->responseJsonError('用户不存在', 404);
        }

        if ($type === 'phone') {
            $veritication = Veritication::where('source', $username)->orderBy('id', 'desc')->first();
            if ($veritication) {
                if (($sec = time() - strtotime($veritication->created_at)) < 60) {
                    return $this->responseJsonError(sprintf('请 %s 秒后发送验证码', 60 - $sec), 403);
                }
            }
            $code = mt_rand(11111, 99999);
            Veritication::create([
                'code' => $code,
                'source' => $username,
                'type' => Veritication::TYPE_PHONE
            ]);
            $response = Sms::send($username,  sprintf('【优信科技】您的验证码是%s', $code));
            $response = json_decode($response, true);
            if ($response['code'] != 0) {
                $request->session()->flash('class', 'alert alert-danger');
                $request->session()->flash('msg', $response['detail']);
                return redirect('/reset');
            }
            Session::put('phone', $username);
            return redirect('/reset?type=phone');
        } else {
            $token = Hash::make($username . time());
            Password::where('email', $username)->delete();
            Password::create(['email' => $username, 'token' => $token]);
            $url = asset('reset?token=' . urlencode($token) . '&type=email');
            $host = env('MAIL_HOST');
            $port = env('MAIL_PORT');
            $mode = \Config::get('mail.encryption');
            $from = env('MAIL_FROM');
            $to = $username;
            $username = env('MAIL_USERNAME');
            $password = env('MAIL_PASSWORD');
            $fromName = env('MAIL_FROM_NAME');
            $toName = $user->name;
            $subject = '重置您的优信密码';
            $content = view('emails.reset', ['team' => $user->team->name, 'url' => $url])->render();
            Mail::send($host, $port, $mode, $username, $password, $from, $fromName, $to, $toName, $subject, $content, true);

            $request->session()->flash('class', 'alert alert-success');
            $request->session()->flash('msg', '重置邮件已发送，请注意查收');
            return redirect('/login');
        }
    }

    /**
     * 重置密码
     * @param Request $request
     * @return $this|\Illuminate\Http\RedirectResponse|\Illuminate\Routing\Redirector
     */
    public function postReset(Request $request)
    {
        $data = $request->all();
        $validator = $this->validator($data);
        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator);
        }

        $type = $request->get('type');

        if ($type === 'email') {
            $password = Password::where('token', $data['token'])->first();
            if (!$password || strtotime($password->created_at) + Config::get('auth.password.expire') * 60 < time()) {
                $request->session()->flash('class', 'alert alert-danger');
                $request->session()->flash('msg', '链接已失效，请重新发送');
                return redirect('reset');
            }
            $user = User::where('email', $password->email)->first();
            $password->delete();
        } else {
            $veritication = Veritication::where('code', $request->get('code'))
                ->where('source', $request->get('phone'))
                ->first();

            if (!$veritication || time() - strtotime($veritication->created_at) > 60 * 10) {
                $request->session()->flash('class', 'alert alert-error');
                $request->session()->flash('msg', '验证码已过期，请重新获取');
                return redirect('reset');
            }

            $user = User::where('phone', $veritication->source)->first();
        }

        $user->password = $data['password'];
        $user->status = User::STATUS_ACTIVE;
        $user->save();

        $request->session()->flash('class', 'alert alert-success');
        $request->session()->flash('msg', '密码已重置');
        return redirect('login');
    }

    protected function validator(array $data)
    {
        return Validator::make($data, [
            'password' => 'required|confirmed'
        ], [
            'password.required' => '请填写密码',
            'password.confirmed' => '确认密码输入不正确',
        ]);
    }

}