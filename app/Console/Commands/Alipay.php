<?php

namespace App\Console\Commands;

use App\Library\Curl;
use App\Models\Pay;
use Carbon\Carbon;
use Illuminate\Console\Command;

class Alipay extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'alipay:status';

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
     * 防止支付宝丢单
     *
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $pays = Pay::where('status', Pay::STATUS_INIT)
            ->where('created_at', '<', Carbon::createFromTimestamp(time() - 3600))->get();

        foreach ($pays as $pay) {
            $alipay = app('alipay.web');
            $alipay->setOutTradeNo($pay->id);
            $alipay->setTotalFee($pay->money);
            $alipay->setSubject($pay->method);
            $link = $alipay->getPayLink();
            Curl::to($link)->get();
            $pay = Pay::find($pay->id);
            if ($pay->status == Pay::STATUS_INIT) {
                $pay->update(['status' => Pay::STATUS_FAIL]);
            }
        }
    }
}
