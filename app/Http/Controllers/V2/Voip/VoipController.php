<?php

namespace App\Http\Controllers\V2\Voip;

use App\Models\Message;
use Validator;
use App\Services\Voip;
use App\Models\Token;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class VoipController extends Controller
{
    private $voip;

    public function __construct(Voip $voip)
    {
        $this->voip = $voip;
    }

    /**
     * 前端获取 Token
     * @param $request
     * @return json
     */
    public function getToken(Request $request)
    {
        $user = $request->user();
        if (!$user->team->voip) {
            return $this->responseJsonError('未开通 Voip 电话', 404);
        }

        if (!$user->voip) {
            $user->createVoipAccount();
        }

        // 生成token
        //Token::where('user_id', $user->id)->delete();
        $token = Token::create(['user_id' => $user->id, 'token' => md5($user->id . microtime(true))]);
        $appId = \Config::get('voip.app_id');
        $date = date('YmdHis');
        $appToken = \Config::get('voip.app_token');
        $username = $request->user()->voip->voip_id;
        $sig = md5($appId  . $username . $date . $appToken);

        $res = [
            'data' => $token->token,
            'date' => $date,
            'sig' => $sig,
            'username' => $username
        ];

        return $this->responseJson($res);
    }

    /**
     * 坐席上班
     * @param Request $request
     * @return mixed
     */
    public function getAgentonwork(Request $request)
    {
        $user = $request->user();
        $response = $this->voip->agentOnwork($user->voip->voip_id, $user->id, $user->id);

        if ($response['statusCode'] == 000000) {
            return $this->responseJson(true);
        }

        return $this->responseJsonError($response['statusMsg'], $response['statusCode']);
    }

    /**
     * 坐席准备继续
     * @return bool
     */
    public function getAgentready(Request $request, $id = null)
    {
        $response = $this->voip->agentReady($request->user()->id);

        if ($response['statusCode'] == 000000) {
            return $this->responseJson(true);
        }

        return $this->responseJsonError($response['statusMsg'], $response['statusCode']);
    }

    /**
     * 座席下班
     * @param Request $request
     * @return json
     */
    public function getAgentoffwork(Request $request)
    {
        $user = $request->user();
        $response = $this->voip->agentOffwork($user->id);

        if ($response['statusCode'] == 000000) {
            return $this->responseJson($response);
        }

        return $this->responseJsonError($response['statusMsg'], $response['statusCode']);
    }

    /**
     * 座席状态
     * @param Request $request
     * @return mixed
     */
    public function getAgentstate(Request $request)
    {
        $state = $this->voip->getAgentState($request->user()->id);

        if ($state['statusCode'] == 000000) {
            $agents = $state['agents']['agent'];

            if (isset($agents['id'])) {
                $agent = $agents;
            }  else {
                foreach ($agents as $agent) {
                    if ($agent['id'] == $request->user()->id) {
                        break;
                    }
                }
            }

            return $this->responseJson($agent);
        }

        return $this->responseJsonError('未找到客服状态', 404);
    }

    /**
     * 挂断电话
     */
    public function postShift(Request $request)
    {
        $data = $request->only('agentid', 'callid');
        $validator = Validator::make($data, [
            'agentid' => 'required|exists:user,id',
            'callid' => 'required'
        ], [
            'agentid.required' => '缺少 agentid',
            'agentid.exists' => '坐席不存在',
            'callid.required' => '缺少 callid'
        ]);

        $message = Message::where('package.callid', $data['callid'])->first();
        if (!$message) {
            return $this->responseJsonError('通话不存在', 403);
        }

        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return $this->responseJsonError(implode(' ', $errors), 403);
        }

        $this->voip->shift($data['callid'], $data['agentid']);

        return $this->responseJson('ok');
    }

    /**
     * 阵列状态
     * @return mixed
     */
    public function getQueueinfo()
    {
        $info =  $this->voip->getQueueinfo();

        return $info;
    }

    /**
     * 删除阵列
     * @param Request $request
     * @return mixed
     */
    public function getDelqueue(Request $request)
    {
        return $this->voip->delQueue($request->get('type'));
    }
}