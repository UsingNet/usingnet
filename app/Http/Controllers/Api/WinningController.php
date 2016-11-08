<?php

namespace App\Http\Controllers\Api;

use App\Models\Plugin\Winning;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Crypt;

class WinningController extends Controller
{
    public function getShow(Request $request, $_token)
    {
        try {
            $token = Crypt::decrypt($_token);
        } catch (\Exception $e) {
            $token = null;
        }

        $winning = Winning::where('token', $token)->first();
        if (!$winning){
            return view('errors.error', ['title' => '中奖用户已失效']);
        }

        return view('plugin.winning.show', compact('winning', '_token'));
    }

    public function postSubmit(Request $request, $token)
    {
        try {
            $token = Crypt::decrypt($token);
        } catch (\Exception $e) {
            $token = null;
        }

        $winning = Winning::where('token', $token)->first();
        if (!$winning){
            return view('errors.error', ['title' => '中奖用户已失效']);
        }

        $winning->update(['status' => Winning::STATUS_FINISH]);

        return $this->responseJson('ok');
    }
}
