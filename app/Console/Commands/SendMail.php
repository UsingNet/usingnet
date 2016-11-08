<?php

namespace App\Console\Commands;

use App\Library\Syslog;
use App\Services\Mail;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Redis;

class SendMail extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'send:mail';

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
     * 处理邮件阵列
     *
     * @return mixed
     */
    public function handle()
    {
        $redis = Redis::connection();
        $queues = $redis->lrange(Mail::REDIS_PREFIX, 0, -1);
        foreach ($queues as $i => $queue) {
            $data = json_decode($queue, true);
            if ($data) {
                Syslog::logger('CONSOLE')->addDebug('SEND_MAIL', [$data]);
                try {
                    Mail::send(
                        $data['host'],
                        $data['port'],
                        $data['mode'],
                        $data['username'],
                        $data['password'],
                        $data['from'],
                        $data['fromName'],
                        $data['to'],
                        $data['toName'],
                        $data['subject'],
                        $data['body']
                    );
                } catch (\Exception $e) {
                    if (isset($data['error'])) {
                        $data['error']++;
                        Syslog::logger('SEND_MAIL')->addCritical('SEND_MAIL_ERROR', [$e->getTrace()]);
                    } else {
                        $data['error'] = 1;
                    }
                }

                $redis->lrem(Mail::REDIS_PREFIX, $i, $queue);
                if (isset($data['error']) && $data['error'] === 1) {
                    $redis->lpush(Mail::REDIS_PREFIX, json_encode($data));
                }
            }
        }
    }
}
