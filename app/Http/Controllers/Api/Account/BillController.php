<?php

namespace App\Http\Controllers\Api\Account;

use App\Models\Bill;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class BillController extends Controller
{
    /**
     * 消费记录列表
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $handler = Bill::where('team_id', $request->user()->team_id)->orderBy('id', 'desc');

        return $this->listToPage($handler);
    }

}
