<?php
/**
 * 发送邮件
 */

namespace App\Services;

use App\Library\Syslog;
use DB;
use Illuminate\Support\Facades\Redis;
use PHPMailer;
use Config;

class Mail
{
    const REDIS_PREFIX = 'usingnet:mail:queues';

    /**
     * 发送邮件
     * @param $from
     * @param $fromName
     * @param $to
     * @param $toName
     * @param $subject
     * @param $body
     * @param $isQueue bool
     * @return bool
     * @throws \phpmailerException
     */
    public static function send($host, $port, $mode, $username, $password, $from , $fromName, $to, $toName, $subject, $body, $isQueue = false)
    {
        if ($isQueue) {
            $reids = Redis::connection();
            $reids->lpush(self::REDIS_PREFIX, json_encode([
                'host' => $host,
                'port' => $port,
                'mode' => $mode,
                'username' => $username,
                'password' => $password,
                'from' => $from,
                'fromName' => $fromName,
                'to' => $to,
                'toName' => $toName,
                'subject' => $subject,
                'body' => $body,
            ]));

            return true;
        }

        return self::sendBySMTP($host, $port, $mode, $username, $password, $from, $fromName, $to, $toName, $subject, $body);
    }

    public static function sendBySMTP($host, $port, $mode, $username, $password, $from, $fromName, $to, $toName, $subject, $body)
    {
        $mail = new PHPMailer();
        $mail->SMTPDebug = 0;
        $mail->isSMTP();
        $mail->CharSet = 'UTF-8';
        $mail->XMailer = Config::get('app.name');
        $mail->Host = $host;
        $mail->Helo = $host;
        $mail->Port = $port;
        $mail->isHTML(true);
        $mail->clearAddresses();
        $mail->addAddress($to, $toName);
        $mail->Subject = $subject;
        $mail->Body = $body;
        $mail->SMTPAuth = Config::get('mail.auth');
        $mail->SMTPOptions = ['ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true
        ]];

        $mail->Username = $username;
        $mail->Password = $password;
        $mail->SMTPSecure = $mode;
        $mail->setFrom($from, $fromName);
        if (!$mail->send()) {
            Syslog::logger('MAIL')->addCritical('SEND_MAIL_ERROR', [
                $host, $port, $username, $password, $from, $fromName,
                $to, $toName, $subject,$body, $mail->ErrorInfo]);
        }

        return true;
    }

    public static function usingnet($to, $toName, $subject, $content)
    {
        $host = env('MAIL_HOST');
        $port = env('MAIL_PORT');
        $mode = \Config::get('mail.encryption');
        $username = env('MAIL_USERNAME');
        $password = env('MAIL_PASSWORD');
        $from = env('MAIL_FROM');
        $fromName = env('MAIL_FROM_NAME');
        return Mail::send($host, $port, $mode, $username, $password, $from, $fromName, $to, $toName, $subject, $content, false);
    }
}
