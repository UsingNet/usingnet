<?php

namespace App\Http\Controllers\Api;

use App\Models\CustomLog;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class CustomlogController extends Controller
{
    /**
     * 客户错误日志
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $handler = CustomLog::where('team_id', $request->user()->team_id);

        return $this->listToPage($handler);
    }

}
