<?php

namespace App\Http\Middleware;

use Closure;
use Config;
use Illuminate\Contracts\Auth\Guard;
use Illuminate\Support\Facades\Cookie;

class Authenticate
{
    /**
     * The Guard implementation.
     *
     * @var Guard
     */
    protected $auth;

    /**
     * Create a new filter instance.
     *
     * @param  Guard  $auth
     * @return void
     */
    public function __construct(Guard $auth)
    {
        $this->auth = $auth;
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        if ($this->auth->guest()) {
            if (preg_match('/MicroMessenger/i', $_SERVER['HTTP_USER_AGENT'])) {
                $url = Config::get('auth.weixin') . '?referrer=' . urlencode($request->fullUrl());
                return redirect($url);
                exit;
            }

            return response()->json(['success' => false, 'code' => 408, 'msg' => '登录超时',
                'data' => ['login' => Config::get('auth.login')]]);
        } else if ($request->cookie('usingnet_sso') != $request->user()->sso) {
            \Auth::logout();
            if ($request->ajax()) {
                return response()->json(['success' => false, 'code' => 409, 'msg' => '您的账号在其它地方登录',
                    'data' => ['login' => Config::get('auth.login')]]);
                exit;
            } else {
                return redirect(Config::get('auth.login'));
                exit;
            }
        }

        // 判断套餐 Api 访问权限
        /*
        $allows = explode("\r\n", $request->user()->team->plan->plan->allows);
        $uri = $request->path();
        $pair = explode('/', $uri);
        if (!in_array($pair[1], $allows)) {
            return response()->json([
                'success' => false,
                'code' => 403,
                'msg' => sprintf('您现在的套餐是%s, 不能调用 %s 接口', $request->user()->team->plan->name, $pair[1])
            ]);
        }
        */

        return $next($request);
    }
}
