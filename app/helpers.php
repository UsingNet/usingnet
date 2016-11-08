<?php

use App\Models\Message;
use App\Models\Setting\Assign;
use App\Services\Connect;
use App\Models\User;
use App\Models\Order;
use Illuminate\Support\Facades\Redis;


if (!function_exists('verify_signature'))
{
    function verify_signature($request, $token)
    {
        $error = null;
        if (!empty($request->get('nonce')) && !empty($request->get('timestamp')) && !empty($request->get('signature'))) {
            $key = 'usingnet:signature:nonce:' . $request->get('nonce');
            $redis = Redis::connection();
            if ($redis->get($key)) {
                $error = '请求过期';
            } else {
                $redis->setex($key, 300, 1);
                $signature = $request->get('signature');
                $url = $request->url() . (stripos($request->url(), '?') === false ? '?' : '&');
                $params = $request->all();
                unset($params['signature']);
                ksort($params);
                $baseStr = $url . http_build_query($params) . '$' . $token;
                $sign = sha1($baseStr);
                if ($signature !== $sign) {
                    $error = '验证失败';
                }
            }
        } else {
            $error = '缺少参数';
        }
        if ($error) {
            header("content-type:application/json;charset=utf8");
            $resp = [
                'success' => false,
                'msg' => $error
            ];
            exit(json_encode($resp));
        }
    }
}

if (!function_exists('generate_signature'))
{
    function generate_signature($params)
    {
        $url = $params['url'];
        unset($params['url']);
        $token = $params['token'];
        unset($params['token']);

        ksort($params);

        $url = $url. (stripos($url, '?') === false ? '?' : '&');
        $baseStr = $url . http_build_query($params) . '$' . $token;
        $sign = sha1($baseStr);

        return $sign;
    }
}


if (!function_exists('format_time'))
{
    /**
     * 格式化时间
     * @param $second
     * @return string
     */
    function format_time($second)
    {
        $second = intval($second);
        $formats = [3600 => '小时', 60 => '分钟', 0 => '秒'];
        $formatTime = '';

        foreach ($formats as $t => $format) {
            if ($second > $t) {
                if ($t == 0) {
                    $formatTime .= $second . $format;
                } else {
                    $time = intval($second / $t);
                    $second -= $time * $t;
                    $formatTime .= $time . $format;
                }
            }
        }

        if (empty($formatTime)) {
            $formatTime = '0 秒';
        }

        return $formatTime;
    }
}

if (!function_exists('agent_online'))
{
    /**
     * 返回在线客服
     * @param $teamId
     */
    function agent_online($teamId)
    {
        $connect = new Connect(Connect::PUSH_SERVER);
        $onlines = $connect->search_listener(['team_id' => $teamId]);
        $onlines = $onlines['listeners'];
        $agents = [];
        foreach ($onlines as $online) {
            $ids = array_fetch($agents, 'id');
            if (!in_array($online['id'], $ids)) {
                array_push($agents, $online);
            }
        }

        return $agents;
    }
}

if (!function_exists('replace_variable'))
{
    function replace_variable($content, $contact)
    {
        $replace = [
            '#name#' => isset($contact['name']) ? $contact['name'] : '',
            '#phone#' => isset($contact['phone']) ? $contact['phone'] : '',
            '#email#' => isset($contact['email']) ? $contact['email'] : '',
            '#date#' => date('Y-m-d'),
            '#time#' => date('H:i:s'),
            '#company#' => isset($contact['company']) ? $contact['company'] : ''
        ];

        foreach ($replace as $k => $v) {
            $content = str_replace($k, $v, $content);
        }
        return $content;
    }
}

if (!function_exists('get_ip'))
{
    function get_ip()
    {
        $client  = @$_SERVER['HTTP_CLIENT_IP'];
        $forward = @$_SERVER['HTTP_X_FORWARDED_FOR'];
        $remote  = @$_SERVER['REMOTE_ADDR'];

        if(filter_var($client, FILTER_VALIDATE_IP)) {
            $ip = $client;
        } elseif (filter_var($forward, FILTER_VALIDATE_IP)) {
            $ip = $forward;
        } else {
            $ip = $remote;
        }

        return $ip;
    }
}

if (!function_exists('assign_agent'))
{
    function assign_agent($contact, $type, $group = null)
    {
        $type = strtoupper($type);
        $assign = Assign::where('team_id', $contact->team_id)->first();
        $teamId = $contact->team_id;

        // 托管客户
        if (\App\Models\CustomerManage::where('team_id', intval($teamId))->first()) {
            $team = \App\Models\Team::find(env('MANAGE_TEAM_ID'));
            $teamId = $team->id;
            $users = agent_online($teamId);
        } else {
            $users = agent_online($teamId);
            // 分配上次接待的客服
            if ($assign->repeat) {
                $lastOrder = Order::where(['contact_id' => $contact->id, 'status' => Order::STATUS_CLOSED])
                    ->orderBy('id', 'desc')
                    ->first();
                if ($lastOrder) {
                    foreach ($users as $user) {
                        if ($user['id'] == $lastOrder->user_id) {
                            return $user;
                        }
                    }
                }
            }

            $groupId = [];
            if ($type == Message::TYPE_IM) {
                foreach ($assign->web as $web) {
                    if ($web['web_id'] == $contact->web_id) {
                        $groupId = $web['group_id'];
                    }
                }
                foreach ($assign['web_rule'] as $rule) {
                    if ($rule['url'] == $contact['url']) {
                        $groupId = $rule['groupId'];
                    }
                }
            }
            if ($type == Message::TYPE_WECHAT) {
                foreach ($assign['wechat'] as $wechat) {
                    if ($wechat['wechat_id'] == $contact->wechat_id)  {
                        $groupId = $wechat['group_id'];
                    }
                }
            }
            if ($type == Message::TYPE_WEIBO) {
                foreach ($assign['weibo'] as $weibo) {
                    if ($weibo['weibo_id'] == $contact->weibo_id) {
                        $groupId = $weibo['group_id'];
                    }
                }
            }
            if ($type == Message::TYPE_VOIP) {
                $groupId = $assign['voip'];
            }
            if ($type == Message::TYPE_MAIL) {
                $groupId = $assign['mail'];
            }

            if (!empty($group)) {
                $groupId = [$group->id];
            }

            if (!empty($groupId)) {
                $groupUserIds = \DB::table('user_group')

                    ->whereIn('group_id', $groupId)
                    ->lists('user_id');
                $groupUsers = [];
                foreach ($users as $user) {
                    if (in_array($user['id'], $groupUserIds)) {
                        $groupUsers[] = $user;
                    }
                }

                if (!empty($groupUsers)) {
                    $users = $groupUsers;
                }
            }
        }

        if (empty($users)) {
            $users = User::where('team_id', $teamId)->where('openid', '<>', '')->get()->toArray();
            if (empty($users)) {
                return null;
            }
        }

        // 分配给工单最少的用户
        if (count($users) > 1) {
            $userIds = array_fetch($users, 'id');
            $orders = Order::where('status', Order::STATUS_OPEN)
                ->whereIn('user_id', $userIds)
                ->get();
            foreach ($users as &$agent) {
                $agent['order'] = 0;
                foreach ($orders as $order) {
                    if ($order->user_id == $agent['id']) {
                        $agent['order']++;
                    }
                }
            }
            usort($users , function ($a, $b) {
                return $a['order'] > $b['order'];
            });
        }

        return $users[0];
    }
}

if (!function_exists('parse_source')) {
    function parse_source($url) {
        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            return null;
        }

        $href = $url;
        $url = urldecode($url);
        $name = $url;
        $keyword = '';

        if (preg_match('/baidu.com/', $url)) {
            $name = '百度搜索';
            $href = 'https://www.baidu.com/';
            if (preg_match('/w=0_10_(.*?)\//', $url, $match)) {
                $keyword = str_replace('+', ' ', $match[1]);
                $href .= '/s?wd=' . urlencode($keyword);
            }
        }

        if (preg_match('/so.com/', $url)) {
            $name = '360搜索';
            $href = 'https://www.so.com/';
            if (preg_match('/q=(.*?)&/', $url, $match)) {
                $keyword = str_replace('+', ' ', $match[1]);
                $href .= 's?q=' . urlencode($keyword);
            };
        }

        if (preg_match('/sogou.com/', $url)) {
            $name = '搜狗搜索';
            $href = 'https://www.sogou.com/';
            if (preg_match('/query=(.*?)$/', $url, $match)) {
                $keyword = str_replace('+', ' ', $match[1]);
                $href .= 'web?query=' . urlencode($keyword);
            }
        }

        if (preg_match('/bing.com/', $url)) {
            $name = '必应搜索';
            $href = 'https://www.bing.com/';
            if (preg_match('/q=(.*?)&/', $url, $match)) {
                $keyword = str_replace('+', ' ', $match[1]);
                $href .= 'search?q=' . urlencode($keyword);
            }
        }

        if (preg_match('/google.com/', $url)) {
            $name = '谷歌搜索';
            $href = 'https://www.google.com/';
            if (preg_match('/q=(.*?)&/', $url, $match)) {
                $keyword = str_replace('+', ' ', $match[1]);
                $href .= 'search?q=' . urlencode($keyword);
            }
        }

        if ($url === 'micromessenger') {
            $name = '微信';
            $href = 'javascript:;';
        }

        return [
            'name' => $name,
            'href' => $href,
            'keyword' => $keyword
        ];
    }
}

if (!function_exists('request_plugin')) {
    function request_plugin($method, $uri, $params)
    {
        $config = Config::get('plugin.' . $params['key']);
        $api = Config::get('plugin.base_url') . $uri . '?';
        ksort($params);
        $baseStr = $api . http_build_query($params) . '$' . $config['token'];
        $params['signature'] = sha1($baseStr);
        if ($method === 'GET') {
            $query = http_build_query($params);
            $api = $api . $query;
            $resp = \App\Library\Curl::to($api)->get();
        } else {
            $resp = \App\Library\Curl::to($api)->withData($params)->post();
        }

        return @json_decode($resp, true);
    }
}

if (!function_exists('plugin_login')) {
    function plugin_login($params)
    {
        if (isset($_GET['secret_key'])) {
            $params['secret_key'] = $_GET['secret_key'];
            $resp = request_plugin('GET', 'contactinfo', $params);
            return isset($resp['data']) ? $resp['data'] : null;
        }

        $loginUrl = Config::get('plugin.login');
        $params = [
            'token' => $params['token'],
            'app_id' => $params['app_id'],
            'referrer' => \Illuminate\Support\Facades\Request::fullUrl(),
        ];
        $loginUrl .= '?' . http_build_query($params);
        header('Location: ' . $loginUrl);
        exit;
    }
}
