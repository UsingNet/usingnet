<?php

namespace App\Services;

use App\Library\Curl;
use Overtrue\Wechat\Utils\JSON;
use Redis;
use Config;

class WechatTeam
{
    public static $block_size = 32;
    public static $OK = 0;
    public static $ValidateSignatureError = -40001;
    public static $ParseXmlError = -40002;
    public static $ComputeSignatureError = -40003;
    public static $IllegalAesKey = -40004;
    public static $ValidateCorpidError = -40005;
    public static $EncryptAESError = -40006;
    public static $DecryptAESError = -40007;
    public static $IllegalBuffer = -40008;
    public static $EncodeBase64Error = -40009;
    public static $DecodeBase64Error = -40010;
    public static $GenReturnXmlError = -40011;
    private $config;

    public function __construct($config)
    {
        $this->config = $config;
    }

    /**
     * 对需要加密的明文进行填充补位
     * @param $text 需要进行填充补位操作的明文
     * @return 补齐明文字符串
     */
    public function encode($text)
    {
        $text_length = strlen($text);
        //计算需要填充的位数
        $amount_to_pad = static::$block_size - ($text_length % static::$block_size);
        if ($amount_to_pad == 0) {
            $amount_to_pad = static::block_size;
        }
        //获得补位所用的字符
        $pad_chr = chr($amount_to_pad);
        $tmp = "";
        for ($index = 0; $index < $amount_to_pad; $index++) {
            $tmp .= $pad_chr;
        }
        return $text . $tmp;
    }

    /**
     * 对解密后的明文进行补位删除
     * @param decrypted 解密后的明文
     * @return 删除填充补位后的明文
     */
    public function decode($text)
    {

        $pad = ord(substr($text, -1));
        if ($pad < 1 || $pad > static::$block_size) {
            $pad = 0;
        }
        return substr($text, 0, (strlen($text) - $pad));
    }

    /**
     * 对明文进行加密
     * @param string $text 需要加密的明文
     * @return string 加密后的密文
     */
    public function encrypt($text, $corpid, $key)
    {
        $key = base64_decode($key, '=');
        try {
            //获得16位随机字符串，填充到明文之前
            $random = $this->getRandomStr();
            $text = $random . pack("N", strlen($text)) . $text . $corpid;
            // 网络字节序
            $module = mcrypt_module_open(MCRYPT_RIJNDAEL_128, '', MCRYPT_MODE_CBC, '');
            $iv = substr($key, 0, 16);
            //使用自定义的填充方式对明文进行补位填充
            $text = $this->encode($text);
            mcrypt_generic_init($module, $key, $iv);
            //加密
            $encrypted = mcrypt_generic($module, $text);
            mcrypt_generic_deinit($module);
            mcrypt_module_close($module);

            //print(base64_encode($encrypted));
            //使用BASE64对加密后的字符串进行编码
            return array(static::$OK, base64_encode($encrypted));
        } catch (Exception $e) {
            print $e;
            return array(static::$EncryptAESError, null);
        }
    }

    /**
     * 对密文进行解密
     * @param string $encrypted 需要解密的密文
     * @return string 解密得到的明文
     */
    public function decrypt($encrypted)
    {
        $key = base64_decode($this->config['encoding_aes_key'], '=');
        try {
            //使用BASE64对需要解密的字符串进行解码
            $ciphertext_dec = base64_decode($encrypted);
            $module = mcrypt_module_open(MCRYPT_RIJNDAEL_128, '', MCRYPT_MODE_CBC, '');
            $iv = substr($key, 0, 16);
            mcrypt_generic_init($module, $key, $iv);

            //解密
            $decrypted = mdecrypt_generic($module, $ciphertext_dec);
            mcrypt_generic_deinit($module);
            mcrypt_module_close($module);
        } catch (Exception $e) {
            return array(static::$DecryptAESError, null);
        }

        try {
            //去除补位字符
            $result = $this->decode($decrypted);
            //去除16位随机字符串,网络字节序和AppId
            if (strlen($result) < 16)
                return "";
            $content = substr($result, 16, strlen($result));
            $len_list = unpack("N", substr($content, 0, 4));
            $xml_len = $len_list[1];
            $xml_content = substr($content, 4, $xml_len);
            $from_corpid = substr($content, $xml_len + 4);
        } catch (Exception $e) {
            print $e;
            return array(static::$IllegalBuffer, null);
        }

        if ($from_corpid != $this->config['appid']) {
            return array(static::$ValidateCorpidError, null);
        }

        return array(0, $xml_content);
    }

    /**
     * 随机生成16位字符串
     * @return string 生成的字符串
     */
    function getRandomStr()
    {
        $str = "";
        $str_pol = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
        $max = strlen($str_pol) - 1;
        for ($i = 0; $i < 16; $i++) {
            $str .= $str_pol[mt_rand(0, $max)];
        }
        return $str;
    }

    /**
     * 提取出xml数据包中的加密消息
     * @param string $xmltext 待提取的xml字符串
     * @return string 提取出的加密消息字符串
     */
    public function extract($xmltext)
    {
        try {
            $xml = new \DOMDocument();
            $xml->loadXML($xmltext);
            $array_e = $xml->getElementsByTagName('Encrypt');
            $array_a = $xml->getElementsByTagName('ToUserName');
            $encrypt = $array_e->item(0)->nodeValue;
            $tousername = $array_a->item(0)->nodeValue;
            return array(0, $encrypt, $tousername);
        } catch (Exception $e) {
            print $e . "\n";
            return array(static::$ParseXmlError, null, null);
        }
    }

    /**
     * 生成xml消息
     * @param string $encrypt 加密后的消息密文
     * @param string $signature 安全签名
     * @param string $timestamp 时间戳
     * @param string $nonce 随机字符串
     */
    public function generate($encrypt, $signature, $timestamp, $nonce)
    {
        $format = <<<EOL
        <xml>
        <Encrypt><![CDATA[%s]]></Encrypt>
        <MsgSignature><![CDATA[%s]]></MsgSignature>
        <TimeStamp>%s</TimeStamp>
        <Nonce><![CDATA[%s]]></Nonce>
        </xml>
EOL;
        return sprintf($format, $encrypt, $signature, $timestamp, $nonce);
    }

    /**
     * 用SHA1算法生成安全签名
     * @param string $token 票据
     * @param string $timestamp 时间戳
     * @param string $nonce 随机字符串
     * @param string $encrypt 密文消息
     */
    public function getSHA1($token, $timestamp, $nonce, $encrypt_msg)
    {
        //排序
        try {
            $array = array($encrypt_msg, $token, $timestamp, $nonce);
            sort($array, SORT_STRING);
            $str = implode($array);
            return array(static::$OK, sha1($str));
        } catch (Exception $e) {
            print $e . "\n";
            return array(static::$ComputeSignatureError, null);
        }
    }


    /*
     * 验证URL
     * @param sMsgSignature: 签名串，对应URL参数的msg_signature
     * @param sTimeStamp: 时间戳，对应URL参数的timestamp
     * @param sNonce: 随机串，对应URL参数的nonce
     * @param sEchoStr: 随机串，对应URL参数的echostr
     * @param sReplyEchoStr: 解密之后的echostr，当return返回0时有效
     * @return：成功0，失败返回对应的错误码
    */
    public function VerifyURL($sMsgSignature, $sTimeStamp, $sNonce, $sEchoStr, &$sReplyEchoStr)
    {
        if (strlen($this->config['encoding_aes_key']) != 43) {
            return static::$IllegalAesKey;
        }

        //verify msg_signature
        $array = $this->getSHA1($this->config['token'], $sTimeStamp, $sNonce, $sEchoStr);
        $ret = $array[0];

        if ($ret != 0) {
            return $ret;
        }

        $signature = $array[1];
        if ($signature != $sMsgSignature) {
            return static::$ValidateSignatureError;
        }

        $result = $this->decrypt($sEchoStr, $this->config['appid'], $this->config['encoding_aes_key']);
        if ($result[0] != 0) {
            return $result[0];
        }
        $sReplyEchoStr = $result[1];

        return static::$OK;
    }

    /**
     * 将公众平台回复用户的消息加密打包.
     * <ol>
     *    <li>对要发送的消息进行AES-CBC加密</li>
     *    <li>生成安全签名</li>
     *    <li>将消息密文和安全签名打包成xml格式</li>
     * </ol>
     *
     * @param $replyMsg string 公众平台待回复用户的消息，xml格式的字符串
     * @param $timeStamp string 时间戳，可以自己生成，也可以用URL参数的timestamp
     * @param $nonce string 随机串，可以自己生成，也可以用URL参数的nonce
     * @param &$encryptMsg string 加密后的可以直接回复用户的密文，包括msg_signature, timestamp, nonce, encrypt的xml格式的字符串,
     *                      当return返回0时有效
     *
     * @return int 成功0，失败返回对应的错误码
     */
    public function EncryptMsg($sReplyMsg, $sTimeStamp, $sNonce, &$sEncryptMsg)
    {
        //加密
        $array = $this->encrypt($sReplyMsg, $this->config['appid'], $this->config['encoding_aes_key']);
        $ret = $array[0];
        if ($ret != 0) {
            return $ret;
        }

        if ($sTimeStamp == null) {
            $sTimeStamp = time();
        }

        $encrypt = $array[1];

        //生成安全签名
        $array = $this->getSHA1($this->config['token'], $sTimeStamp, $sNonce, $encrypt);
        $ret = $array[0];
        if ($ret != 0) {
            return $ret;
        }
        $signature = $array[1];

        //生成发送的xml
        $sEncryptMsg = $this->generate($encrypt, $signature, $sTimeStamp, $sNonce);
        return static::$OK;
    }

    /**
     * 检验消息的真实性，并且获取解密后的明文.
     * <ol>
     *    <li>利用收到的密文生成安全签名，进行签名验证</li>
     *    <li>若验证通过，则提取xml中的加密消息</li>
     *    <li>对消息进行解密</li>
     * </ol>
     *
     * @param $msgSignature string 签名串，对应URL参数的msg_signature
     * @param $timestamp string 时间戳 对应URL参数的timestamp
     * @param $nonce string 随机串，对应URL参数的nonce
     * @param $postData string 密文，对应POST请求的数据
     * @param &$msg string 解密后的原文，当return返回0时有效
     *
     * @return int 成功0，失败返回对应的错误码
     */
    public function DecryptMsg($sMsgSignature, $sTimeStamp = null, $sNonce, $sPostData, &$sMsg)
    {
        if (strlen($this->config['encoding_aes_key']) != 43) {
            return static::$IllegalAesKey;
        }

        //提取密文
        $array = $this->extract($sPostData);
        $ret = $array[0];

        if ($ret != 0) {
            return $ret;
        }

        if ($sTimeStamp == null) {
            $sTimeStamp = time();
        }

        $encrypt = $array[1];
        //验证安全签名
        $array = $this->getSHA1($this->config['token'], $sTimeStamp, $sNonce, $encrypt);
        $ret = $array[0];

        if ($ret != 0) {
            return $ret;
        }

        $signature = $array[1];
        if ($signature != $sMsgSignature) {
            return static::$ValidateSignatureError;
        }

        $result = $this->decrypt($encrypt, $this->config['appid'], $this->config['encoding_aes_key']);
        if ($result[0] != 0) {
            return $result[0];
        }

        $sMsg = $result[1];

        return static::$OK;
    }

    /**
     * 获取 access token
     */
    public static function getAccessToken()
    {
        $api = 'https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=%s&corpsecret=%s';
        $key = 'wechat_team_token';
        $redis = Redis::connection();
        $accessToken = $redis->get($key);

        if (!$accessToken) {
            $api = sprintf($api, Config::get('wechat.enterprise.appid'), Config::get('wechat.enterprise.secret'));
            $json = file_get_contents($api);
            $arr = json_decode($json, true);
            if (isset($arr['access_token'])) {
                $accessToken = $arr['access_token'];
                $redis->set($key, $accessToken);
                $redis->expire($key, $arr['expires_in']);
            } else {
                $accessToken = null;
            }
        }

        return $accessToken;
    }

    /**
     * 创建 菜单
     * @param $menu
     */
    public static function createMenu($menu, $agentId)
    {
        $api = 'https://qyapi.weixin.qq.com/cgi-bin/menu/create?access_token=%s&agentid=%s';
        $url = sprintf($api, static::getAccessToken(), $agentId);

        return Curl::to($url)->withData($menu)->post();
    }

    /**
     * 上传附件
     */
    public static function upload($type, $media)
    {
        $api = sprintf('https://qyapi.weixin.qq.com/cgi-bin/media/upload?access_token=%s&type=%s', static::getAccessToken(), $type);
        return Curl::to($api)->withOption('-F', 'media=@' . $media)->post();
    }

    public static function notice($message, $to = '@all')
    {
        $api = 'https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=' . self::getAccessToken();
        $params = [
            'touser' => $to,
            'msgtype' => 'text',
            'agentid' => 2,
            'text' => [
                'content' => $message,
            ]
        ];

        return Curl::to($api)->withData(JSON::encode($params))->post();
    }
}
