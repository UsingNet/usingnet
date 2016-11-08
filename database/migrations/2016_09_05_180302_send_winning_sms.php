<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class SendWinningSms extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $data = [
            '王子灏' =>  13632549619,
            '白俊文' =>  13510793232,
            '宁惜瑶' =>  18681449335,
            '向子程' => 18673743107,
            '刘芷萱' => 13725590122,
            '陈世轩' => 13534081551,
            '何靖权' => 13981152940,
            '胡入心' => 18575593113,
            '马子媛' => 13530679721,
            '肖锦玥' => 13724355402,
            '窦天琪' => 13530794263,
            '张智荣' => 13714072272,
            '李怡菲' =>  15071707924,
            '曾奕壕' =>  13691669321,
            '李云'  => 13480992737
        ];

        $tpl = '【逸格影像】感谢您参加我店的“武林萌主”评选大赛活动，恭喜您获得了%s。请将短信出示给店员确认领奖，领奖地址：%s 回复TD退订';
        $i = 0;
        foreach ($data as $name => $phone) {

            $txt = ['一', '二', '三'];
            if ($i > 2) {
                $level = '幸运奖';
            } else {
                $level = sprintf('第%s名', $txt[$i]);
            }

            $token = \App\Models\Plugin\Winning::genToken();
            \App\Models\Plugin\Winning::create([
                'title' => '“武林萌主”评选大赛',
                'status' => \App\Models\Plugin\Winning::STATUS_INIT,
                'token' => $token,
                'people' => [
                    'phone' => $phone,
                    'name' => $name,
                    'level' => $level
                ],
            ]);

            $token = \Illuminate\Support\Facades\Crypt::encrypt($token);
            $url = 'https://home.usingnet.com/api/winning/' . $token;
            $short = \App\Library\Weibo::genShort($url);

            $content = sprintf($tpl, $level, $short);
            $send = \App\Services\NewSms::sendMarket($phone, $content);
            var_dump($content);
            var_dump($send);
            $i++;
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
}
