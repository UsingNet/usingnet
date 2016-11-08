<?php

use App\Models\Order;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddRepairOrderHisotryAgent extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $messages = \App\Models\Message::where('body', 'like', '%转发工单%')->get()->toArray();
        $orderIds = array_unique(array_fetch($messages, 'package.order_id'));
        foreach ($orderIds as $id) {
            $messages = \App\Models\Message::where('package.order_id', $id)->orderBy('_id', 'desc')->get();
            foreach ($messages as $message) {
                if (stripos($message->body, '转发工单') !== false) {
                    $pairs = explode(' ', $message->body);
                    $name = trim($pairs[0]);
                    $user = \App\Models\User::where('name', $name)->first();
                    if ($user) {
                        \App\Models\Message::where('package.order_id', $id)
                            ->where('_id', '<', $message->_id)
                            ->where('package.agent', 'exists', true)
                            ->update(['package.agent' => array_only($user->toArray(), ['id', 'img', 'name'])]);
                    }
                }
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
