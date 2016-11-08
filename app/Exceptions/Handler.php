<?php

namespace App\Exceptions;

use App\Library\Syslog;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;

class Handler extends ExceptionHandler
{
    /**
     * A list of the exception types that should not be reported.
     *
     * @var array
     */
    protected $dontReport = [
        HttpException::class,
        ModelNotFoundException::class,
    ];

    /**
     * Report or log an exception.
     *
     * This is a great spot to send exceptions to Sentry, Bugsnag, etc.
     *
     * @param  \Exception  $e
     * @return void
     */
    public function report(Exception $e)
    {
        return parent::report($e);
    }

    /**
     * Render an exception into an HTTP response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Exception  $e
     * @return \Illuminate\Http\Response
     */
    public function render($request, Exception $e)
    {
        if ($e instanceof ModelNotFoundException) {
            $e = new NotFoundHttpException($e->getMessage(), $e);
        }

        // 微信用户屏蔽公众号消息
        if ($e->getCode() === 48002) {
            exit;
        }

        if ($e instanceof MethodNotAllowedHttpException) {
            Syslog::logger('METHOD_NOT_FOUND')->addWarning('METHOD_NOT_FOUND', [$e]);
            if (!env('APP_DEBUG')) {
                return response()->view('errors.error', ['title' => 'Method Not Found', 'desc' => ''], 200);
            }
        }

        // 404
        if ($e instanceof \Symfony\Component\HttpKernel\Exception\NotFoundHttpException) {
            Syslog::logger('WEB')->addWarning('REQUEST_ERROR_404', [$e]);
            if (!env('APP_DEBUG')) {
                return response()->view('errors.error', ['title' => '404', 'desc' => '页面找不到了'], 404);
            }
        } else {
            Syslog::logger('WEB')->addCritical('REQUEST_ERROR_500', [$e]);
            if (!env('APP_DEBUG')) {
                return response()->view('errors.error', ['title' => '服务器错误，请稍后访问', 'desc' => ''], 500);
            }
        }

        return parent::render($request, $e);
    }
}
