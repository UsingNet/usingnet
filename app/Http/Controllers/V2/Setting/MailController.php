<?php

namespace App\Http\Controllers\V2\Setting;

use Validator;
use App\Models\Setting\Mail;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class MailController extends Controller
{
    /**
     * 邮件设置
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $mail = Mail::firstOrCreate(['team_id' => $request->user()->team_id]);

        return $this->responseJson(Mail::find($mail->id));
    }

    /**
     * 保存邮件设置
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $data = $request->only('email', 'password', 'smtp', 'smtp_mode', 'imap', 'imap_mode', 'imap_port', 'smtp_port');
        $data = array_map('trim', $data);
        $mail = Mail::where('team_id', $request->user()->team_id)->first();
        $data['status'] = Mail::STATUS_SUCCESS;

        $validator = Validator::make($data, [
            'email' => 'required|email|unique:setting_mail,email,' . $mail->id,
            'password' => 'required',
            'smtp' => 'required',
            'smtp_port' => 'required',
            'smtp_mode' => 'required|in:' . implode(',', [Mail::MODE_ENCRYPTION, Mail::MODE_EXPRESS]),
            //'imap' => 'required',
           // 'imap_port' => 'required',
           // 'imap_mode' => 'required|in:' . implode(',', [Mail::MODE_ENCRYPTION, Mail::MODE_EXPRESS])
        ], [
            'email.required' => '请填写邮箱',
            'email.unique' => '邮箱已存在',
            'password.required' => '请填写密码',
            'imap.required' => '请填写 imap 地址',
            'smtp.required' => '请填写 smtp 地址',
            'smtp_mode.required' => '请选择 smtp 加密方式',
            'imap_mode.required' => '请选择 imap 加密方式',
            'imap_port' => '请填写 imap 端口',
            'smtp_port' => '请填写 smtp 端口'
        ]);

        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        if (!$this->testSMTP($data['smtp'], $data['email'], $data['password'], $data['smtp_mode'], $data['smtp_port'])) {
            return $this->responseJsonError('SMTP 链接失败', 403);
        }

        if (!empty($data['imap']) && !$this->testIMAP($data['imap'], $data['email'], $data['password'], $data['imap_mode'], $data['imap_port'])) {
            return $this->responseJsonError('IMAP 链接失败', 403);
        }

        $mail->fill($data);
        $mail->save();

        return $this->responseJson($mail);
    }

    public function testIMAP($host, $username, $password, $mode, $port)
    {
        if ($mode === Mail::MODE_EXPRESS) {
            $host = sprintf('{%s:%s}', $host, $port);
        } else {
            $host = sprintf('{%s:%s/imap/ssl}', $host, $port);
        }

        imap_timeout(IMAP_OPENTIMEOUT, 5);
        $mbox = @imap_open($host, $username, $password);
        if (!$mbox) {
            return false;
        }

        return true;
    }

    public function testSMTP($host, $username, $password, $mode, $port)
    {
        $smtp = new \SMTP();
        $smtp->setTimeout(5);
        if ($mode === MAIL::MODE_ENCRYPTION) {
            $host = 'ssl://' . $host;
        }
        $smtp->connect($host, $port, 5);
        $smtp->hello($host);
        return $smtp->authenticate($username, $password);
    }
}
