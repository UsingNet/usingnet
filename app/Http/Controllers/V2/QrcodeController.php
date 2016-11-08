<?php

namespace App\Http\Controllers\V2;

use App\Models\Qrcode\Qrcode;
use App\Models\Qrcode\Record;
use App\Models\Setting\Wechat;
use Gibson\Wechat\Media;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class QrcodeController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function getIndex(Request $request)
    {
        $team = $request->user()->team;
        $qrcodes = Qrcode::where('team_id', intval($team->id))
            ->orderBy('_id', 'desc')
            ->paginate(10);

        $wechats = Wechat::where('team_id', $request->user()->team_id)->get();

        return view('plugin.qrcode.index', compact('qrcodes', 'wechats'));
    }

    public function getRecord(Request $request, $id)
    {
        $qrcode = Qrcode::where('team_id', intval($request->user()->team_id))
            ->where('_id', $id)
            ->first();

        if (!$qrcode) {
            return view('errors.error', ['title' => '二维码不存在', 'desc' => '']);
        }

        $type = strtoupper($request->get('type', Record::TYPE_SUBSCRIBE));

        $handle = Record::where('team_id', intval($request->user()->team_id))
            ->where('qrcode_id', $id)
            ->where('type', $type)
            ->with('contact')
            ->orderBy('_id', 'desc');

        $records = $handle->paginate(20);

        return view('plugin.qrcode.record', compact('qrcode', 'records', 'type'));
    }

    public function getNews(Request $request, $wechatId)
    {
        $wechat = Wechat::where('team_id', $request->user()->team_id)
            ->where('id', $wechatId)
            ->first();

        if (!$wechat) {
            return $this->responseJsonError('公众号不存在', 404);
        }

        $media = new Media($wechat->getAccessToken());
        $lists = $media->lists('news');

        return $this->responseJson($lists);
    }

    public function getShow(Request $request, $id)
    {
        $qrcode = Qrcode::where('team_id', intval($request->user()->team_id))
            ->where('_id', $id)
            ->first();

        if (!$qrcode) {
            return $this->responseJsonError('二维码不存在', 404);
        }

        return $this->responseJson($qrcode);
    }

    public function getImage(Request $request, $wechatId)
    {
        $wechat = Wechat::where('team_id', $request->user()->team_id)
            ->where('id', $wechatId)
            ->first();

        if (!$wechat) {
            return $this->responseJsonError('公众号不存在', 404);
        }
    }

}

