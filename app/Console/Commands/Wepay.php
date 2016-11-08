<?php

namespace App\Console\Commands;

use App\Library\Curl;
use App\Models\Appstore\Tryout;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Config;
use Overtrue\Wechat\Utils\XML;

class Wepay extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'wepay:status';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        // 关闭超时订单
        $time = Carbon::now()->subMinutes(60);
        $tryouts = Tryout::where('time_expire', '<', $time)
            ->where('payed', false)
            ->where('trade_no', '<>', '')
            ->get();
        $api = 'https://api.mch.weixin.qq.com/pay/closeorder';
        foreach ($tryouts as $tryout) {
            $params = [
                'appid' => Config::get('plugin.tryout.app_id'),
                'mch_id' => Config::get('wechat.pay.mch_id'),
                'out_trade_no' => $tryout->trade_no,
            ];

            $tryout->update(['trade_no' => '']);
            ksort($params);
            $str = urldecode(http_build_query($params)) . '&key=' . Config::get('wechat.pay.secret_key');
            $params['sign'] = strtoupper(md5($str));
            $xml = XML::build($params);
            Curl::to($api)->withData($xml)->post();
        }
    }
}
