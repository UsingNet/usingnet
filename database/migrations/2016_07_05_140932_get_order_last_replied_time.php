<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class GetOrderLastRepliedTime extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $orders = \App\Models\Order::where('status', \App\Models\Order::STATUS_OPEN)->get();
        $redis = \Illuminate\Support\Facades\Redis::connection();
        foreach ($orders as $order) {
            $lastMessage = \App\Models\Message::where('package.order_id', $order->id)->orderBy('_id', 'desc')->first();
            if ($lastMessage) {
                $key = sprintf('%s%s', \App\Models\Order::LAST_REPLIED, $order->id);
                $time = (string)$lastMessage->created_at / 1000;
                $redis->set($key, $time);
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
