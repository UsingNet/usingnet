<?php

use Illuminate\Database\Schema\Blueprint;
use App\Models\Message;
use Illuminate\Database\Migrations\Migration;

class AddStatsMessage extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $teams = \App\Models\Team::all();
        foreach ($teams as $team) {
            $orders = \App\Models\Order::where('team_id', $team->id)
                ->where('status', \App\Models\Order::STATUS_CLOSED)
                ->orderBy('updated_at', 'asc')
                ->get();

            foreach ($orders as $order) {
                $messages = Message::where('package.order_id', $order->id)
                    ->where('type', '<>', Message::TYPE_SYSTEM)
                    ->orderBy('_id', 'asc')
                    ->get();

                $resp = \App\Models\Stats::compute($messages, $order);
                $stats = \App\Models\Stats::firstOrCreate([
                    'date' => date('Y-m-d', $order->updated_at->timestamp),
                    'team_id' => $order->team_id,
                    'user_id' => $order->user_id
                ])->toArray();


                $params = $this->mergeSum($resp, $stats);

                $params['created_at'] = new MongoDB\BSON\UTCDatetime($order->updated_at->timestamp * 1000);
                $params['updated_at'] = new MongoDB\BSON\UTCDatetime($order->updated_at->timestamp * 1000);

                \App\Models\Stats::where('_id', $stats['_id'])->update($params);
            }
        }
    }

    public function mergeSum($arr1, $arr2)
    {
        $params = [];
        foreach ($arr1 as $k => $v) {
            $params[$k] = $v;
            if (isset($arr2[$k])) {
                if (is_array($v)) {
                    foreach ($v as $i => $j) {
                        if (isset($arr2[$k][$i])) {
                            $params[$k][$i] += $arr2[$k][$i];
                        }
                    }
                } else if (is_integer($params[$k]) && is_integer($arr2[$k])) {
                    $params[$k] += $arr2[$k];
                }
            }
        }

        return $params;
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
