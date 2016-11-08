<?php

namespace App\Http\Controllers\Api\Setting;

use Config;
use Carbon;
use App\Models\Plan;
use App\Models\TeamPlan;
use App\Models\Setting\AutoReply;
use App\Models\Setting\Mail;
use App\Models\Setting\Phrase;
use App\Models\Setting\QuickReply;
use App\Models\Setting\Sms;
use App\Models\Setting\Voip;
use App\Models\User;
use Validator;
use App\Models\Team;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class BaseController extends Controller
{
    /**
     * 设置信息
     * @return \Illuminate\Http\Response
     */
    public function getBase(Request $request)
    {
        $user = $request->user();
        $team = $user->team;
        $setting['name'] = $team->name;
        $setting['token'] = $team->token;
        $setting['plan'] = array_only($team->plan->toArray(), ['id', 'name', 'agent_num', 'slug', 'end_at']);
        $setting['plan']['max_setting_web'] = $setting['plan']['slug'] == 'flagship' ? env('MAX_SETTING_WEB') : 1;

        $setting['expiration'] = floor((strtotime($team->plan->end_at) - time()) / 3600 / 24) + 5;

        $setting['functions'] = $this->getFunctons($request);
        $setting['weibo'] = ['appkey' => Config::get('weibo.appkey')];
        $setting['price'] = [
            'voip' => floatval(env('PRICE_VOIP')),
            'sms' => floatval(env('PRICE_SMS'))
        ];
        if ($request->user()->role !== User::ROLE_MEMBER) {
            $setting['balance'] = $request->user()->team->balance;
        }
        $onlineAgents = agent_online($team->id);
        $filtered = array_filter($onlineAgents, function($agent) use ($user) {
            return $agent['id'] != $user->id;
        });
        $setting['online'] = count($filtered);

        return $this->responseJson(['data' => $setting]);
    }

    /**
     * 功能限制
     * @param $request
     */
    public function getFunction(Request $request)
    {
        $team = $request->user()->team;
        $allows = explode("\r\n", $request->user()->team->plan->plan->allows);

        $voip = $team->voip->status === Voip::STATUS_SUCCESS;
        $mail = $team->mail->status === Mail::STATUS_SUCCESS;
        $sms = $team->sms->status === Sms::STATUS_SUCCESS;
        $voipErrors = [];
        $smsErrors = [];
        $mailErrors = [];

        if (!in_array('voip', $allows)) {
            array_push($voipErrors, 'PLAN');
        }

        if (!in_array('mail', $allows)) {
            array_push($mailErrors, 'PLAN');
        }

        if (!in_array('sms', $allows)) {
            array_push($smsErrors, 'PLAN');
        }


        if ($team->voip->status !== Voip::STATUS_SUCCESS) {
            array_push($voipErrors, $team->voip->status);
        }
        if ($team->sms->status !== \App\Models\Setting\Sms::STATUS_SUCCESS) {
            array_push($smsErrors, $team->sms->status);
        }
        if ($team->mail->status !== Mail::STATUS_SUCCESS) {
            array_push($mailErrors, $team->mail->status);
        }

        $customerInfo = in_array('customerInfo', $allows);
        $functions['chat'] = [
            'voip' => ['status' => $voip, 'need' => $voipErrors],
            'im' => ['status' => true, 'need' => []],
            'wechat' => ['status' => true, 'need' => []],
            'mail' => ['status' => $mail, 'need' => $mailErrors],
            'sms' => ['status' => $sms, 'need' => $smsErrors],
            'customerInfo' => ['status' => $customerInfo, 'need' => !$customerInfo ? ['PLAN'] : []]
        ];

        $functions['setting'] = ['status' => true, 'need' => []];
        $functions['account'] = ['status' => true, 'need' => []];

        $others = ['task', 'media', 'stats', 'contact'];
        foreach ($others as $other) {
            $status = in_array($other, $allows);
            $need = $status ? [] : ['PLAN'];
            $functions[$other] = ['status' => $status, 'need' => $need];
        }

        return $this->responseJson($functions);
    }


    public function getFunctons($request)
    {
        $team = $request->user()->team;
        $allows = explode("\r\n", $request->user()->team->plan->plan->allows);

        $voip = $team->voip->status === Voip::STATUS_SUCCESS;
        $mail = $team->mail->status === Mail::STATUS_SUCCESS;
        $sms = $team->sms->status === Sms::STATUS_SUCCESS;
        $voipErrors = [];
        $smsErrors = [];
        $mailErrors = [];

        if (!in_array('voip', $allows)) {
            array_push($voipErrors, 'PLAN');
        }

        if (!in_array('mail', $allows)) {
            array_push($mailErrors, 'PLAN');
        }

        if (!in_array('sms', $allows)) {
            array_push($smsErrors, 'PLAN');
        }

        if ($team->voip->status !== Voip::STATUS_SUCCESS) {
            array_push($voipErrors, $team->voip->status);
        }
        if ($team->sms->status !== \App\Models\Setting\Sms::STATUS_SUCCESS) {
            array_push($smsErrors, $team->sms->status);
        }
        if ($team->mail->status !== Mail::STATUS_SUCCESS) {
            array_push($mailErrors, $team->mail->status);
        }

        $customerInfo = in_array('customerInfo', $allows);
        $functions['chat'] = [
            'voip' => ['status' => $voip, 'need' => $voipErrors],
            'im' => ['status' => true, 'need' => []],
            'wechat' => ['status' => true, 'need' => []],
            'mail' => ['status' => $mail, 'need' => $mailErrors],
            'sms' => ['status' => $sms, 'need' => $smsErrors],
            'customerInfo' => ['status' => $customerInfo, 'need' => !$customerInfo ? ['PLAN'] : []]
        ];

        $functions['setting'] = ['status' => true, 'need' => []];
        $functions['account'] = ['status' => true, 'need' => []];

        $others = ['task', 'media', 'stats', 'contact'];
        foreach ($others as $other) {
            $status = in_array($other, $allows);
            $need = $status ? [] : ['PLAN'];
            $functions[$other] = ['status' => $status, 'need' => $need];
        }

        return $functions;
    }

}
