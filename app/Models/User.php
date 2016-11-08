<?php

namespace App\Models;

use App\Models\Setting\Holiday;
use DB;
use Illuminate\Auth\Authenticatable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Foundation\Auth\Access\Authorizable;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Contracts\Auth\Access\Authorizable as AuthorizableContract;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;

class User extends Model implements AuthenticatableContract,
                                    AuthorizableContract,
                                    CanResetPasswordContract
{
    use Authenticatable, Authorizable, CanResetPassword, SoftDeletes;

    const STATUS_INIT = 'INIT';
    const STATUS_ACTIVE = 'ACTIVE';
    const ROLE_MASTER = 'MASTER';
    const ROLE_MANAGE = 'MANAGE';
    const ROLE_MEMBER = 'MEMBER';

    protected $table = 'user';
    protected $fillable = ['name', 'status', 'role', 'email', 'token', 'team_id', 'job_number', 'password', 'extend',
        'img', 'openid', 'auto_offline', 'offline_time', 'phone'];
    protected  $dates = ['deleted_at'];
    protected $hidden = ['password', 'remember_token'];
    protected $appends = ['role_name'];
    protected $casts = [
        'id' => 'integer',
        'team_id' => 'integer',
        'auto_offline' => 'boolean',
        'offline_time' => 'integer',
    ];

    public function voip()
    {
        return $this->hasOne(\App\Models\Voip::class);
    }

    public function getRoleNameAttribute()
    {
        $roles = [
            'MASTER' => '超级管理员',
            'MANAGE' => '管理员',
            'MEMBER' => '客服',
        ];

        return isset($roles[$this->role]) ? $roles[$this->role] : '';
    }

    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    public function tags()
    {
        return $this->belongsToMany(\App\Models\Tag::class, 'user_tag');
    }

    public function setPasswordAttribute($password) {
        $this->attributes['password'] = bcrypt($password);
    }

    public function setExtendAttribute($value) {
        if (is_array($this->extend)) {
            $value = array_merge($this->extend, $value);
        }
        $this->attributes['extend'] = json_encode($value);
    }

    public function getExtendAttribute($value) {
        if (!$value) {
            return json_decode('{}');
        }

        $extend = @json_decode($value, true);
        return is_array($extend) ? $extend : json_decode('{}');
    }

    /**
     * 创建　voip 账号
     */
    public function createVoipAccount()
    {
        $voip = new \App\Services\Voip();
        $result = $voip->CreateSubAccount($this->token);
        if ($result['statusCode'] == 000000) {
            \App\Models\Voip::create([
                'user_id' => $this->id,
                'account_id' => $result['SubAccount']['subAccountSid'],
                'account_token' => $result['SubAccount']['subToken'],
                'voip_id' => $result['SubAccount']['voipAccount'],
                'voip_pwd' => $result['SubAccount']['voipPwd']
            ]);
        }
    }

    /**
     * 关闭 voip 账号
     */
    public function closeVoipAccount()
    {
        $voip = new \App\Services\Voip();
        if ($this->voip) {
            $voip->closeSubaccount($this->voip->account_id);
            $this->voip->delete();
        }
    }

    /**
     *  创建阵列
     */
    public function createVoipQueue()
    {
        $voip = new \App\Services\Voip;
        $params = $this->getVoipQueueParams();
        return $voip->createQueue($params);
    }

    public function updateVoipQueue()
    {
        $voip = new \App\Services\Voip;
        $params = $this->getVoipQueueParams();
        return $voip->modifyQueue($params);
    }

    /**
     * 删除阵列
     */
    public function delVoipQueue()
    {
        $voip = new \App\Services\Voip;
        return $voip->delQueue($this->id);
    }

    private function getVoipQueueParams()
    {
        $media = Media::find($this->team->voip->offworkprompt);
        $woktime = \App\Models\Setting\Worktime::where('team_id', $this->team_id)->first();
        $weeks = [1,2,3,4,5,6,7];
        $offworkdays = array_diff($weeks, explode(',', $woktime->workday));
        $weeks = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri','Sat' ,'Sun'];
        $offworkweeks = [];

        $holiday = Holiday::where('team_id', $woktime->team_id)
            ->where('date', strtotime(date('Y-m-d')))
            ->first();

        foreach ($offworkdays as $day) {
            $offworkweeks[] = $weeks[$day - 1];
        }

        $offworkHoliday = [];
        if ($holiday) {
            if ($holiday->work) {
                $offworkweeks = array_filter($offworkweeks, function ($item) use ($holiday) {
                    return $item !== date('D', strtotime($holiday->date));
                });
            }  else {
                array_push($offworkHoliday, date('Y-m-d', $holiday->date));
            }
        }

        $params = [
            'queuetype' => $this->id,
            'typedes' => 'desc',
            'worktime' => $woktime->worktime,
            'offworkprompt' => isset($media->content) ? $media->content : '',
            'offworkdate' => implode(':', $offworkHoliday),
            'offworkweekday' => implode('#', $offworkweeks),
        ];

        return $params;
    }

    public static function assign() {
    }
}
