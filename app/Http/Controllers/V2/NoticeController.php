<?php

namespace App\Http\Controllers\V2;

use App\Models\Message;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NoticeController extends Controller
{
    public function index(Request $request)
    {
        $handler = Message::where('type', Message::TYPE_SYSTEM)
                ->where('from', Message::TYPE_SYSTEM)
                ->whereIn('to', [$request->user()->token, $request->user()->team->token])
                ->orderBy('_id', 'desc');

        if ($status = $request->get('status')) {
            if ($status === 'UNREAD') {
                $handler->where('package.read', 'exists', false);
            } else {
                $handler->where('package.read', true);
            }
        }

        return $this->listToPage($handler, function ($notices) {
            foreach ($notices as $notice) {
                $notice->created_at = (string) $notice->created_at / 1000;
            }
        });
    }

    public function update(Request $request, $id)
    {
        $message = Message::whereIn('to', [$request->user()->token, $request->user()->team->token])
            ->where('_id', $id)
            ->first();

        if (!$message) {
            return $this->responseJsonError('消息不存在', 404);
        }

        $package = $message['package'];
        $package['read'] = true;
        $message->package = $package;
        $message->save();

        return $this->responseJson($message);
    }
}