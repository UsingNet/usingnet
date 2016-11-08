<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddCreatedAtToOrderHistory extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $orders = \App\Models\Order::where('created_at', '0000-00-00 00:00:00')->get();
        foreach ($orders as $order) {
            $firstMessage = \App\Models\Message::where('package.order_id', $order->id)
                ->where('_id', 'asc')
                ->first();
            if ($firstMessage) {
                $date = date('Y-m-d H:i:s', $firstMessage->created_at->timestamp);
            } else {
                $date = date('Y-m-d H:i:s', $order->updated_at->timestamp);
            }
            
            DB::table('order')
                ->where('id', $order->id)
                ->update(['created_at' => $date]);
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
