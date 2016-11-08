<?php
/**
 * 云通讯　SDK
 */

namespace App\Services;

use App\Library\Curl;
use Config;
use Overtrue\Wechat\Utils\XML;

class Voip
{
    private $accountSid;
    private $authToken;
    private $appId;
    private $subAccountSid;
    private $subAccountToken;
    private $voIPAccount;
    private $voIPPassword;
    private $serverIP;
    private $serverPort;
    private $softVersion;
    private $batch;
    private $bodyType = 'xml';
    private $sig;
    private $contentType = 'application/xml';
    private $baseUrl = '';

    const API_CREATE_QUEUE = '/ivr/createqueue';
    const API_MODIFY_QUEUE = '/ivr/modifyqueue';
    const API_DEL_QUEUE = '/ivr/delqueue';
    const API_AGENT_ON_WORK = '/ivr/agentonwork';
    const API_AGENT_OFF_WORK = '/ivr/agentoffwork';
    const API_AGENT_READY = '/ivr/agentready';
    const API_CALL = '/ivr/call';
    const API_UPLOAD_MEDIA = '/Calls/MediaFileUpload';
    const API_CREATE_SUB_ACCOUNT = '/SubAccounts';
    const API_CLOSE_SUB_ACCOUNT = '/CloseSubAccount';
    const API_LANDING_CALL = '/Calls/LandingCalls';
    const API_IVR_DIAL = '/ivr/dial';
    const API_BILL_RECORD = '/BillRecords';
    const API_CALL_CANCEL = '/Calls/CallCancel';
    const API_CALL_RESULT = '/CallResult';
    const API_GET_AGETN_STATE = '/ivr/queryagentstate';
    const API_GET_QUEUE_INFO = '/ivr/queryqueueinfo';

    public function __construct()
    {
        $config = Config::get('voip');
        $this->batch = date("YmdHis");
        $this->serverIP = $config['server_ip'];
        $this->serverPort = $config['server_port'];
        $this->softVersion = $config['soft_version'];
        $this->accountSid = $config['account_sid'];
        $this->authToken = $config['auth_token'];
        $this->appId = $config['app_id'];
        $this->sig = strtoupper(md5($this->accountSid . $this->authToken . $this->batch));
        $this->baseUrl = "https://{$this->serverIP}:{$this->serverPort}/{$this->softVersion}/Accounts/{$this->accountSid}";
    }

    /**
     * 设置主帐号
     *
     * @param $AccountSid 主帐号
     * @param $AccountToken 主帐号Token
     */
    public function setAccount($AccountSid, $AccountToken)
    {
        $this->accountSid = $AccountSid;
        $this->authToken = $AccountToken;
    }

    /**
     * 设置子帐号
     *
     * @param $SubAccountSid 子帐号
     * @param $SubAccountToken 子帐号Token
     * @param $VoIPAccount VoIP帐号
     * @param $VoIPPassword VoIP密码
     */
    public function setSubAccount($SubAccountSid, $SubAccountToken, $VoIPAccount, $VoIPPassword)
    {
        $this->subAccountSid = $SubAccountSid;
        $this->subAccountToken = $SubAccountToken;
        $this->voIPAccount = $VoIPAccount;
        $this->voIPPassword = $VoIPPassword;
    }

    /**
     * 设置应用ID
     *
     * @param $AppId 应用ID
     */
    public function setAppId($AppId)
    {
        $this->appId = $AppId;
    }

    /**
     * 创建阵列
     *
     */
    public function createQueue($params)
    {
        $param = '';
        foreach ($params as $key => $val) {
            if ($val) {
                $param .= sprintf('%s="%s"', $key, $val) . ' ';
            }
        }

        $api = $this->baseUrl . self::API_CREATE_QUEUE;
        $body = <<<EOT
            <?xml version='1.0' encoding='utf-8'?>
            <Request>
                <Appid>{$this->appId}</Appid>
                <CreateQueue $param/>
            </Request>
EOT;
        $response = $this->curl($api, $body);
        $response = $this->decode($response);

        return $response;
    }

    /**
     * 修改阵列
     *
     * @return json
     */
    public function modifyQueue($params)
    {
        $param = '';
        foreach ($params as $key => $val) {
            if ($val) {
                $param .= sprintf('%s="%s"', $key, $val) . ' ';
            }
        }

        $api = $this->baseUrl . self::API_MODIFY_QUEUE;
        $body = <<<EOT
            <?xml version='1.0' encoding='utf-8'?>
            <Request>
                <Appid>{$this->appId}</Appid>
                <ModifyQueue $param/>
            </Request>
EOT;
        $response = $this->curl($api, $body);
        $response = $this->decode($response);

        return $response;
    }


    /**
     * 删除阵列
     *
     * @param $queueType 阵列类型
     * @return bool
     */
    public function delQueue($queueType)
    {

        $api = $this->baseUrl . self::API_DEL_QUEUE;
        $body = <<<EOT
            <?xml version='1.0' encoding='utf-8'?>
            <Request>
                <Appid>{$this->appId}</Appid>
                <DelQueue queuetype="{$queueType}"/>
            </Request>
EOT;
        $response = $this->curl($api, $body);
        $response = $this->decode($response);

        return $response;
    }

    /**
     * 坐席上班
     *
     * @param $number 坐席号码

     * @param $agentid 坐席　id
     * @return bool
     */
    public function agentOnwork($number, $agentid, $type)
    {
        $api = $this->baseUrl . self::API_AGENT_ON_WORK;
        $body = <<<EOT
            <?xml version='1.0' encoding='utf-8'?>
            <Request>
            <Appid>{$this->appId}</Appid>
            <AgentOnWork  number="{$number}" agentid="{$agentid}" agenttype="{$type}"/>
            </Request>
EOT;
        $response = $this->curl($api, $body);
        $response = $this->decode($response);

        return $response;
    }

    /**
     * 坐席下班
     *
     * @param $agentid 坐席id
     * @return bool
     */
    public function agentOffwork($agentid)
    {
        $api = $this->baseUrl . self::API_AGENT_OFF_WORK;
        $body = <<<EOT
            <?xml version='1.0' encoding='utf-8'?>
            <Request>gen
            <Appid>{$this->appId}</Appid>
            <AgentOffWork  agentid="{$agentid}"/>
            </Request>
EOT;
        $response = $this->curl($api, $body);
        $response = $this->decode($response);

        return $response;
    }

    /**
     * 坐席准备就绪
     *
     * @param $agentid 坐席id
     * @return bool
     */
    public function agentReady($agentid)
    {
        $api = $this->baseUrl . self::API_AGENT_READY;
        $body = <<<EOT
            <?xml version='1.0' encoding='utf-8'?>
            <Request>
            <Appid>{$this->appId}</Appid>
            <AgentReady agentid="{$agentid}" state="1" />
            </Request>
EOT;
        $response = $this->curl($api, $body);
        $response = $this->decode($response);

        return $response;
    }

    /**
     * 坐席结束电话
     *
     * @param $callid 通话id
     * @param $agentid 坐席id
     * @return bool
     */
    public function hangUp($callid, $agentid)
    {
        $api = $this->baseUrl . self::API_CALL . '?callid=' . $callid;
        $body = <<<EOT
            <?xml version='1.0' encoding='utf-8'?>
            <Request>
            <Appid>{$this->appId}</Appid>
            <AgentReady callid="{$callid} agentid="{$agentid}"/>
            </Request>
EOT;
        $response = $this->curl($api, $body);
        $response = $this->decode($response);

        return $response;
    }

    /**
     * 转接电话
     *
     * @param $callid 通话id
     * @param $agentid 坐席 ID
     * @return bool
     */
    public function shift($callid, $agentid)
    {
        $api = $this->baseUrl . self::API_CALL . '?callid=' . $callid;
        $body = <<<EOT
            <?xml version='1.0' encoding='utf-8'?>
            <Request>
            <Appid>{$this->appId}</Appid>
            <Transfer callid="{$callid}" agentid="{$agentid}"/>
            </Request>
EOT;
        $response = $this->curl($api, $body);
        $response = $this->decode($response);

        return $response;
    }

    /**
     * 语音文件上传
     *
     * @param $filename 文件名
     * @param $body 二进制文件
     * @return bool
     */
    public function uploadMedia($filename, $body)
    {
        $params = [
            'appid' => $this->appId,
            'filename' => $filename
        ];

        $tmpFile = storage_path(new \MongoDB\BSON\ObjectID());
        file_put_contents($tmpFile, $body);
        $this->contentType = 'application/octet-stream';
        $api = $this->baseUrl . self::API_UPLOAD_MEDIA . '?' . http_build_query($params);
        $response = $this->curl($api, ['tmp_file' =>  $tmpFile]);
        $response = $this->decode($response);
        @unlink($tmpFile);
        return $response;
    }

    /**
     * 创建子帐号
     *
     * @param $friendlyName 子帐号名称
     * @return bool
     */
    public function createSubAccount($friendlyName)
    {
        $api = $this->baseUrl . self::API_CREATE_SUB_ACCOUNT;
        $body = <<<EOT
            <SubAccount>
                <appId>{$this->appId}</appId>
                <friendlyName>{$friendlyName}</friendlyName>
            </SubAccount>
EOT;
        $response = $this->curl($api, $body);
        $response = $this->decode($response);

        return $response;
    }

    /**
     * 获取子帐号
     *
     * @param $startNo 开始的序号，默认从0开始
     * @param $offset 一次查询的最大条数，最小是1条，最大是100条
     * @return bool
     */
    public function getSubAccounts($startNo, $offset)
    {
        $api = $this->baseUrl . self::API_GET_SUB_ACCOUNT;
        $body = <<<EOT
            <SubAccount>
              <appId>{$this->appId}</appId>
              <startNo>{$startNo}</startNo>
              <offset>{$offset}</offset>
            </SubAccount>
EOT;
        $response = $this->curl($api, $body);
        $response = $this->decode($response);

        return $response;
    }

    /**
     * 关闭子账号
     */
    public function closeSubaccount($sid)
    {
        $api = $this->baseUrl . self::API_CLOSE_SUB_ACCOUNT;
        $body = <<<EOT
            <?xml version='1.0' encoding='utf-8'?>
                <SubAccount>
                  <subAccountSid>{$sid}</subAccountSid>
                </SubAccount>
EOT;
        $response = $this->curl($api, $body);
        $response = $this->decode($response);

        return $response;
    }

    /**
     * 外呼通知
     *
     * @param $to 被叫号码
     * @param $mediaName 语音文件名称，格式 wav。与mediaTxt不能同时为空。当不为空时mediaTxt属性失效。
     * @param $displayNum 显示的主叫号码
     * @param $userData 用户私有数据
     * @return bool
     */
    public function landingCall($to, $mediaName, $displayNum, $userData)
    {

        $api = $this->baseUrl . self::API_LANDING_CALL;
        $callback = asset('api/voip/callback/auth');
        $body = <<<EOT
            <LandingCall>
                <to>{$to}</to>
                <mediaName>{$mediaName}</mediaName>
                <appId>{$this->appId}</appId>
                <displayNum>{$displayNum}</displayNum>
                <userData>{$userData}</userData>
                <respUrl>{$callback}</respUrl>
             </LandingCall>
EOT;
        $response = $this->curl($api, $body);
        $response = $this->decode($response);

        return $response;
    }

    /**
     * IVR外呼
     *
     * @param $number   待呼叫号码，为Dial节点的属性
     * @param $userdata 用户数据，在<startservice>通知中返回，只允许填写数字字符，为Dial节点的属性
     * @param $record   是否录音，可填项为true和false，默认值为false不录音，为Dial节点的属性
     * @return bool
     */
    public function ivrDial($number, $userdata, $record = true)
    {
        $api = $this->baseUrl . self::API_IVR_DIAL;
        $body = <<<EOT
            <Request>
                <Appid>$this->appId</Appid>
                <Dial number='$number'  userdata='$userdata' record='record'></Dial>
            </Request>
EOT;

        $response = $this->curl($api, $body);
        $response = $this->decode($response);

        return $response;
    }

    /**
     * 话单下载
     *
     * @param $date     day 代表前一天的数据（从00:00 – 23:59）
     * @param $keywords   客户的查询条件，由客户自行定义并提供给云通讯平台。默认不填忽略此参数
     * @return bool
     */
    public function billRecords($date,$keywords)
    {
        $api = $this->baseUrl . self::API_BILL_RECORD;
        $body = <<<EOT
            <BillRecords>
                <appId>$this->appId</appId>
                <date>$date</date>
                <keywords>$keywords</keywords>
            </BillRecords>;
EOT;
        $response = $this->curl($api, $body);
        $response = $this->decode($response);

        return $response;
    }

    /**
     * 取消回拨
     *
     * @param $callSid   一个由32个字符组成的电话唯一标识符
     * @param $type   0： 任意时间都可以挂断电话；1 ：被叫应答前可以挂断电话，其他时段返回错误代码；2： 主叫应答前可以挂断电话，其他时段返回错误代码；默认值为0。
     * @return bool
     */
    public function CallCancel($callSid, $type)
    {
        $api = $this->baseUrl . self::API_CALL_CANCEL;
        $body = <<<EOT
            <CallCancel>
                <appId>$this->appId</appId>
                <callSid>$callSid</callSid>
                <type>$type</type>
            </CallCancel>";
EOT;
        $response = $this->curl($api, $body);
        $response = $this->decode($response);

        return $response;
    }

    /**
     * 呼叫状态查询
     *
     * @param $callid     呼叫Id
     * @param $action   查询结果通知的回调url地址
     * @return bool
     */
    public function QueryCallState($callid, $action)
    {
        $api = $this->baseUrl . self::API_CALL . '?callid=' . $callid;
        $body = <<<EOT
            <Request>
                <Appid>{$this->appId}</Appid>
                <QueryCallState callid ="{$callid}" action="{$action}"/>
            </Request>
EOT;

        $response = $this->curl($api, $body);
        $response = $this->decode($response);

        return $response;
    }

    /**
     * 呼叫结果查询
     *
     * @param $callSid     呼叫Id
     * @return bool
     */
    public function CallResult($callSid)
    {
        $api = $this->baseUrl . self::API_CALL_RESULT . '?callsid=' .$callSid;
        $response = $this->curl($api);
        $response = $this->decode($response);

        return $response;
    }

    /**
     * 获取坐席状态
     *
     * @param $agentId 坐席 id
     * @return result
     */
    public function getAgentState($agentId = null)
    {
        $api = $this->baseUrl . self::API_GET_AGETN_STATE;
        $body = <<<EOT
            <?xml version='1.0' encoding='utf-8'?>
                <Request>
                  <Appid>{$this->appId}</Appid>
                  <QueryAgentState />
                </Request>
EOT;
        $response = $this->curl($api, $body);
        $response = $this->decode($response);

        return $response;
    }

    /**
     * 获取阵列状态
     */
    public function getQueueInfo()
    {
        $url = "https://$this->serverIP:$this->serverPort/$this->softVersion/Accounts/$this->accountSid/ivr/queryqueueinfo";
        $body = <<<EOT
            <?xml version='1.0' encoding='utf-8'?>
                <Request>
                  <Appid>{$this->appId}</Appid>
                  <QueryQueueInfo/>
                </Request>
EOT;

        return $this->decode($this->curl($url, $body));
    }

    /**
     * 发起HTTPS请求
     *
     * @param $url
     * @param $data
     * @param $header
     * @param $post
     * @return result
     */
    public function curl($url, $data = null, $header = null, $post = 1)
    {
        $url .= stripos($url, '?') === false ? '?sig=' . $this->sig : '&sig=' . $this->sig;

        $curl = Curl::to($url);
        if (isset($data['tmp_file'])) {
            $curl->withOption('--data-binary', '@' . $data['tmp_file']);
            $data = file_get_contents($data['tmp_file']);
        } else {
            $data = trim($data);
            $curl->withData($data);
        }

        if ($header === null) {
            $authen = base64_encode($this->accountSid . ":" . $this->batch);
            $curl->withHeader('Accept', "application/{$this->bodyType}")
                ->withHeader('Content-Type', "{$this->contentType};charset=utf-8")
                ->withHeader('Content-Length', strlen($data))
                ->withHeader('Authorization',  $authen);
        }

        $response = $post ? $curl->post() : $curl->get();

        return $response;
    }

    /**
     * 格式化返回值
     *
     * @param response
     * @return stdClass
     */
    public function decode($response)
    {
        if ($response !== false && is_string($response)) {
            if ($this->bodyType == 'json') {
                $response = json_decode($response, true);
            } else {
                $response = XML::parse($response);
            }
        }

        return $response;
    }
}

