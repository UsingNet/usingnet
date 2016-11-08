<?php

use Illuminate\Database\Schema\Blueprint;
use App\Models\Team;
use App\Models\User;
use App\Models\Message;
use Illuminate\Database\Migrations\Migration;

class AddStatsAllMessage extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $today = new \MongoDB\BSON\UTCDatetime(strtotime(date('Y-m-d')) * 1000);
        $handler = Message::where('type', Message::TYPE_IM)
            ->where(function ($q) {
                $q->where('package.agent', 'exists', false)
                    ->orWhere('package.contact', 'exists', false);
            })
            ->where('updated_at', 'exists', false)
            ->where('package.order_id', 'exists', true)
            ->take(10000);

        // 消息添加　agent and contact
        while ($messages = $handler->get()) {
            if ($messages->count() === 0) {
                break;
            }
            foreach ($messages as $message) {
                $order = \App\Models\Order::find($message->package['order_id']);
                $message->updated_at = $today;
                if ($order && $order->user && $order->contact) {
                    $package = $message->package;
                    $package = array_merge($package, [
                        'agent' => array_only($order->user->toArray(), ['id', 'img', 'name']),
                        'contact' => array_only($order->contact->toArray(), ['id', 'img', 'name'])
                    ]);
                    $message->package = $package;
                }
                $message->save();
            }
        }

        $firstMessage = \App\Models\Message::orderBy('_id', 'asc')->first();
        $created = (string) $firstMessage->created_at / 1000;
        $days = round((time() - $created) / (3600 * 24));

        $users = User::all();
        while ($days--) {
            $time = strtotime('-' . $days . ' days');
            $begin = \Carbon\Carbon::createFromTimestamp($time)->startOfDay();
            $end = \Carbon\Carbon::createFromTimestamp($time)->endOfDay();

            foreach ($users as $user) {
                $messages = \App\Models\Message::where('created_at', '>=', $begin)
                    ->where('created_at', '<=', $end)
                    ->where('package.agent.id', $user->id)
                    ->where('package.order_id', 'exists', true)
                    ->orderBy('_id', 'asc')
                    ->get();

                if ($messages->count()) {
                    $resp = \App\Models\Stats::compute($messages);
                    $stats = \App\Models\Stats::firstOrCreate([
                        'team_id' => $user->team_id,
                        'user_id' => $user->id,
                        'date' => date('Y-m-d', $time),
                        'created_at' => new MongoDB\BSON\UTCDatetime($time * 1000),
                        'updated_at' => new MongoDB\BSON\UTCDatetime($time * 1000),
                    ]);

                    $stats->fill($resp);
                    $stats->save();
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
