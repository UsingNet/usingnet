<?php

namespace App\Jobs;

use App\Jobs\Job;
use App\Models\Message;
use App\Models\Order;
use App\Models\User;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Bus\SelfHandling;
use Illuminate\Contracts\Queue\ShouldQueue;

class Stats extends Job implements SelfHandling, ShouldQueue
{
    use InteractsWithQueue, SerializesModels;

    protected $order;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($order)
    {
        $this->order = $order;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $messages = Message::where('package.order_id', $this->order->id)
            ->where('type', '<>', Message::TYPE_SYSTEM)
            ->orderBy('_id', 'asc')
            ->get();

        $resp = \App\Models\Stats::compute($messages, $this->order);
        $stats = \App\Models\Stats::firstOrCreate([
            'date' => date('Y-m-d'),
            'user_id' => $this->order->user_id,
            'team_id' => $this->order->team_id
        ])->toArray();

        $params = $this->mergeSum($resp, $stats);
        \App\Models\Stats::where('_id', $stats['_id'])->update($params);
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
}
