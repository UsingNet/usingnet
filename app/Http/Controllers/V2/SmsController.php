<?php

namespace App\Http\Controllers\V2;

use App\Models\Contact;
use App\Models\Evaluation;
use App\Models\Media;
use App\Models\Order;
use App\Models\Setting\Sms;
use App\Models\Sms\Record;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Validator;

class SmsController extends Controller
{
    public function postSend(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return redirect(\Config::get('auth.login'));
        }

        $params = $request->only('media_id', 'contact_ids');
        $validator = Validator::make($params, [
            'media_id' => 'required|exists:media,id',
            'contact_ids' => 'required:array'
        ], [
            'media.required' => '请选择模板',
            'media.exists' => '模板不存在',
            'contact_ids.required' => '请选择联系人',
            'contact_ids.array' => '请选择联系人',
        ]);

        if ($validator->fails()) {
            $messages = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $messages), 403);
        }

        $template = Media::find($params['media_id']);
        $contacts = Contact::where('team_id', $user->team_id)
            ->whereIn('id', $params['contact_ids'])
            ->get();

        $num = 0;
        foreach ($contacts as $contact) {
            $content = sprintf('【%s】%s', $user->team->sms->signature, replace_variable($template->content, $contact));
            $len = mb_strlen($content);
            $num += max(ceil($len / 70), 1);
        }

        $costs = env('PRICE_SMS') * $num;
        if ($costs > $user->team->balance) {
            return $this->responseJsonError('您的账户余额不足', 403);
        }

        foreach ($contacts as $contact) {
            $content = sprintf('【%s】%s', $user->team->sms->signature, replace_variable($template->content, $contact));
            $method = 'send' . ucfirst($template->remark);
            $messageId = Sms::$method($contact->phone, $content);
            Record::create([
                'phone' => $contact->phone,
                'contact_id' => $contact->id,
                'msg' => $content,
                'team_id' => $contact->team_id,
                'message_id' => $messageId
            ]);
        }

        $user->team->trade(-$costs);

        return $this->responseJson('ok');
    }

    public function getSend(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return redirect(\Config::get('auth.login'));
        }

        $contacts = Contact::orderBy('id', 'desc')
            ->where('team_id', $user->team_id)
            ->where('phone', '<>', '')
            ->paginate(20);

        $templates = Media::where('type', Media::TYPE_SMS)
            ->where('status', Media::STATUS_SUCCESS)
            ->where('team_id', $user->team_id)
            ->get();

        return view('sms.send', compact('contacts', 'templates'));
    }

    public function getCheck(Request $request)
    {
        $key = SMS::REDIS_PREFIX . $request->get('key');
        $redis = Redis::connection();
        if (!$redis->get($key)) {
            //return view('errors.error', ['title' => '页面已过期']);
        }

        $medias = Media::where('type', Media::TYPE_SMS)
            ->where('status', Media::STATUS_CHECKING)
            ->get();

        foreach ($medias as $media) {
            $media->content = preg_replace('/#(.*?)#/', '{$var}', $media->content);
        }

        return view('sms.index', compact('medias'));
    }

    public function postCheck(Request $request)
    {
        $params = $request->only('action', 'id', 'fail_message', 'remark');
        $media = Media::find($params['id']);
        if (!$media) {
            return $this->responseJsonError('模板不存在', 403);
        }

        $params['status'] = Media::STATUS_SUCCESS;//$params['action'] === 'reject' ? Media::STATUS_FAIL : Media::STATUS_SUCCESS;

        if ($params['remark'] == 'market') {
            if (!preg_match('/回复TD退订/', $media->content)) {
                $params['content'] = $media->content . ' 回复TD退订';
            }
        }

        $media->fill($params);
        $media->save();

        return $this->responseJson('修改成功');
    }

    /**
     *　短信状态报告
     * @param Request $request
     */
    public function getCallback(Request $request)
    {
        $params = $request->only('receiver', 'pswd', 'msgid', 'mobile', 'msg');
        if ($params['receiver'] == env('SMS_ACCOUNT') && $params['pswd'] == env('SMS_PASSWORD')) {
            // 短信状态通知
            if (isset($params['msgid'])) {
                $record = Record::where('message_id', $params['msgid'])->first();
                if ($record) {
                    $status = $request->get('status');
                    $record->update(['status' => $status]);
                }
            }

            // 评价
            if (isset($params['msg'])) {
                $evaluations = [
                    '1' => Evaluation::LEVEL_GOOD,
                    '2' => Evaluation::LEVEL_GENERAL,
                    '3' => Evaluation::LEVEL_BAD
                ];
                if (isset($evaluations[$params['msg']])) {
                    $redis = Redis::connection();
                    if ($orderId = $redis->get(Evaluation::REDIS_PREFIX . $params['mobile'])) {
                        $order = Order::find($orderId);
                        if ($order) {
                            $evaluation = Evaluation::firstOrCreate(['order_id' => $order->id, 'team_id' => $order->team_id]);
                            $data['content_name']  = $order->contact->name;
                            $data['user_name']  = $order->user->name;
                            $data['user_id']  = $order->user_id;
                            $data['contact_id']  = $order->contact_id;
                            $data['level'] = $evaluations[$params['msg']];
                            $evaluation->fill($data);
                            $evaluation->save();
                        }
                    }
                }
            }
        }
    }
}
