<?php

namespace App\Models\Setting;

use Carbon;
use Illuminate\Database\Eloquent\Model;

class Worktime extends Model
{
    protected $table = 'setting_worktime';
    protected $fillable = ['worktime', 'workday', 'offworkday', 'team_id'];
    protected $casts = [
        'id' => 'integer',
        'team_id' => 'integer'
    ];

    public function invild()
    {
        if (!$this->worktime || !$this->workday) {
            return false;
        }

        $date = strtotime(date('Y-m-d'));
        $holiday = Holiday::where('date', $date)->first();
        if ($holiday) {
            return $holiday->work;
        }

        $worktimes = explode('-', $this->worktime);
        $begin = Carbon::createFromTimestamp(strtotime(date('Y-m-d ') . $worktimes[0]));
        $end = Carbon::createFromTimestamp(strtotime(date('Y-m-d ') . $worktimes[1]));
        if (!Carbon::createFromTimestamp(time())->between($begin, $end)) {
            return true;
        }

        $workWeekDays = explode(',', $this->workday);
        if (!in_array(date('w'), $workWeekDays)) {
            return true;
        }

        return false;
    }
}
