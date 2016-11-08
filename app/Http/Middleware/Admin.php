<?php

namespace App\Http\Middleware;

use Closure;
use Config;

class Admin
{

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        if (!$request->cookie(\App\Models\Admin::COOKIE)) {
            return redirect('/auth/login');
        }

        return $next($request);
    }
}
