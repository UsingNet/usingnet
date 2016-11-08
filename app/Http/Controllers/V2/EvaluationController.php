<?php

namespace App\Http\Controllers\V2;

use App\Models\Message;
use App\Models\Stats;
use Carbon;
use App\Models\Order;
use App\Models\Evaluation;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;

class EvaluationController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth', ['except' => 'store']);
    }

    /**
     * 评价列表
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $handler = Evaluation::where('team_id', $request->user()->team_id);
        if ($userId = $request->get('user_id')) {
            $handler = Evaluation::where('user_id', $userId);
        }

        $begin = $request->get('begin');
        $end = $request->get('end');
        if ($begin && $end) {
            $begin= Carbon::createFromTimestamp(strtotime($begin))->startOfDay();
            $end = Carbon::createFromTimestamp(strtotime($end))->endOfDay();
            $handler->where('created_at', '>', $begin)
                ->where('created_at', '<', $end);
        }

        return $this->listToPage($handler, function ($lists) {
            foreach ($lists as $item) {
                $item->level_text = $item->levelToText();
            }
        });
    }

    /**
     * 客服评价
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $data = $request->only('order_id', 'level', 'content');
        $validator = Validator::make($data, [
            'order_id' => 'required|numeric',
            'level' => 'required|in:' . implode(',', [Evaluation::LEVEL_BAD, Evaluation::LEVEL_GENERAL, Evaluation::LEVEL_GOOD]),
        ], [
            'order_id.required' => '请在对话开始后进行评价',
            'level.required' => '评论不能为空',
            'level.in' => '评价类型不正确'
        ]);

        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        $order = Order::find($data['order_id']);
        if (!$order) {
            return $this->responseJsonError('对话不存在', 402);
        }

        $existsReplyMessage = Message::where('package.order_id', $order->id)
            ->where('package.agent.id', $order->user_id)
            ->first();
        if (!$existsReplyMessage) {
            return $this->responseJsonError('请在对话开始后进行评价', 403);
        }

        $data['team_id'] = $order->team_id;
        $data['user_id'] = $order->user_id;
        $data['user_name'] = $order->user->name;
        $data['contact_id'] = $order->contact_id;
        $data['contact_name'] = $order->contact->name;

        /*
        Send::system([
            'from' => $order->to,
            'to' => $order->user->token,
            'body' => sprintf('%s 给出了 <span style="color: mediumvioletred">%s</span> <br> %s', $order->contact->name, Evaluation::toText($data['level']), $data['content'])
        ]);
        */

        $evaluation = Evaluation::firstOrCreate(['order_id' => $data['order_id']]);
        $evaluation->fill($data);
        $evaluation->save();

        return $this->responseJson('ok');
    }
}
