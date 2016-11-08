<?php

namespace App\Models;

use DB;
use App\Library\IP;
use App\Library\Curl;
use App\Library\Syslog;
use App\Library\Weibo;
use App\Services\Qiniu;
use Gibson\Wechat\User;
use App\Models\Setting\Wechat as Account;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Mockery\CountValidator\Exception;
use MongoDB\BSON\ObjectID;

class Contact extends Model
{
    use SoftDeletes;

    const STATUS_CHATTING = 'CHATTING';
    const STATUS_VISITING = 'VISITING';

    // 微信用户 api
    protected $table = 'contact';
    protected $fillable = ['team_id', 'openid', 'track_id','extend_id', 'name', 'email', 'phone', 'extend', 'ip',
        'wechat_id', 'img', 'remark', 'package', 'weibo_id', 'weibo_user_id', 'web_id', 'unsubscribed', 'visit_date',
        'nickname', 'unionid', 'wechat_fingerprint'];
    protected $casts = [
        'id' => 'integer',
        'team_id' => 'integer'
    ];

    public function setExtendAttribute($value)
    {
        $this->attributes['extend'] = json_encode($value);
    }

    public function getExtendAttribute($value)
    {
        $extend = @json_decode($value, true);
        return $extend ? $extend : [];
    }

    public function setPackageAttribute($value)
    {
        /*
        if (isset($value['referrer']) && is_array($value['referrer'])) {
            $value['referrer'] = $value['referrer']['url'];
            if (isset($value['referrer']['name']) && $value['referrer']['name'] === '未知') {
                unset($value['referrer']);
            }
        }
        */
        $this->attributes['package'] = json_encode($value);
    }

    public function getPackageAttribute($value)
    {
        $package = @json_decode($value, true);
        if (!isset($package['referrer'])) {
            //$package['referrer'] = '';
        }
        return $package ? $package : [];
    }

    public function tags()
    {
        return $this->belongsToMany(\App\Models\Tag::class);
    }

    public function wechat()
    {
        return $this->belongsTo(\App\Models\Setting\Wechat::class);
    }

    public function tracks()
    {
        return $this->belongsToMany(\App\Models\Track::class);
    }

    /**
     * 创建联系人
     * im 根据 ip 创建
     * wechat 从 api 获取
     * 电话 根据号码地区创建
     * 邮件根据地址创建
     * 然后从客户的系统中获取更新
     * @param array $data
     * @param Team|null $team
     * @return array|object|static
     * @throws \Exception
     */
    public static function firstOrCreate(array $data, Team $team = null)
    {
        $data['team_id'] = $team->id;
        $condition = array_only($data, ['team_id', 'extend_id', 'openid', 'weibo_user_id', 'track_id', 'weibo_id', 'wechat_id']);
        if (!empty($data['extend_id'])) {
            $condition = [
                'team_id' => $team->id,
                'extend_id' => $data['extend_id']
            ];
        }

        DB::beginTransaction();
        try {
            $contact = DB::table('contact')->where($condition)
                ->whereNull('deleted_at')
                ->lockForUpdate()->first();

            // 新建联系人
            if (!$contact) {
                if (!empty($data['openid'])) {
                    $contact = self::createByWechat($data);
                } elseif (!empty($data['track_id'])) {
                    $contact = self::createByIp($data);
                } elseif (!empty($data['phone'])) {
                    $contact = self::createByPhone($data);
                } elseif (!empty($data['weibo_id'])){
                    $contact = self::createByWeibo($data);
                } else {
                    throw new \Exception('required openid OR track_id OR phone OR weibo_id');
                }
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollback();
            throw new Exception($e->getMessage());
        }

        if (!$contact instanceof Contact) {
            $contact = Contact::find($contact->id);
        }

        // 更新 UA & IP
        if (isset($_SERVER['HTTP_USER_AGENT'])) {
            $ua = $_SERVER['HTTP_USER_AGENT'] == 'Mozilla/4.0' ? 'micromessenger' : $_SERVER['HTTP_USER_AGENT'];
            if (is_array($contact->package)) {
                $contact->package = array_merge($contact->package, [
                    'user_agent' => $ua,
                ]);
                $package = [
                    'user_agent' => $ua
                ];
                if ($ua !== 'micromessenger') {
                    $contact->ip = get_ip();
                    $location = Ip::find($contact->ip);
                    $package['address'] = trim(implode(' ', array_unique($location)));
                }
                if (!isset($contact->package['from'])) {
                    $package['from'] = '';
                }
                if (isset($_GET['to']) && preg_match('/^\d+$/', $_GET['to'])) {
                    $web = Setting\Web::find($_GET['to']);
                    if ($web) {
                        $package['from'] = $web->name;
                    }
                }
                $contact->package = array_merge($contact->package, $package);
            }
        }

        // 更新 track id
        if (isset($data['track_id']) && $data['track_id'] !== $contact->track_id && !Contact::where('track_id', $data['track_id'])->count()) {
            $contact->update(['track_id' => $data['track_id']]);
            $contact->track_id = $data['track_id'];
        }

        // 更新访问时间 & referrer
        if ($contact->visit_date != date('Y-m-d')) {
            $contact->visit_date = date('Y-m-d');
            if (isset($data['track_id']))  {
                $condition = [
                    'track_id' => $data['track_id'],
                    'team_id' => $data['team_id'],
                    'date' => date('Y-m-d')
                ];
                $track = Track::where($condition)
                    ->orderBy('_id', 'ASC')
                    ->first();
                if ($track) {
                    $contact->package = array_merge($contact->package, [
                        'referrer' => $track->referrer
                    ]);
                }
            }
        }

        if (isset($data['user_info']) && is_array($data['user_info'])) {
            $contact->fill($data['user_info']);
        }

        if (isset($data['web_id']) && $contact->web_id != $data['web_id']) {
            $contact->web_id = $data['web_id'];
        }

        if (isset($data['wechat_id']) && $contact->wechat_id != $data['wechat_id']) {
            $contact->wechat_id = $data['wechat_id'];
        }

        if (isset($data['weibo_id']) && $contact->weibo_id != $data['weibo_id']) {
            $contact->weibo_id = $data['weibo_id'];
        }

        $contact->save();
        return $contact;
    }

    /**
     * 根据浏览器跟踪信息创建联系人
     * @param $data
     * @return array
     */
    public static function createByIp($data)
    {
        if (isset($data['ip'])) {
            $ip = $data['ip'];
        } else {
            $ip = get_ip();
        }

        $location = IP::find($ip);
        $name = '访客';
        $address = '未知地区';
        $contact = null;

        if (is_array($location)) {
            $name = trim($location[1] . ' ' . $location[2]);
            $address = trim(implode(' ', array_unique($location)));
        }

        $number = (Contact::where('name', 'like', "{$name}%")->where('team_id', $data['team_id'])->count()) + 1;
        $contact = Contact::Create([
            'name' => $name . '#' . $number,
            'track_id' => $data['track_id'],
            'team_id' => $data['team_id'],
            'package' => [
                'user_agent' => isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : '',
                'address' => $address,
            ],
            'ip' => $ip,
        ]);

        if (isset($data['user_info']) && is_array($data['user_info'])) {
            $contact->fill($data['user_info']);
            $contact->save();

            if (isset($data['user_info']['tags']) && is_array($data['user_info']['tags'])) {
                $tagIds = [];
                foreach ($data['user_info']['tags'] as $tag) {
                    if (is_string($tag)) {
                        $tag = Tag::firstOrCreate(['name' => $tag]);
                        array_push($tagIds, $tag->id);
                    }
                }
                if (!empty($tagIds)) {
                    $contact->tags()->sync($tagIds);
                }
            }
        }

        if (!empty($data['track_id'])) {
            // 合并访客登陆前的操作
            $nobody = Contact::where(['team_id' => $data['team_id'], 'track_id' => $data['track_id']])
                ->where('id', '<>', $contact->id)
                ->first();
            if ($nobody) {
                Order::where('contact_id', $nobody->id)->update(['contact_id' => $contact->id]);
                Visit::where('contact_id', $nobody->id)->update(['contact_id' => $contact->id]);
            }
        }

        return $contact;
    }

    /**
     * 根据手机号码创建联系人
     * @param $data
     * @return object
     */
    public static function createByPhone($data)
    {
        $name = '访客';
        $address = '未知地区';

        $location = \Easthing\PhoneLocation::find($data['phone']);
        if ($location) {
            $name = implode(' ', array_unique([$location[2], $location[3]]));
            $address = $name;
        }
        $number = (Contact::where('name', 'like', "{$name}%")->where('team_id', $data['team_id'])->count()) + 1;
        $contact = Contact::create([
            'name' => $name . '#' . $number,
            'phone' => $data['phone'],
            'team_id' => $data['team_id'],
            'email' => isset($data['email']) ? $data['email'] : null,
            'track_id' => isset($data['email']) ? $data['email'] : null,
            'package' => ['html' => '', 'user_agent' => '', 'address' => $address]
        ]);

        return $contact;
    }

    /**
     * 从微信获取联系人
     * @param $data
     * @return array
     */
    public static function createByWechat($data)
    {
        $account = Account::find($data['wechat_id']);
        $user = new User($account->getAccessToken());

        try {
            $userInfo = $user->get($data['openid']);
        } catch (\Exception $e) {
            Syslog::logger('CONTACT')->addCritical('GET_WECHAT_USER_ERROR', $e->getTrace());
            throw new \Exception($e->getTrace());
        }

        $avatar = '//o1hpnn7d6.qnssl.com/default-avatar.png';
        if ($userInfo->headimgurl) {
            $avatar = Qiniu::upload(Curl::to($userInfo->headimgurl)->get());
        }

        $address = sprintf('%s %s', $userInfo->province, $userInfo->city);
        $fingerprint  = md5(Curl::to($userInfo->headimgurl)->get() . $userInfo->nickname);

        $contact = Contact::where('team_id', $data['team_id'])
            ->where('wechat_fingerprint', $fingerprint)
            ->first();

        if ($contact) {
            $contact->wechat_id = $data['wechat_id'];
            $contact->openid = $userInfo->openid;
            $contact->save();
        } else {
            $contact = Contact::create([
                'img' => $avatar,
                'team_id' => $data['team_id'],
                'openid' => $userInfo->openid,
                'unionid' => $userInfo->unionid,
                'track_id' => new ObjectID(),
                'name' => $userInfo->nickname,
                'nickname' => $userInfo->nickname,
                'wechat_id' => $data['wechat_id'],
                'remark' => $userInfo->remark,
                'wechat_fingerprint' => $fingerprint,
                'package' => ['address' => $address, 'user_agent' => 'micromessenger']
            ]);
        }

        return $contact;
    }

    /**
     * 从 weibo 创建用户
     */
    public static function createByWeibo($data)
    {
        $weibo = \App\Models\Setting\Weibo::find($data['weibo_id']);
        $weibo = new Weibo($weibo->access_token);
        $user = $weibo->getUserInfo($data['weibo_user_id']);
        if (isset($user['error_code'])) {
            throw new \Exception('授权失败');
        }
        if ($user) {
            $img = $user['avatar_large'];
            $img = Qiniu::upload(Curl::to($img)->get());
            return parent::create([
                'img' => $img,
                'name' => $user['name'],
                'nickname' => $user['name'],
                'team_id' => $data['team_id'],
                'weibo_id'=> $data['weibo_id'],
                'weibo_user_id' => $data['weibo_user_id'],
                'package' => [
                    'referrer' => 'https://weibo.com/' . $data['weibo_user_id'],
                    'address' => $user['location']
                ]
            ]);
        }

        return false;
    }

    /**
     * 从用户 API 中获取数据
     * @param Team $team
     * @param array $data
     * @return mixed
     * @internal param $callback
     */
    public static function getByCallback(Array $data = array(), Team $team)
    {
        $userInfo = [];
        $callback = $team->plugin->callback;
        $data = array_filter(array_only($data, ['extend_id', 'openid', 'phone', 'email']));
        $params['nonce'] = rand(100000, 999999);
        $params['timestamp'] = time();

        $tmpArr = array_merge($params, $data);
        $tmpArr['url'] = $callback;
        $tmpArr['token'] = $team->plugin->secret;

        $params['signature'] = generate_signature($tmpArr);
        $url = $callback . (stripos($callback, '?') === false ? '?' : '&') . http_build_query($params);

        $json = Curl::to($url)->withData($data)->post();
        Syslog::logger('CONTACT')->addDebug('GET_CONTACT_CALLBACK', [$json]);


        if ($json) {
            $array = @json_decode($json, true);
            if (isset($array['data']) && is_array($array['data'])) {
                $userInfo = array_only($array['data'], ['name', 'email', 'extend', 'tags', 'phone', 'extend_id']);
            } else {
                Syslog::logger('CONTACT')->addDebug('DATA_FORMAT_ERROR', $data);
                CustomLog::create([
                    'team_id' => $team->id,
                    'message' => sprintf('API: %s 返回数据格式不正确', $callback),
                    'data' => utf8_encode($json)
                ]);
            }
        } else {
             CustomLog::create([
                'team_id' => $team->id,
                'message' => sprintf('API: %s 返回数据格式不正确', $callback),
                'data' => $json
             ]);
        }

        $extend = [];
        if (isset($userInfo['extend']) && is_array($userInfo['extend'])) {
            foreach ($userInfo['extend'] as $item) {
                if (isset($item['key']) && isset($item['value'])) {
                    $extend[] = $item;
                }
            }
        }

        $userInfo['extend'] = $extend;

        return $userInfo;
    }




}
