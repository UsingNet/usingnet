<?php

namespace App\Http\Controllers\Api\Appstore;

use Config;
use App\Http\Controllers\Controller;
use App\Models\Appstore;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MainController extends Controller
{
    public function __construct(Request $request)
    {
        $this->middleware('auth', ['except' => 'getLogout']);
    }

    public function getAll(Request $request)
    {
        $apps = Appstore::where('mobile_url', '<>', '')->get();

        $team = $request->user()->team;
        return view('appstore.index', compact('apps', 'team'));
    }

    public function getLogout(Request $request)
    {
        if ($request->user()) {
            Auth::logout();
        }

        return view('appstore.logout');
    }
}