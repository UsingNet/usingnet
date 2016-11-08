<?php

namespace App\Http\Middleware;

use Closure;
use App;
use App\Library\Syslog;
use Illuminate\Contracts\Routing\TerminableMiddleware;

class CommonLogger
{
    /**
     * 记录全局 Request Log
     * @param $request
     * @param Closure $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        \DB::enableQueryLog();
        $body = $request->except('password');
        $cookieKey = \Config::get('session.cookie');
        $cookie = $request->cookie();
        if (isset($cookie[$cookieKey])) {
            $cookie[$cookieKey] = md5($cookie[$cookieKey]);
        }
        $logs = [
            'uri' => $request->path(),
            'method' => $request->method(),
            'cookie' => $request->cookie(),
            'body' => $body,
            'referer' => isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : null,
            'user_agent' => isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : null,
            'ip' => get_ip(),
            'time' => [time(), date('Y-m-d H:i:s')]
        ];

        Syslog::logger('COMMON')->debug('REQUEST_INFO', $logs);

        return $next($request);
    }

    /**
     * 记录全局 Response Log
     * @param $request
     * @param $response
     */
    public function terminate($request, $response)
    {
        $logs = \DB::getQueryLog();
        Syslog::logger('WEB')->addDebug('REQUEST_QUERY_LOG', $logs);
        $cookieKey = \Config::get('session.cookie');
        $cookie = $request->cookie();
        if (isset($cookie[$cookieKey])) {
            $cookie[$cookieKey] = md5($cookie[$cookieKey]);
        }
        $logs = [
            'uri' => $request->path(),
            'cookie' => $cookie,
            'method' => $request->method(),
            'output' => $response->getContent(),
            'time' => [time(), date('Y-m-d H:i:s')],
            'headers' => $response->headers,
            'user' => $request->user()
        ];
        Syslog::logger('WEB')->addDebug('REQUEST_RESPONSE', $logs);
    }

}