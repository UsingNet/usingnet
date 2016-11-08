<?php

namespace App\Models;

use App\Models\Setting\Web;
use DB;
use App\Library\Syslog;

use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
    const VOIP_UNOPEN = 'UNOPEN';
    const VOIP_PENDING = 'PENDING';
    const VOIP_OPEND = 'OPEND';

    const REDIS_PREFIX = 'usingnet:teaminfo:';


    protected $table = 'team';
    protected $fillable = ['name', 'token', 'callback', 'balance', 'logo', 'secret', 'user_id'];
    protected $casts = [
        'id' => 'integer',
        'user_id' => 'integer'
    ];

    public function notice()
    {
        return $this->hasOne(Setting\Notice::class);
    }

    public function plan()
    {
        return $this->hasOne(TeamPlan::class);
    }

    public function invite()
    {
        return $this->hasOne(Invite::class, 'invite_team_id');
    }

    public function mail()
    {
        return $this->hasOne(Setting\Mail::class);
    }

    public function sms()
    {
        return $this->hasOne(Setting\Sms::class);
    }

    public function wechat()
    {
        return $this->hasMany(Setting\Wechat::class);
    }

    public function voip()
    {
        return $this->hasOne(Setting\Voip::class);
    }

    public function worktime()
    {
        return $this->hasOne(Setting\Worktime::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function identity()
    {
        return $this->hasOne(Identity::class);
    }

    public function plugin()
    {
        return $this->hasOne(Setting\Plugin::class);
    }

    public function web()
    {
        return $this->hasOne(Setting\Web::class);
    }

    public function trade($amount)
    {
        DB::beginTransaction();
        try {
            $team = DB::table($this->getTable())->where('id', $this->id)->lockForUpdate()->first();
            if($amount + $team->balance < 0 && $amount < 0){
                throw new \Exception("Balance is no enough.");
            }
            DB::table($this->getTable())->where('id', $this->id)->increment('balance', $amount);
            DB::commit();
            Syslog::logger('PLAY')->addDebug('PLAY_FINSHED');
            return true;
        } catch (\Exception $e){
            DB::rollback();
            Syslog::logger('PLAY')->addCritical('PLAY_FAILD', [$e->getMessage()]);
            throw $e;
        }
    }

    public static function clearTeamInfoCache($team) {
        $prefix = self::REDIS_PREFIX;
        $ids = Web::where('team_id', $team->id)->lists('id')->toArray();
        array_push($ids, $team->token);
        foreach ($ids as $id) {
            $key = $prefix . $id;
            \Cache::forget($key);
        }
    }

    public static function getTeamInfo($team_token_or_web_setting_id){
        $key = self::REDIS_PREFIX . $team_token_or_web_setting_id;
        $team = \Cache::get($key);

        if (!$team) {
            if (preg_match('/[a-z]/', $team_token_or_web_setting_id)) {
                $team = Team::where('token', $team_token_or_web_setting_id)->first();
                if (!$team) {
                    return NULL;
                }
                $web = Web::where('team_id', $team->id)->first();
            } else {
                $web = Web::where('id', $team_token_or_web_setting_id)->first();
            }

            if (!$web) {
                return NULL;
            }
            $team = Team::find($web->team_id);
            if (!$team) {
                return NULL;
            }

            // im 插件设置
            $team->web = $web->toArray();
            $team->order = $web->order;
            $plan = !!intval($team->plan->plan->price);
            $team->plan = $plan;
            $team->status = 200;

            $onlines = agent_online($team->id);

            $team->online = count($onlines);
            $team->groups = [];
            $team->groups = Group::where('team_id', $team->id)->get();

            \Cache::put($key, $team, 10);
        }

        return $team;
    }
}
