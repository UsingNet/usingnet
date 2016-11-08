<?php

namespace App\Http\Controllers\Api\Appstore;

use App\Library\GenQrcode;
use App\Models\Appstore\Photo;
use App\Models\Appstore\PhotoAlbum;
use App\Models\Appstore\PhotoConfig;
use App\Models\PluginContact;
use App\Models\Setting\Web;
use App\Models\Setting\Wechat;
use App\Models\Team;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Config;

class PhotoController extends Controller
{
    private $key = 'appstore_photo_';

    public function getIndex(Request $request, $appId = null)
    {
        if (!$appId) abort(404);
        $key = $this->key . $appId;

        $photoConfig = PhotoConfig::where('app_id', $appId)->firstOrFail();
        $team = Team::where('id', $photoConfig->team_id)->firstOrFail();
        $config = Config::get('plugin.photo');
        $wechat = Wechat::where('app_id', $appId)->first();

        $params = [
            'nonce' => rand(11111, 55555),
            'app_id' => $appId,
            'token' => $team->token,
            'key' => $config['key'],
            'timestamp' => time(),
            'url' => $request->fullUrl()
        ];

        if (!$request->session()->get($key)) {
            $openid = plugin_login($params);
            $contact = PluginContact::where('openid', $openid)->firstOrFail();
            $request->session()->put($key, $contact->_id);
            return redirect('/' . $request->path());
        }

        $contactId = $request->session()->get($key);
        $albums = PhotoAlbum::where('contact_id', $contactId)->orderBy('_id', 'desc')->with('photo')->get();

        $params['nonce'] = rand(11111, 55555);
        $jsConfig = request_plugin('GET', 'wechatjsticket', $params);
        if (isset($jsConfig['data'])) {
            $jsConfig = $jsConfig['data'];
        }

        return view('appstore.photo.albums', compact('albums', 'appId', 'jsConfig', 'wechat'));
    }

    public function getAdmin(Request $request)
    {
        if (!$request->user()) {
            abort(404);
        }

        $albums = PhotoConfig::where('team_id', $request->user()->team_id)->with('wechat')->get();

        foreach ($albums as $album) {
            $album->nums = PhotoAlbum::where('app_id', $album->app_id)->count();
        }

        $wechats = Wechat::where('team_id', $request->user()->team_id)->get();

        return view('appstore.photo.admin', compact('albums', 'wechats'));
    }

    public function postUpload(Request $request, $appId = null)
    {
        if (!$appId) abort(404);
        $req = $request->only('media_id', 'local_id');
        $contact = PluginContact::where('_id', $request->session()->get($this->key . $appId))->first();
        $team = Team::where('id', $contact->team_id)->first();

        $url = $request->fullUrl();
        $params = [
            'nonce' => rand(11111, 55555),
            'app_id' => $appId,
            'token' => $team->token,
            'key' => 'profile',
            'timestamp' => time(),
            'url' => $url,
            'local_id' => $req['local_id'],
            'media_id' => $req['media_id']
        ];

        $resp = request_plugin('GET', 'download', $params);
        $img = '';
        if (isset($resp['data'])) {
            $img = $resp['data'];
        }

        return $this->responseJson(['data' => $img]);
    }

    public function getAdminshow(Request $request, $id)
    {
        $albums = PhotoAlbum::where('app_id', $id)->with('contact')->paginate(20);

        return view('appstore.photo.admin_show', compact('albums'));
    }

    public function postAdmin(Request $request)
    {
        $req = $request->only('app_id');
        $req['team_id'] = $request->user()->team_id;

        $photoConfig = PhotoConfig::firstOrCreate($req);

        if (!$photoConfig->qrcode) {
            $url = 'https://wx.usingnet.com/appstore/photo/' . $req['app_id'];
            $qrcode = GenQrcode::gen($url);
            $photoConfig->update(['qrcode' => $qrcode]);
        }

        return $this->responseJson($photoConfig);
    }

    public function postCreate(Request $request)
    {
        $req = $request->only('app_id', 'name', 'music', 'id');
        $contactId = $request->session()->get($this->key . $req['app_id']);
        $contact = PluginContact::where('_id', $contactId)->first();
        if (!$contact) {
            return $this->responseJsonError('登录超时，请从新登录', 403);
        }

        $req['contact_id'] = $contactId;
        if ($req['id']) {
            $album = PhotoAlbum::where('_id', $req['id'])->first();
            $album->fill($req);
            $album->save();
        }  else {
            $album = PhotoAlbum::create($req);
        }

        if (!$album->qrcode) {
            $url = 'https://wx.usingnet.com/appstore/photo/'  . $album->_id;
            $qrcode = GenQrcode::gen($url);
            $album->update(['qrcode' => $qrcode]);
        }

        $photos = Photo::where('album_id', $album->_id)->get();
        $album->photos =$photos;

        return $this->responseJson($album);
    }

    public function deleteAlbum(Request $request, $appId = null)
    {
        if (!$appId) abort(404);
        $id = $request->get('id');
        $contactId = $request->session()->get($this->key . $appId);
        PhotoAlbum::where('contact_id', $contactId)->where('_id', $id)->delete();
        return $this->responseJson('ok');
    }

    /**
     * 添加照片
     * @param Request $request
     */
    public function postPhoto(Request $request, $appId = null)
    {
        if (!$appId) abort(404);
        $contactId = $request->session()->get($this->key . $appId);
        if (!$contactId) abort(404);

        $req = $request->only('album_id', 'img');
        $req['contact_id'] = $contactId;
        $photo = Photo::firstOrCreate($req);
        return $this->responseJson($photo);
    }

    public function getAlbum(Request $request, $id = null)
    {
        if (!$id) abort(404);
        $album = PhotoAlbum::where('_id', $id)->first();
        if (!$album) abort(404);

        return $this->responseJson($album);
    }

    /**
     * 保存样式
     */
    public function postStyle(Request $request, $appId = null)
    {
        if (!$appId) abort(404);
        $contactId = $request->session()->get($this->key . $appId);
        if (!$contactId) abort(404);

        $req = $request->only('album_id', 'styles');
        $styles = json_decode($req['styles'], true);

        $photos = Photo::where('album_id', $req['album_id'])
            ->where('contact_id', $contactId)
            ->get();

        $photoIds = array_fetch($styles, 'id');
        foreach ($photos as $photo) {
            if (!in_array($photo->_id, $photoIds)) {
                $photo->delete();
            }
            foreach ($styles as $style) {
                if (isset($style['id']) && $style['id'] == $photo->_id) {
                    $photo->update(['style' => $style]);
                }
            }
        }

        return $this->responseJson('ok');
    }

    /**
     * 删除照片
     * @param Request $request
     * @param $appId
     */
    public function deletePhoto(Request $request, $appId = null)
    {
        if (!$appId) abort(404);
        $id = $request->get('id');
        $contactId = $request->session()->get($this->key . $appId);
        $photo = Photo::where(['contact_id' => $contactId, '_id' => $id])->first();
        return $this->responseJson($photo->delete());
    }

    public function getShow(Request $request, $id = null)
    {
        if (!$id) abort(404);
        $album = PhotoAlbum::where('_id', $id)->first();
        if (!$album) abort(404);

        $wechat = Wechat::where('app_id', $album->app_id)->first();
        if (!$wechat) {
            $wechat = Web::where('team_id', 1)->first();
        }

        $photos = Photo::where('album_id', $id)->get();

        $contactId = $request->session()->get($this->key . $album->app_id);

        return view('appstore.photo.show', compact('album', 'wechat', 'photos', 'contactId'));
    }
}