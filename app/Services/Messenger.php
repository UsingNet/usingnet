<?php

namespace App\Services;

use App\Library\Weibo;
use App\Models\Contact;
use App\Models\Setting\Mail;
use Config;
use App\Library\Syslog;
use App\Models\Order;
use App\Models\Message;
use Illuminate\Support\Facades\Redis;
use Overtrue\Wechat\Notice;

class Messenger
{
    /**
     * 发送消息
     * @param $data
     * @return bool
     */
    public static function send($data)
    {
        // 保存工单最后回复时间
        if (isset($data['package']['order_id']) && $data['type'] !== Message::TYPE_SYSTEM) {
            $key = sprintf('%s%s', Order::LAST_REPLIED, $data['package']['order_id']);
            $redis  = Redis::connection();
            $redis->set($key, time());
        }

        Syslog::logger('MESSAGE')->addDebug('SEND_MESSAGE_' . $data['type'], $data);

        return self::getSocket()->emit($data);
    }

    /**
     * 发送备注
     */
    public static function note($data)
    {
        $data['type'] = Message::TYPE_NOTE;
        return self::send($data);
    }

    /**
     * im 消息
     * @param $data
     * @return bool
     */
    public static function im($data)
    {
        $data['type'] = Message::TYPE_IM;
        // 替换图片
        $reg = Config::get('regular.image');
        if (preg_match($reg, $data['body'])) {
            $data['body'] = preg_replace_callback($reg, function ($matches) {
                return sprintf('<img src="%s"/>', $matches[0]);
            }, $data['body']);
        } else if (!preg_match('/<a/', $data['body'])) {
            $regular = Config::get('regular.link');
            $data['body'] = preg_replace_callback($regular, function ($matches) {
                $url = $matches[0];
                if (!preg_match('/^http/', $matches[0])) {
                    $url = 'http://' . $matches[0];
                }
                return sprintf('<a target="_blank" href="%s">%s</a>', $url, $matches[0]);
            }, $data['body']);
        }

        return self::send($data);
    }

    public static function lm($data)
    {
        $data['type'] = Message::TYPE_LM;
        return self::send($data);
    }

    /**
     * 短信消息
     */
    public static function sms($data)
    {
        $data['type'] = Message::TYPE_SMS;
        if ($data['direction'] == Message::DIRECTION_SEND) {
            $contact = Contact::where('token', $data['to'])->first();
            if ($contact && $contact->phone) {
                NewSms::send($contact->phone, $data['body']);
            }
        }

        return self::send($data);
    }

    /**
     * 微信消息
     * @param $data
     * @return bool
     * @throws
     */
    public static function wechat($data)
    {
        $data['type'] = Message::TYPE_WECHAT;
        $data['body'] = preg_replace(['/onclick=".*?"/', '/data-wikiId=".*?"/'], '', $data['body']);

        // 发送 wiki
        if (strpos($data['body'], 'wiki-title')) {
            $wiki = [];
            $wiki['img'] = 'https://o1hpnn7d6.qnssl.com/default-wiki.png';
            preg_match_all('/>(.*?)</s', $data['body'], $matches);
            preg_match('/href="(.*?)"/', $data['body'], $match);
            $wiki['title'] = $matches[1][0];
            $wiki['desc'] = trim($matches[1][2]);
            $wiki['url'] = $match[1];
            if (preg_match('/img.*?src="(.*?)/', $data['body'], $match)) {
                $wiki['img'] = $match[0];
            }
            $data['package'] = array_merge($data['package'], ['wiki' => $wiki]);
        }

        $reg = \Config::get('regular.image');
        if (preg_match($reg, $data['body'])) {
            $data['body'] = sprintf('<img src="%s">', $data['body']);
        }

        if ($data['direction'] == Message::DIRECTION_SEND) {
            $json = escapeshellarg(json_encode($data));
            $cmd = sprintf('nohup /usr/bin/php %s %s %s >> /dev/null 2>&1 &', base_path() . '/artisan', 'SendWechat', $json);
            system($cmd);
        }

        return self::send($data);
    }

    /**
     * 发送 Email
     * @param $data
     * @return bool
     */
    public static function mail($data, $team = null, $contact = null)
    {
        $data['type'] = Message::TYPE_MAIL;

        if ($data['direction'] == Message::DIRECTION_SEND) {
            $host = $team->mail->smtp;
            $port = $team->mail->smtp_port;
            $mode = $team->mail->smtp_mode === \App\Models\Setting\Mail::MODE_EXPRESS ? 'tls' : 'ssl';
            $username = $team->mail->email;
            $password = $team->mail->password;
            $from = $team->mail->email;
            $fromName = $team->name;
            $to = $contact->email;
            $toName = $contact->name;
            $subject = $data['package']['subject'] = replace_variable($data['package']['subject'], $contact);
            $content = $data['body'] = replace_variable($data['body'], $contact);

            $rand = uniqid();
            $key = Mail::REDIS_PREFIX . $rand;
            $redis = Redis::connection();
            $redis->set($key, $data['package']['order_id']);

            $content .= sprintf("<p>点击链接评价我们的服务: %s</p>", Config::get('app.url') . '/api/mail/evaluation?key=' . $rand);

            \App\Services\Mail::send($host, $port, $mode, $username, $password, $from, $fromName, $to, $toName, $subject, $content, true);
        }

        return self::send($data);
    }

    /*
     * 微博
     */
    public static function weibo($data, $team = null, $contact = null)
    {
        $data['type'] = Message::TYPE_WEIBO;
        $reg = \Config::get('regular.image');

        if ($data['direction'] == Message::DIRECTION_SEND) {
            $setting = \App\Models\Setting\Weibo::where('team_id', $team->id)->first();
            $weibo = new Weibo($setting->access_token);
            $type = preg_match($reg, $data['body']) ? 'articles' : 'text';
            try {
                $weibo->sendMessage($data['body'], $contact->weibo_user_id, $type);
            } catch (\Exception $e) {
                self::system([
                    'from' => $contact->token,
                    'to' => $team->token,
                    'direction' => Message::DIRECTION_RECEIVE,
                    'body' => $e->getMessage(),
                    'package' => [
                        'team_id' => $team->id,
                        'order_id' => $data['package']['order_id']
                    ]
                ]);
            }
        }

        if (preg_match($reg, $data['body'])) {
            $data['body'] = sprintf('<img src="%s">', $data['body']);
        }

        return self::send($data);
    }

    /**
     * 发送系统消息
     * @param $data
     */
    public static function system($data)
    {
        $data['type'] = Message::TYPE_SYSTEM;
        if (!isset($data['notice'])) {
            $data['package']['read'] = true;
            $data['package']['received'] = true;
        }

        $lastMessage = Message::where('package.order_id', $data['package']['order_id'])->orderBy('id', 'desc')->first();
        if ($lastMessage && $lastMessage->body == $data['body']) {
            return true;
        }

        if (isset($data['package']['autoreply'])) {
            $order = Order::where('id', $data['packate']['order_id'])->first();
            if ($order->type === Message::TYPE_WECHAT) {
                $json = escapeshellarg(json_encode($data));
                $cmd = sprintf('nohup /usr/bin/php %s %s %s>> /dev/null 2>&1 &', base_path() . '/artisan', 'SendWechat', $json);
                system($cmd);
            }
        }

        if (isset($data['package']['autoreply'])) {
            $order = Order::find($data['package']['order_id']);
            if ($order->type === Message::TYPE_WECHAT) {
                $json = escapeshellarg(json_encode($data));
                $cmd = sprintf('nohup /usr/bin/php %s %s %s>> /dev/null 2>&1 &', base_path() . '/artisan', 'SendWechat', $json);
                system($cmd);
            }
        }

        self::send($data);
    }

    /**
     * 发送消息通知
     */
    public static function notice($to, $msg)
    {
        $data['to'] = $to;
        $data['body'] = $msg;
        $data['type'] = Message::TYPE_SYSTEM;
        $data['from'] = Message::TYPE_SYSTEM;
        $data['direction'] = Message::DIRECTION_RECEIVE;
        $data['package'] = ['read' => false];

        self::send($data);
    }

    /**
     * 向客服发送微信通知
     * @param $team
     * @param $data
     * @param $contact
     */
    public static function wechatNotice($agent, $data, $contact, $orderId)
    {
        $notice = new Notice(Config::get('wechat.appid'), Config::get('wechat.secret'));
        $templateId = Config::get('wechat.template_id');
        $data = [
            'first' => '有新的访客消息',
            'user' => $contact->name,
            'ask' => $data['body'],
        ];

        $url = Config::get('app.wx') . '/api/wechat/auth/web?order_id=' . $orderId;
        try {
            $notice->send($agent['openid'], $templateId, $data, $url);
        } catch (\Exception $e) {
            throw new \Exception($e->getMessage());
        }
    }

    private static function getSocket()
    {
        return new Socket();
    }
}
