<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddRedundancy extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('order', function ($table) {
            $table->string('user_name')->after('note');
            $table->string('contact_name')->after('note');
            $table->integer('time')->after('note');
        });

        \DB::select(\DB::raw('alter table `order` drop timing'));
        $orders = \App\Models\Order::where('status', \App\Models\Order::STATUS_CLOSED)->get();
        foreach ($orders as $order) {
            if ($order->contact) {
                var_dump($order->contact->name);
                \DB::table('order')->where('id', $order->id)->update(['contact_name' => $order->contact->name]);
            }
            if ($order->user) {
                \DB::table('order')->where('id', $order->id)->update(['user_name' => $order->user->name]);
            }
            \DB::table('order')->where('id', $order->id)->update(['time' => strtotime($order->updated_at) - strtotime($order->created_at)]);
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
    }
}
