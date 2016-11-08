<?php

namespace App\Http\Controllers\Developer;


use App\Models\Developer\Error;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ErrorController extends Controller
{
    public function getShow(Request $request, $id)
    {
        $error = Error::where('_id', $id)->with('user')->first();
        if (!$error) {
            return view('errors.error', ['title' => '错误不存在']);
        }

        return view('developer.error', compact('error'));
    }
}