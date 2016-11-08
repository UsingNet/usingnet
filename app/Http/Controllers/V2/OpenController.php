<?php

namespace App\Http\Controllers\V2;

use App\Models\Knowledge\Knowledge;
use App\Models\Team;
use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;

class OpenController extends Controller
{
    public function getKnowledge(Request $request, $token)
    {
        $team = Team::where('token', $token)->first();
        if (!$team) {
            return $this->responseJsonError('客服团队不存在', 404);
        }

        $handler = Knowledge::where('team_id', $team->team_id);

        return $this->listToPage($handler);
    }
}
