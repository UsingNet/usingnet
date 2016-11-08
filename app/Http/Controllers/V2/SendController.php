<?php

namespace App\Http\Controllers\V2;

use App\Models\Sms\Record;
use App\Services\Sms;
use DB;
use App\Models\Setting\Wechat;
use Gibson\Wechat\Notice;
use Validator;
use App\Models\Contact;
use App\Models\Media;
use App\Models\Team;
use App\Services\Mail;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class SendController extends Controller
{

    private $team;

    public function __construct(Request $request)
    {
        $teamId = trim($request->get('team_id'));
        $this->team = Team::where('id', $teamId)->first();
        if (!$this->team) {
            header("content-type:application/json;charset=utf8");
            $resp = [
                'success' => false,
                'msg' => '团队不存在'
            ];
            exit(json_encode($resp));
        }

        verify_signature($request, $this->team->plugin->secret);
    }

    public function postMail(Request $request)
    {
        $data = $request->only('extend_id', 'media_id');
        if (!$this->team->mail->localname || !$this->team->mail->domain) {
            return $this->responseJsonError('未设置邮箱', 403);
        }

        $validator = Validator::make($data, [
            'media_id' => 'required',
            'media_id' => 'exists:media,id,team_id,' . $this->team->id,
        ], [
            'media_id.required' => '缺少 media_id',
            'media_id.exists' => '邮件模板不存在'
        ]);

        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        $contact = Contact::firstOrCreate(['extend_id' => $data['extend_id']], $this->team);
        if (!$contact->email) {
            return $this->responseJsonError('联系人缺少邮箱', 403);
        }

        $media = Media::find($data['media_id']);
        $from = $this->team->mail->localname . '@' . $this->team->mail->domain;
        Mail::send($from, $this->team->name, $contact->email, $contact->name, $media->title, $media->content, true);

        return $this->responseJson('发送成功');
    }

    public function postSms(Request $request)
    {
        $data = $request->only('extend_id', 'msg', 'template_id');
        $contact = Contact::firstOrCreate(['extend_id' => $data['extend_id']], $this->team);
        if (!$contact->phone) {
            return $this->responseJsonError('联系人未设置手机号码', 403);
        }

        if ($this->team->sms->status != \App\Models\Setting\Sms::STATUS_SUCCESS) {
            return $this->responseJsonError('请先开通短信服务', 403);
        }

        if (!preg_match('/'. $this->team->sms->signature .'/', $data['msg'])) {
            return $this->responseJsonError('签名错误', 403);
        }

        $amount = -env('PRICE_SMS');
        if($amount + $this->team->balance < 0 && $amount < 0){
            return $this->responseJsonError('余额不足', 403);
        }

        $record = Record::where('phone', $contact->phone)->first();
        if ($record) {
            $sec = time() - $record->created_at->timestamp;
            if ($sec < 30) {
                return $this->responseJsonError(sprintf('发送太频繁, 请 %s 秒后重试', $sec), 403);
            }
        }

        $method = 'sendNotice';
        if ($data['template_id']) {
            $template = Media::find($data['template_id']);
            if ($template) {
                $method = sprintf('send%s', ucfirst($template->remark));
            }
        }

        try {
            $messageId = Sms::$method($contact->phone, $data['msg']);
        } catch (\Exception $e) {
            return $this->responseJsonError(sprintf('发送失败: %s', $e->getMessage()), 403);
        }

        Record::create([
            'phone' => $contact->phone,
            'contact_id' => $contact->id,
            'msg' => $data['msg'],
            'team_id' => $contact->team_id,
            'message_id' => $messageId
        ]);

        $this->team->trade($amount);
        return $this->responseJson('发送成功');
    }

    public function postWechat(Request $request)
    {
        $data = $request->only('contact_id', 'template_id', 'wechat_id', 'url', 'data');
        $validator = Validator::make($data, [
            'contact_id' => 'required|exists:contact,id,team_id,' . $this->team->id,
            'wechat_id' => 'required|exists:setting_wechat,app_id,team_id,' . $this->team->id,
            'url' => 'required|url',
            'data' => 'required'
        ], [
            'contact_id.required' => '缺少 contact_id',
            'contact.exists' => '联系人不存在',
            'wechat_id.required' => '缺少 wechat_id',
            'wechat_id.exists' => '公众号不存在',
            'url.required' => '缺少 url',
            'url.url' => '请输入正确的 url',
            'data.required' => '缺少 data'
        ]);

        if ($validator->fails()) {
            $errors = $validator->message()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        $contact = Contact::find($data['contact_id']);
        if (!$contact->openid) {
            return $this->responseJsonError('联系人未设置openid', 403);
        }

        $account = Wechat::where('app_id', $data['wechat_id'])->first();
        $notice = new Notice($account->getAccessToken());

        try {
            $notice->send($contact->openid, $data['template_id'], $data['data'], $data['url']);
        } catch (\Exception $e) {
            return $this->responseJsonError($e->getMessage(), 403);
        }

        return $this->responseJson('发送成功');
    }
}
