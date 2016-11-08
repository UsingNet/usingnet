<?php

namespace App\Console\Commands;

use App\Models\Payment;
use App\Services\Alipay;
use App\Services\Wepay;
use Illuminate\Console\Command;

class PayStatus extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'pay:status';

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
        $payments = Payment::where('status', Payment::STATUS_INIT)->get();
        foreach ($payments as $payment) {
            if ($payment->type === Payment::TYPE_WEPAY) {
                Wepay::checkStatus($payment);
            } else {
                Alipay::checkStatus($payment);
            }
        }
    }
}
