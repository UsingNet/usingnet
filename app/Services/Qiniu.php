<?php

namespace App\Services;

use Redis;
use Illuminate\Support\Facades\Storage;

class Qiniu
{
    const REDIS_PREFIX = 'usingnet:async:uploads';

    public static function upload($content, $ext = 'jpg')
    {
        $filename = md5(mt_rand(1111111, 9999999) . microtime(true)) . '.' . $ext;
        $disk = Storage::disk('qiniu');
        if ($disk->put($filename, $content)) {
            return str_replace('http', 'https', $disk->downloadUrl($filename));
        }

        return false;
    }
}