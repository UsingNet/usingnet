<?php
/**
 * 根据不同的绑定方式处理微信消息
 *
 * \Gibson\Wechat 授权 SDK
 * \Overtrue\Wechat 设置绑定 SDK
 */

namespace App\Services;

use App\Models\Setting\Wechat as Account;

class Wechat
{
    public function __construct($account)
    {
        $this->account = $account;
    }

    public function __call($name, $args)
    {
        $namespace = $this->account->type == Account::TYPE_AUTH ? '\Gibson\Wechat\\' : '\Overtrue\Wechat\\';

        if ($name === 'Server') {
            $className = $namespace . 'Server';
            return new $className($this->account->app_id, $this->account->token, $this->account->encoding_aes_key);
        }

        if ($this->account->type == Account::TYPE_AUTH) {
            $className = $namespace .  $name;
            return new $className($this->getAccessToken()) ;
        } else {
            $className = $namespace . $name;
            return new $className($this->account->app_id, $this->account->app_secret);
        }
    }

    public function getAccessToken()
    {
        $accessToken = new \Gibson\Wechat\AccessToken($this->account->app_id, $this->account->refresh_token);

        return $accessToken->getToken();
    }

}