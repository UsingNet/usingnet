<?php

namespace App\Library;

use Monolog\Logger;
use App\Services\CustomLog;
use Monolog\Handler\StreamHandler;

class Syslog
{
    private static $_instance;
    private $_uniqId;
    private $_loggers = [];

    private function __construct() {}

    public static function logger($key)
    {
        $self = self::getInstance();
        if (!isset($self->_loggers[$key])) {
            $self->_loggers[$key] = new CustomLog(sprintf('Usingnet %s Thread < %s >', $key, $self->getUniqId()));
            $self->pushHandler($self->_loggers[$key]);
        }
        return $self->_loggers[$key];
    }

    public function getUniqId()
    {
        if (!$this->_uniqId) {
            return $this->_uniqId = uniqid();
        }
        return $this->_uniqId;
    }

    public static function getInstance()
    {
        if (!self::$_instance)  {
            self::$_instance = new static;
        }
        return self::$_instance;
    }

    private function pushHandler(Logger $logger)
    {
        $logger->pushHandler(new StreamHandler(storage_path('logs/debug.log'), Logger::DEBUG));
        $logger->pushHandler(new StreamHandler(storage_path('logs/warning.log'), Logger::WARNING));
        $logger->pushHandler(new StreamHandler(storage_path('logs/error.log'), Logger::ERROR));
    }
}