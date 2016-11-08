<?php

namespace App\Observers;

use App\Models\Developer\Wechat;

class ErrorObserver
{
    /**
     * 创建联系人生成 token
     * @param $contact
     */
    public function created($error)
    {
        $url = 'http://' . \Config::get('developer.domain') . '/error/' . $error->_id;
        $desc = $error->desc ? json_encode($error->desc) : '查看错误';
        $msg = sprintf('[%s] <a href="%s">%s</a>', $error->type, $url, $desc);
        try {
            Wechat::notice($msg, '@all');
        } catch (\Exception $e) {
        }
    }
}