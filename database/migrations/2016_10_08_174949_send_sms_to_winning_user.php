<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class SendSmsToWinningUser extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $users = [
            '一等奖' => [
                ['name' => '张东玉', 'phone' => '18682490537'],
                ['name' => '王诗瑶', 'phone' => '18218085431']
            ],
            '二等奖' => [
                ['name' => '媛媛', 'phone' => '13825287692'],
                ['name' => '王晨汐', 'phone' => '13927428964'],
            ],
            '三等将' => [
                ['name' => '王若婷', 'phone' => '18575597019'],
                ['name' => '米宝', 'phone' => '18688928927'],
                ['name' => '东东', 'phone' => '13544280912'],
            ],
            '人气将' => [
                ['name' => '冯加号', 'phone' => '13530977741'],
                ['name' => '小涛哥', 'phone' => '13751126608'],
                ['name' => '可馨', 'phone' => '15889718148'],
                ['name' => '丁语悦', 'phone' => '13560336505'],
                ['name' => '刘雨菲', 'phone' => '15818749400'],
            ],
            '优秀奖' => [
                ['name' => "冯加号", 'phone' => "13530977741"],
                ['name' => "小涛哥", 'phone' => ""],
                ['name' => "可馨", 'phone' => ""],
                ['name' => "丁语悦", 'phone' => "13560336505"],
                ['name' => "刘雨菲", 'phone' => "15818749400"],
                ['name' => "杨绿", 'phone' => "18948760994"],
                ['name' => "张轩诚", 'phone' => "13265862525"],
                ['name' => "王远翔", 'phone' => "13713898727"],
                ['name' => "刘翰轩宇", 'phone' => "17301028520"],
                ['name' => "刘芷嫣", 'phone' => "15265001620"],
                ['name' => "朱芮羽", 'phone' => "18305302525"],
                ['name' => "杨宇", 'phone' => "15999626629"],
                ['name' => "邹昱萱", 'phone' => "18565698839"],
                ['name' => "轩轩", 'phone' => "18372537236"],
                ['name' => "豆豆", 'phone' => "17792376166"],
                ['name' => "张茗宇", 'phone' => "13510689757"],
                ['name' => "郭依硕", 'phone' => "13128085576"],
                ['name' => "牛仔", 'phone' => "13510596010"],
                ['name' => "刘子路", 'phone' => "15107552202"],
                ['name' => "殷雨薇", 'phone' => "13714847963"],
                ['name' => "陈子​恒", 'phone' => "18220021332"],
                ['name' => "杨霖煜", 'phone' => "18406467691"]
            ],
            '参与奖' => [
                ['name' => "冯加号", 'phone' => "13530977741"],
                ['name' => "小涛哥", 'phone' => ""],
                ['name' => "可馨", 'phone' => ""],
                ['name' => "丁语悦", 'phone' => "13560336505"],
                ['name' => "刘雨菲", 'phone' => "15818749400"],
                ['name' => "杨绿", 'phone' => "18948760994"],
                ['name' => "张轩诚", 'phone' => "13265862525"],
                ['name' => "王远翔", 'phone' => "13713898727"],
                ['name' => "刘翰轩宇", 'phone' => "17301028520"],
                ['name' => "刘芷嫣", 'phone' => "15265001620"],
                ['name' => "朱芮羽", 'phone' => "18305302525"],
                ['name' => "杨宇", 'phone' => "15999626629"],
                ['name' => "邹昱萱", 'phone' => "18565698839"],
                ['name' => "轩轩", 'phone' => "18372537236"],
                ['name' => "豆豆", 'phone' => "17792376166"],
                ['name' => "张茗宇", 'phone' => "13510689757"],
                ['name' => "郭依硕", 'phone' => "13128085576"],
                ['name' => "牛仔", 'phone' => "13510596010"],
                ['name' => "刘子路", 'phone' => "15107552202"],
                ['name' => "殷雨薇", 'phone' => "13714847963"],
                ['name' => "陈子​恒", 'phone' => "18220021332"],
                ['name' => "杨霖煜", 'phone' => "18406467691"]
            ]
        ];


        $tpl = '恭喜您！您的宝宝获得了%s活动%s！请将短信出示给店员确认领奖，联系电话：%s。%s';

        foreach ($users as $level => $user) {
            foreach ($user as $item) {
                $token = \App\Models\Plugin\Winning::genToken();
                \App\Models\Plugin\Winning::create([
                    'title' => '“武林萌主”评选大赛',
                    'status' => \App\Models\Plugin\Winning::STATUS_INIT,
                    'token' => $token,
                    'people' => [
                        'phone' => $item['phone'],
                        'name' => $item['name'],
                        'level' => $level
                    ],
                ]);

                $token = \Illuminate\Support\Facades\Crypt::encrypt($token);
                $url = 'https://home.usingnet.com/api/winning/' . $token;
                $short = \App\Library\Weibo::genShort($url);

                $content = sprintf($tpl, '“最萌‘笑’宝”', $level, '0755-33181788', $short);

                $send = \App\Services\NewSms::sendNotice($item['phone'], $content);
                var_dump($content);
                var_dump($send);
                exit;
            }
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
