<?php

namespace App\Http\Controllers\Api\Account;

use App\Models\Admin;
use App\Models\Attachment;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use MongoDB\BSON\ObjectID;

/**
 * 用户证书图片
 * 只允许所有者和管理员查看
 * Class CertificateController
 * @package App\Http\Controllers\Api
 */
class CertificateController extends Controller
{
    public function getIndex(Request $request, $id)
    {
        $attachment = Attachment::where('_id', $id)->where('team_id', $request->user()->team_id)->first();
        if (!$attachment) {
            return $this->responseJsonError('附件不存在', 404);
        }

        $grid = \DB::connection('mongodb')->table('fs.chunks')->where(['files_id' => new ObjectID($attachment->src)])->first();

        if (!$grid) {
            abort(404);
        }

        return response($grid['data']->getData(), 200, ['Content-Type' => 'image/png']);
    }
}
