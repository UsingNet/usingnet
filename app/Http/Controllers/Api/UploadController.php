<?php

namespace App\Http\Controllers\Api;

use App\Models\Attachment;
use App\Services\Qiniu;
use Config;
use Redis;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;

class UploadController extends Controller
{

    public function getIndex(Request $request)
    {
    }

    public function postIndex(Request $request)
    {
        if (!$this->uploadLimit()) {
            return $this->responseJsonError('您上传的太频繁了，请休息一会', 403);
        }

        $data = $request->only('file', 'type', 'format');
        $data['format'] = strtolower($data['format']);

        if (stripos($data['file'], 'base64') !== false) {
            $extension = 'gif';
            if (preg_match('/image\/(\w+);/', $data['file'], $match)) {
                $extension = $match[1];
            }
            $content = base64_decode(substr(strstr($data['file'], ','), 1));
        } else {
            $validator = $this->validator($data);
            if ($validator->fails()) {
                $errors = $validator->messages()->all();
                return $this->responseJsonError(implode(' ', $errors), 403);
            }

            $file = $request->file('file');
            $extension = $file->getClientOriginalExtension();
            $path = $file->getRealPath();
            $content = file_get_contents($path);
        }

        if ($url = Qiniu::upload($content, $extension)) {
            Attachment::create([
                'team_id' => $request->user() ? $request->user()->team_id : 0,
                'user_id' => $request->user() ? $request->user()->id : 0,
                'src' => $url,
                'ip' => get_ip(),
                'format' => Attachment::FORMAT_MESSAGE
            ]);
            $data = [
                'success' => true,
                'code' => 200,
                'data' => $url
            ];
            // 兼容低版本浏览器直接输出 json 字符串
            echo json_encode($data);
            exit;
        }

        return $this->responseJsonError('上传失败', 403);
    }

    public function validator($data)
    {
        $messages = [
            'file.required' => '文件不能为空',
            'file.max' => '文件不能大于 10M',
            'file.mimes' => '只允许上传 jpeg,bmp,png,gif 格式图片',
            'format.required' => '所属格式不能为空',
            'format.in' => '类型不通过'
        ];

        if (isset($data['type']) && strtoupper($data['type']) == 'VOICE') {
            $messages['file.mimes'] = '语音只支持 wav 格式音频';
        }

        return Validator::make($data, [
            'file' => 'required|max:10240|mimes:jpeg,bmp,png,gif,wav,zip,gz',
        ], $messages);
    }

    /**
     * 上传证书
     * 证书作为敏感信息，保存在 mongdb 并设置访问限制
     */
    public function postCertificate(Request $request)
    {
        if (!$this->uploadLimit()) {
            return $this->responseJsonError('您上传的太频繁了，请休息一会', 403);
        }

        $data = $request->only('file');
        $data['format'] = Attachment::FORMAT_CERTIFICATE;
        $validator = $this->validator($data);
        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        if ($file = $request->file('file')) {
            $grid = \DB::connection('mongodb');
            $fileId = $grid->table('fs.files')->insertGetId([
                'filename' => $file->getRealPath(),
                'length' => $file->getSize(),
                'chunkSize' => $file->getSize()
            ]);

            $data = file_get_contents($file->getRealPath());
            $data = new \MongoDB\BSON\Binary($data, \MongoDB\BSON\Binary::TYPE_GENERIC);
            $grid->table('fs.chunks')->insert([
                'files_id' => $fileId,
                'data' => $data
            ]);

            $attachment = Attachment::create([
                'team_id' => $request->user()->team_id,
                'user_id' => $request->user()->id,
                'format' => Attachment::FORMAT_CERTIFICATE,
                'src' => strval($fileId),
                'ip' => get_ip()
            ]);

            $src = asset('api/account/certificate/' . $attachment->_id);
            $src = str_replace('http:', '', $src);

            return $this->responseJson(['data' => $src]);
        }

        return $this->responseJsonError('请选择上传的文件', 404);
    }

    /**
     * 限制上传频率
     * 1 分钟限制上传 10 次
     * @return bool
     */
    private function uploadLimit()
    {
        // 限制上传频率
        $redis = Redis::connection();
        $ip = $_SERVER['REMOTE_ADDR'];
        $time = $redis->lindex($ip, -1);
        $len = $redis->llen($ip);
        if ($len >= 10 && $time > time() - 60) {
            return false;
        }
        $redis->lpush($ip, time());
        $redis->ltrim($ip, 0, 9);

        return true;
    }

    public function getAttachment()
    {
        return $this->listToPage(new Attachment());
    }
}
