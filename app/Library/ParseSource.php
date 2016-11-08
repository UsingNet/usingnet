<?php

namespace App\Library;

use App\Models\Setting\Web;
use App\Models\Setting\Wechat;
use App\Models\Setting\Weibo;
use Easthing\PhoneLocation;

class ParseSource
{

    public $source = [];

    public function __construct($data, $type = 'IM')
    {
        $method = 'parse' . ucwords($type);
        if (method_exists($this, $method)) {
            $this->$method($data);
        }
    }

    public function parseIm($contact)
    {
        if ($contact->web_id) {
            $web = Web::find($contact->web_id);
        } else {
            $web = Web::where('team_id', $contact->team_id)->first();
        }

        $this->source = [
            'site_name' => $web->name,
            'type' => '网站'
        ];

        if (isset($contact->package['referrer'])) {
            $source = parse_source($contact->package['referrer']);
            if (is_array($source)) {
                $this->source = array_merge($source, [
                    'site_name' => $web->name,
                    'type' => '网站'
                ]);
            }
        }
    }

    public function parseVoip($contact)
    {
        $location = PhoneLocation::find($contact->phone);
        $this->source = [
            'type' => '电话',
            'number' => $contact->phone,
            'location' => is_array($location) ? sprintf('%s %s', $location['2'], $location[3]) : ''
        ];
    }

    public function parseEmail($contact)
    {
        $this->source = [
            'type' => '邮件',
            'email' => $contact->email
        ];
    }

    public function parseWeibo($contact)
    {
        $weibo = Weibo::find($contact->weibo_id);
        $this->source = [
            'type' => '微博',
            'name' => $weibo ? $weibo->name : '',
            'url' => $weibo ? 'https://weibo.com/' . $weibo->weibo_id : ''
        ];
    }

    public function parseWechat($contact)
    {
        $wechat = Wechat::find($contact->contact_id);
        $this->source = [
            'type' => '微信',
            'name' => $wechat ? $wechat->name : ''
        ];
    }

    public function toArray()
    {
        return $this->source;
    }
}