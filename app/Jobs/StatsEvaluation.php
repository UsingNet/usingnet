<?php

namespace App\Jobs;

use App\Jobs\Job;
use App\Models\Evaluation;
use Carbon\Carbon;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Bus\SelfHandling;
use Illuminate\Contracts\Queue\ShouldQueue;

class StatsEvaluation extends Job implements SelfHandling, ShouldQueue
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
        $createAt = $this->order->updated_at->timestamp;
        $stats = \App\Models\Stats::where(['user_id' => $this->order->user_id])
            ->where('date', date('Y-m-d', $createAt))
            ->first();

        if ($stats) {
            $evaluates = Evaluation::where('user_id', $this->order->user_id)
                ->where('created_at', '>', Carbon::createFromTimestamp($createAt)->startOfDay())
                ->where('created_at', '<', Carbon::createFromTimestamp($createAt)->endOfDay())
                ->get();

            $params = [];
            foreach ($evaluates as $evaluate) {
                $level = $evaluate->level;
                if (!isset($params[$level])) {
                    $params[$level] = 1;
                } else {
                    $params[$level]++;
                }
            }

            $stats->update(['evaluate' => $params]);
        }
    }
}
