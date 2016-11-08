<?php

namespace App\Http\Controllers\V2\Wechat;

use App\Models\Setting\QuickReply;
use App\Models\Setting\Wechat;
use App\Services\Qiniu;
use Config;
use Gibson\Wechat\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Validator;
use MongoDB\BSON\ObjectID;
use Overtrue\Wechat\QRCode;
use App\Http\Controllers\Controller;

class QrcodeController extends Controller
{

    public function __construct()
    {
        $this->middleware('auth');
    }

    public function getIndex(Request $request)
    {
        $redis = Redis::connection();
        $user = $request->user();
        $qrcode = new QRCode(\Config::get('wechat.appid'), Config::get('wechat.secret'));
        $ticketKey = 'ticket:' . $user->id;
        $ticketTime = 6 * 24 * 3600;
        $ticket = $redis->get($ticketKey);

        if (!$ticket) {
            $result = $qrcode->temporary($request->user()->id, $ticketTime);
            $ticket = $result->ticket;
            $redis->set($ticketKey, $ticket);
            $redis->expire($ticketKey, $ticketTime);
            $redis->set($ticket, $user->id);
        }

        return response(file_get_contents($qrcode->show($ticket)), 200, ['Content-Type' => 'image/png']);
    }

    public function postCreate(Request $request)
    {
        $wechatId = $request->get('wechat_id');
        $title = $request->get('title');
        $messageType = $request->get('message_type');
        $message = $src = $request->get('message');

        if (\App\Models\Qrcode\Qrcode::where(['team_id' => $request->user()->team_id, 'title' => $title])->first()) {
            return $this->responseJsonError('标题已存在', 403);
        }

        $type = strtoupper($request->get('type', \App\Models\Qrcode\Qrcode::TYPE_FOREVER));
        $sceneId = $this->genSceneId();
        $wechat = Wechat::where(['team_id' => $request->user()->team_id, 'id' => $wechatId])->first();

        if ($messageType === \App\Models\Qrcode\Qrcode::MESSAGE_TYPE_IMAGE) {
            $media = new Media($wechat->getAccessToken());
            $file = storage_path(new ObjectID() . '.jpg');
            file_put_contents($file, file_get_contents($message));
            $image = $media->forever()->image($file);
            $message = $image['media_id'];
            @unlink($file);
        }

        $qrcodeModel =  \App\Models\Qrcode\Qrcode::create([
            'title' => $title,
            'type' => $type,
            'team_id' => $request->user()->team_id,
            'scene_id' => $sceneId,
            'message_type' => $messageType,
            'message' => $message,
            'wechat_id' => $wechatId,
            'src' => $src,
            'scans' => 0,
            'subscribes' => 0
        ]);

        if (!$wechat) {
            return $this->responseJsonError('公众号不存在', 403);
        }

        $qrcode = New \Gibson\Wechat\QRCode($wechat->getAccessToken());
        if ($type === \App\Models\Qrcode\Qrcode::TYPE_FOREVER) {
            $result = $qrcode->forever($sceneId);
        } else {
            $result = $qrcode->temporary($sceneId, 2592000);
        }

        $con = file_get_contents($qrcode->show($result->ticket));
        $url = Qiniu::upload($con, 'jpg');
        $qrcodeModel->url = $url;
        $qrcodeModel->ticket = $result->ticket;
        $qrcodeModel->save();

        return $this->responseJson(['data' => $url]);
    }

    public function postEdit(Request $request, $id)
    {
        $team = $request->user()->team;
        $qrcode = \App\Models\Qrcode\Qrcode::where('team_id', intval($team->id))->where('_id', $id)->first();
        $req = $request->only('title', 'message_type', 'message');

        if (!$qrcode) {
            return $this->responseJsonError('二维码不存在', 403);
        }

        if ($req['message_type'] === \App\Models\Qrcode\Qrcode::MESSAGE_TYPE_IMAGE && $req['message'] !== $qrcode->message) {
            $wechat = Wechat::find($qrcode->wechat_id);
            $media = new Media($wechat->getAccessToken());
            $file = storage_path(new ObjectID() . '.jpg');
            file_put_contents($file, file_get_contents($req['message']));
            $image = $media->forever()->image($file);
            @unlink($file);
            $req['src'] = $req['message'];
            $req['message'] = $image['media_id'];
        }

        $qrcode->fill($req);
        $qrcode->save();

        return $this->responseJson('修改成功', 403);
    }

    public function getDelete(Request $request, $id)
    {
        $qrcode = \App\Models\Qrcode\Qrcode::where('team_id', intval($request->user()->team_id))
            ->where('_id', $id)
            ->first();

        if (!$qrcode) {
            return $this->responseJsonError('二维码不存在', 403);
        }

        $qrcode->delete();

        return $this->responseJson('删除成功');
    }

    public function genSceneId()
    {
        $sceneId  = mt_rand(111111, 999999);
        if (\App\Models\Qrcode\Qrcode::where('scene_id', $sceneId)->first()) {
            $this->genSceneId();
        }

        return $sceneId;
    }

}
