<?php

namespace App\Http\Controllers\V2;

use Illuminate\Support\Facades\Response;
use App\Library\Curl;
use Illuminate\Http\Request;
use App\Http\Requests;
use App\Http\Controllers\Controller;

class ProxyController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function getIndex(Request $request)
    {
        $url = urldecode($request->get('url'));
        if ($url) {
            echo sprintf('<script>location.href="%s";</script>', $url);
        }
    }

    public function getImage(Request $request)
    {
        header('Access-Control-Allow-Origin: *');
        $image = urldecode($request->get('url'));
        $reg = \Config::get('regular.link');

        if (preg_match($reg, $image)) {
            $header = @get_headers($image, 1);
            if (isset($header['Content-Length']) && $header['Content-Length'] < 102400) {
                $con = Curl::to($image)->get();
                if ($con) {
                    return Response::make($con)->header('Content-Type', $header['Content-Type']);
                }
            }
        }
    }
}
