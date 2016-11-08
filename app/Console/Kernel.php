<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        \App\Console\Commands\Inspire::class,
        \App\Console\Commands\SendMail::class,
        \App\Console\Commands\ClearAttachment::class,
        \App\Console\Commands\SendWechat::class,
        \App\Console\Commands\BuckupLog::class,
        \App\Console\Commands\CountVisitor::class,
        \App\Console\Commands\CloseOrder::class,
        \App\Console\Commands\PayStatus::class,
    ];

    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        // 邮件阵列
        $schedule->command('send:mail')
            ->everyMinute()
            ->withoutOverlapping();

        // 删除过期的附件
        $schedule->command('clear:attachment')
            ->yearly();

        // 清理日志文件
        $schedule->command('backup:log')
            ->daily();

        // 更新 voip 电话阵列
        $schedule->command('update:voip:queue')
            ->dailyAt('0:00');

        // 统计访客
        $schedule->command('count:visitor')
            ->everyMinute()
            ->withoutOverlapping();

        // 关闭超过 24 小时未响应的工单
        $schedule->command('close:order')
            ->everyTenMinutes()
            ->withoutOverlapping();

        // 套餐续费提醒
        $schedule->command('plan:expired')
            ->everyFiveMinutes()
            ->withoutOverlapping();

        // 支付状态
        $schedule->command('pay:status')
            ->everyMinute()
            ->withoutOverlapping();
    }
}
