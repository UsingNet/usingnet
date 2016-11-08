<?php

namespace App\Services;

use App\Models\Developer\Error;
use App\Services\WechatTeam;
use Monolog\Logger;

class CustomLog extends Logger
{
    public function __construct($name, $handlers = [], $processors = [])
    {
        parent::__construct($name, $handlers, $processors);
    }

    public function addRecord($level, $message, array $context = array())
    {
        // 发送微信通知
        if ($level > 300) {
            Error::create([
                'type' => Error::TYPE_BACKEND,
                'desc' => $message,
                'content' => json_encode($context),
                'status' => Error::STATUS_INIT
            ]);
        }

        try {
            return parent::addRecord($level, $message, $context);
        } catch (\Exception $e) {
        }
    }

}