<?php

namespace App\Http\Controllers\V2;

use DB;
use App\Models\SystemMedia;
use Carbon\Carbon;
use App\Models\Media;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SystemController extends Controller
{
    /**
     * 获取系统模板
     * @param Request $request
     * @return mixed
     */
    public function getSms(Request $request)
    {
        // 标记当前团队已经使用的系统模板
        $medias = Media::where('team_id', $request->user()->team_id)
            ->where('system_media_id', '<>', 0)
            ->lists('system_media_id')
            ->toArray();

        $handle = SystemMedia::where(['type' => Media::TYPE_SMS]);

        return $this->listToPage($handle, function ($items) use ($medias) {
            foreach ($items as $item) {
                $item->used = in_array($item->id, $medias) ? true : false;
            }
        });
    }

    /**
     * 添加系统模板
     * TODO:: 约定一个系统级用户 只允许该用户添加
     * @param Request $request
     * @return mixed
     */
    public function postSms(Request $request)
    {
        $data = $request->only('title', 'content');

        $data['content'] = '【#company#】' . $data['content'];

        $media = DB::table('system_media')->insert([
            'title' => $data['title'],
            'type' => Media::TYPE_SMS,
            'content' => $data['content'],
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now()
        ]);

        return $this->responseJson($media);
    }

}
