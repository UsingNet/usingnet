<?php

namespace App\Services;

use ZMQ;
use ZMQContext;
use ZMQSocket;

class Socket
{
    private $socket;
    const TIMEOUT = 5000;

    public function __construct()
    {
        $this->dns = env('MESSAGE_SERVER_HOST');
        $context = new ZMQContext();
        $this->socket =  new ZMQSocket($context, ZMQ::SOCKET_DEALER);
        $this->socket->setSockOpt(ZMQ::SOCKOPT_LINGER, self::TIMEOUT);
        $this->socket->connect($this->dns);
    }

    public function __call($name, $arguments)
    {
        $this->socket->send(json_encode([
            'method'=>$name,
            'params'=>$arguments
        ]));

        // 超时处理
        /**
        $read = $write = [];
        $poll = new \ZMQPoll();
        $poll->add($this->socket, ZMQ::POLL_IN);
        $poll->poll($read, $write, self::TIMEOUT);
         */

        //return $arguments;
        $resp = json_decode($this->socket->recv(), true);

        if($resp['ok']){
            return isset($resp['data']) ? $resp['data'] : true;
        }else{
            throw new \Exception($resp['error']);
        }
    }

    public function __destruct()
    {
        $this->socket->disconnect($this->dns);
    }
}