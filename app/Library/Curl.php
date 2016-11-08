<?php

namespace App\Library;

class Curl
{
    private static $_instance;
    private $command = ['curl  -s --connect-timeout 2 --max-time 5 -k'];

    private function __construct(){
        // escapeshellarg 转义中文
        setlocale(LC_CTYPE, 'UTF8', 'en_US.UTF-8');
    }

    public function withOption($option, $value)
    {
        $this->command[] = sprintf('%s "%s"', $option, $value);
        return self::getInstance();
    }

    public function withHeader($key, $val)
    {
        $this->command[] = sprintf('-H %s:"%s"', $key, $val);
        return self::getInstance();
    }

    public function withData($data)
    {
        if (is_array($data)) {
            $data = http_build_query($data);
            $this->command[] = sprintf('--data %s', escapeshellarg($data));
        } else {
            $this->command[] = sprintf('--data %s', escapeshellarg($data));
        }

        return self::getInstance();
    }

    public function get()
    {
        self::$_instance = null;
        $command = implode(' ', $this->command);
        Syslog::logger('CURL')->addDebug('CURL_GET', $this->command);
        $response =  shell_exec($command);
        Syslog::logger('CURL')->addDebug('CURL_GET_RESPONSE', [$response]);

        return $response;
    }

    public function post()
    {
        self::$_instance = null;
        Syslog::logger('CURL')->addDebug('CURL_POST', $this->command);
        $command = implode(' ', $this->command);
        $response = shell_exec($command);
        Syslog::logger('CURL')->addDebug("CURL_POST_RESPONSE", [$response]);

        return $response;
    }

    public function upload()
    {
        self::$_instance = null;
        Syslog::logger('CURL')->addDebug('CURL_POST', $this->command);
        $command = implode(' ', $this->command);
        $response = shell_exec($command);
        Syslog::logger('CURL')->addDebug("CURL_POST_RESPONSE", [$response]);

        return $response;
    }

    public static function to($url)
    {
        $self = self::getInstance();
        $self->command[] = sprintf('-L "%s"', $url);
        return $self;
    }

    public static function getInstance()
    {
        if (!self::$_instance)  {
            self::$_instance = new static;
        }
        return self::$_instance;
    }
}
