<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    const STATUS_INIT = 'INIT';
    const STATUS_FAIL = 'FAIL';
    const STATUS_SUCCESS = 'SUCCESS';
    const STATUS_TIMEOUT = 'TIMEOUT';

    const TYPE_WEPAY = 'WEPAY';
    const TYPE_ALIPAY = 'ALIPAY';

    const MODE_PLUGIN = 'PLUGIN';
    const MODE_RECHARGE = 'RECHARGE';
    const MODE_PLAN = 'PLAN';

    const PAY_TIMEOUT = 3600;

    protected $table = 'payment';
    protected $fillable = ['status', 'type', 'fee', 'trade_no', 'mode', 'team_id', 'remark'];

    public function setRemarkAttribute($value)
    {
        $this->attributes['remark'] = json_encode($value);
    }

    public function getRemarkAttribute($value)
    {
        return json_decode($value, true);
    }
}
