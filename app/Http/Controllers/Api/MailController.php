<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Evaluation;
use App\Models\Setting\Mail;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;

class MailController extends Controller
{
    public function getIndex()
    {
    }

    public function getEvaluation(Request $request)
    {
        $key = $request->get('key');

        $redis = Redis::connection();
        $orderId = $redis->get(Mail::REDIS_PREFIX . $key);
        $order = Order::find($orderId);
        if (!$order) {
            return view('errors.error', ['title' => '对话不存在', 'desc' => '']);
        }

        return view('mail.evaluation', compact('key'));
    }

    public function postEvaluation(Request $request)
    {
        $key  = Mail::REDIS_PREFIX . $request->get('key');
        $redis = Redis::connection();
        $orderId = $redis->get($key);
        $order = Order::find($orderId);
        $data = $request->all();
        if (!$order) {
            return view('errors.error', ['title' => '邮件不存在', 'desc' => '出了什么问题？　请联系优信客服']);
        }
        $evaluation = Evaluation::firstOrCreate(['order_id' => $orderId, 'team_id' => $order->team_id]);
        $data['content_name']  = $order->contact->name;
        $data['user_name']  = $order->user->name;
        $data['user_id']  = $order->user_id;
        $data['contact_id']  = $order->contact_id;
        $evaluation->fill($data);
        $evaluation->save();

        session()->put('evaluation', $request->get('key'));

        return redirect()->back();
    }
}