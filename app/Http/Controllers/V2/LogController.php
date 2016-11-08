<?php
/**
 * 记录前端 log
 */

namespace App\Http\Controllers\V2;

use App\Models\Developer\Error;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;

class LogController extends Controller
{
    /**
     * 添加 log
     * @param Request $request
     * @return mixed
     */
    public function anyIndex(Request $request)
    {
        $data = $request->only('message', 'script', 'line', 'column', 'object', 'count');
        $data['ip'] = get_ip();

        $validator = Validator::make($data, [
            'message' => 'required',
            'script' => 'required',
            'line' => 'required',
            'column' => 'required',
        ], [
            'message.required' => '消息不能为空',
            'script.required' => '文件不能为空',
            'line.required' => '行号不能为空',
            'column.required' => '列号不能为空'
        ]);

        $data['count'] = $data['count'] ? $data['count'] : 0;

        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        //Syslog::logger('ERROR')->addCritical('FRONT_END_ERROR', $data);
        Error::create([
            'type' => Error::TYPE_FRONTEND,
            'message' => $data['message'],
            'status' => Error::STATUS_INIT,
            'content' => implode("\n", $data)
        ]);

        return $this->responseJson('ok');
    }
}