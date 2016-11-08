<?php

namespace App\Console\Commands;

use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Redis;

class CloseOrder extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'close:order';

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
        $redis = Redis::connection();
        $orders = Order::where('created_at', '<', Carbon::createFromTimestamp(strtotime('-1 day')))
            ->where('status', Order::STATUS_OPEN)
            ->get();

        foreach ($orders as $order) {
            $key = sprintf('%s%s', Order::LAST_REPLIED, $order->id);
            $time = $redis->get($key);
            if ($time && (time() - $time > 3600 * 24) && $order->replied) {
                $order->update(['status' => Order::STATUS_AUTO_CLOSED]);
                $redis->del($key);
            }
        }
    }
}
