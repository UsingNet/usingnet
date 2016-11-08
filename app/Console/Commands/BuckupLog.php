<?php
/**
 *  定期清理 log
 *  没周备份一次 覆盖上一次的备份
 */

namespace App\Console\Commands;

use App\Models\Team;
use App\Models\Attachment;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class BuckupLog extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'backup:log';

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
        // 备份日志
        $logs = ['debug.log', 'warning.log', 'error.log', 'laravel.log'];
        $backupPath = storage_path('logs/buckup/'  . date('Y/m/'));
        if (!is_dir($backupPath)) {
            mkdir($backupPath, '0777', true);
        }

        foreach ($logs as $log) {
            $logFile = storage_path('logs/' . $log);
            $owner = fileowner($logFile);
            if (!file_exists($logFile)) {
                continue;
            }

            $created = filemtime($logFile);
            if (date('m') != date('m', $created)) {
                 $buckupPath = storage_path('logs/buckup/' . date('Y/')) . date('m/', $created);
                if (!is_dir($backupPath)) {
                    mkdir($backupPath, 0777, true);
                }
                rename($logFile, $buckupPath . $log);
                touch($logFile);
                chown($logFile, $owner);
                chgrp($logFile, $owner);
            }
        }
    }
}
