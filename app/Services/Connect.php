<?php
/**
 * 连接　Message Center 中间层
 */

namespace App\Services;

use ZMQ;
use ZMQContext;
use ZMQSocket;

class Connect
{
    const TOKEN_SERVER = 'tcp://127.0.0.1:12000';
    const PUSH_SERVER = 'tcp://127.0.0.1:12001';
    const ONLINE_SERVER = 'tcp://127.0.0.1:12002';

    private $socket;
    private $dns;

    public function __construct($dns)
    {
        $this->dns = $dns;
        $context = new ZMQContext();
        $this->socket =  new ZMQSocket($context, ZMQ::SOCKET_DEALER);
        $this->socket->setSockOpt(ZMQ::SOCKOPT_LINGER, 2000);
        $this->socket->connect($dns);
    }

    public function __call($name, $arguments)
    {
        $this->socket->send(json_encode([
            'method'=>$name,
            'params'=>$arguments
        ]));

        //return $arguments;
        $response = json_decode($this->socket->recv(), true);

        if($response['ok']){
            return isset($response['data']) ? $response['data'] : true;
        }else{
            throw new \Exception($response['error']);
        }
    }

    public function __destruct()
    {
        $this->socket->disconnect($this->dns);
    }
}