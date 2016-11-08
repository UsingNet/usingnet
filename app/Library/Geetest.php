<?php

namespace App\Library;

class Geetest {

    public $response;
    const GT_SDK_VERSION = '1.2.2';
    public function __construct($captcha_id, $private_key) {
        $this->captcha_id  = $captcha_id;
        $this->private_key = $private_key;
    }

    public function check($challenge, $validate, $seccode, $userID  = null) {
        if (!$this->pre_process($userID)) {
            return $this->fail_validate($challenge, $validate, $seccode, $userID);
        }  else {
            return $this->success_validate($challenge, $validate, $seccode, $userID);
        }
    }

    /**
     * 判断极验服务器是否down机
     *
     * @param null $user_id
     * @return int
     */
    public function pre_process($userID = null) {
        $url = "http://api.geetest.com/register.php?gt=" . $this->captcha_id;
        if (($userID != null) and (is_string($userID))) {
            $url = $url . "&user_id=" . $userID;
        }

        $challenge = Curl::to($url)->get();
        if (strlen($challenge) != 32) {
            $this->failback_process();
            return 0;
        }

        $this->success_process($challenge);

        return 1;
    }

    private function failback_process() {
        $rnd1           = md5(rand(0, 100));
        $rnd2           = md5(rand(0, 100));
        $challenge      = $rnd1 . substr($rnd2, 0, 2);
        $result         = array(
            'gt'        => $this->captcha_id,
            'challenge' => $challenge,
            'offline'   => true
        );
        $this->response = $result;
    }

    /**
     *
     * @param $challenge
     */
    private function success_process($challenge) {
        $challenge      = md5($challenge . $this->private_key);
        $result         = array(
            'gt'        => $this->captcha_id,
            'challenge' => $challenge,
            'offline'   => false
        );

        $this->response = $result;
    }

    /**
     * 正常模式获取验证结果
     *
     * @param      $challenge
     * @param      $validate
     * @param      $seccode
     * @param null $user_id
     * @return int
     */
    public function success_validate($challenge, $validate, $seccode, $user_id = null) {
        if (!$this->check_validate($challenge, $validate)) {
            return 0;
        }

        $data = array(
            "seccode" => $seccode,
            "sdk"     => self::GT_SDK_VERSION,
        );

        if (($user_id != null) and (is_string($user_id))) {
            $data["user_id"] = $user_id;
        }

        $url          = "http://api.geetest.com/validate.php";
        $codevalidate = Curl::to($url)->withData($data)->post();
        if ($codevalidate == md5($seccode)) {
            return 1;
        } else {
            return 0;
        }
    }

    /**
     * 宕机模式获取验证结果
     *
     * @param $challenge
     * @param $validate
     * @param $seccode
     * @return int
     */
    public function fail_validate($challenge, $validate, $seccode) {
        if ($validate) {
            $value   = explode("_", $validate);
            $ans     = $this->decode_response($challenge, $value['0']);
            $bg_idx  = $this->decode_response($challenge, $value['1']);
            $grp_idx = $this->decode_response($challenge, $value['2']);
            $x_pos   = $this->get_failback_pic_ans($bg_idx, $grp_idx);
            $answer  = abs($ans - $x_pos);
            if ($answer < 4) {
                return 1;
            } else {
                return 0;
            }
        } else {
            return 0;
        }
    }

    /**
     * @param $challenge
     * @param $validate
     * @return bool
     */
    private function check_validate($challenge, $validate) {
        if (strlen($validate) != 32) {
            return false;
        }
        if (md5($this->private_key . 'geetest' . $challenge) != $validate) {
            return false;
        }

        return true;
    }

    /**
     * 解码随机参数
     *
     * @param $challenge
     * @param $string
     * @return int
     */
    private function decode_response($challenge, $string) {
        if (strlen($string) > 100) {
            return 0;
        }
        $key             = array();
        $seed = [1, 2, 5, 10, 50];
        $res             = 0;

        $array_challenge = array_values(array_unique(str_split($challenge)));
        $array_value     = str_split($string);

        foreach ($array_challenge as $i => $item) {
            $key[$item] = $seed[$i % 5];
        }

        for ($j = 0; $j < strlen($string); $j++) {
            $res += $key[$array_value[$j]];
        }
        $res = $res - $this->decodeRandBase($challenge);
        return $res;
    }

    /**
     * @param $x_str
     * @return int
     */
    private function get_x_pos_from_str($x_str) {
        if (strlen($x_str) != 5) {
            return 0;
        }
        $sum_val   = 0;
        $x_pos_sup = 200;
        $sum_val   = base_convert($x_str, 16, 10);
        $result    = $sum_val % $x_pos_sup;
        $result    = ($result < 40) ? 40 : $result;
        return $result;
    }

    /**
     * @param $full_bg_index
     * @param $img_grp_index
     * @return int
     */
    private function get_failback_pic_ans($full_bg_index, $img_grp_index) {
        $full_bg_name = substr(md5($full_bg_index), 0, 9);
        $bg_name      = substr(md5($img_grp_index), 10, 9);
        $answer_decode = "";
        // 通过两个字符串奇数和偶数位拼接产生答案位
        for ($i = 0; $i < 9; $i++) {
            if ($i % 2 == 0) {
                $answer_decode = $answer_decode . $full_bg_name[$i];
            } elseif ($i % 2 == 1) {
                $answer_decode = $answer_decode . $bg_name[$i];
            }
        }
        $x_decode = substr($answer_decode, 4, 5);
        $x_pos    = $this->get_x_pos_from_str($x_decode);
        return $x_pos;
    }

    /**
     * 输入的两位的随机数字,解码出偏移量
     *
     * @param $challenge
     * @return mixed
     */
    private function decodeRandBase($challenge) {
        $base      = substr($challenge, 32, 2);
        $tempArray = array();
        for ($i = 0; $i < strlen($base); $i++) {
            $tempAscii = ord($base[$i]);
            $result    = ($tempAscii > 57) ? ($tempAscii - 87) : ($tempAscii - 48);
            array_push($tempArray, $result);
        }
        $decodeRes = $tempArray['0'] * 36 + $tempArray['1'];

        return $decodeRes;
    }

    /**
     * @param $err
     */
    private function triggerError($err) {
        trigger_error($err);
    }
}