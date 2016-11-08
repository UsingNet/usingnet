<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bill extends Model
{
    const TYPE_AGENT_VOIP = 'AGENT_VOIP';
    const TYPE_AGENT_EMAIL = 'AGENT_MAIL';
    const TYPE_TASK_MAIL = 'TASK_MAIL';
    const TYPE_TASK_SMS = 'TASK_SMS';
    const TYPE_TASK_VOIP = 'TASK_VOIP';
    const TYPE_NEW_PLAN = 'NEW_PLAN';
    const TYPE_UPDATE_PLAN = 'UPDATE_PLAN';
    const TYPE_RENEWALS_PLAN = 'RENEWALS_PLAN';
    const TYPE_TASK_VOIP_STAFF = 'TASK_VOIP_STAFF';
    const TYPE_RECHARGE = 'RECHARGE';

    protected $table = 'bill';
    protected $fillable = ['team_id', 'type', 'money', 'remark', 'object_id'];
    protected $appends = ['type_text'];
    protected $casts = [
        'id' => 'integer',
        'team_id' => 'integer'
    ];

    public function getTypeTextAttribute()
    {
        $types = [
            self::TYPE_AGENT_VOIP => '客服电话',
            self::TYPE_AGENT_EMAIL => '客服邮件',
            self::TYPE_TASK_SMS => '任务短信',
            self::TYPE_TASK_MAIL => '任务邮件',
            self::TYPE_TASK_VOIP => '自动任务电话',
            self::TYPE_NEW_PLAN => '新购套餐',
            self::TYPE_UPDATE_PLAN => '升级套餐',
            self::TYPE_RENEWALS_PLAN => '续费套餐',
            self::TYPE_TASK_VOIP_STAFF => '客服任务电话',
            self::TYPE_RECHARGE => '充值'
        ];

        return isset($types[$this->type]) ? $types[$this->type] : null;
    }
}
