<?php
/**
 * 代客管理
 */

namespace App\Models;

use Jenssegers\Mongodb\Eloquent\Model;

class CustomerManage extends Model
{
    protected $connection = 'mongodb';
    protected $table = 'customer_manage';
    protected $fillable = ['team_id', 'start_at', 'end_at', 'remark', 'info'];

    public function team() {
        return $this->belongsTo(Team::class);
    }

    public static function getManager() {
        return Team::find(env('MANAGE_TEAM_ID'));
    }

    public static function inCustomers($teamId)
    {
        return CustomerManage::where('team_id', intval($teamId))->first();
    }

    public static function getCustomerIds()
    {
        return CustomerManage::lists('team_id')->toArray();
    }

    public static function getCustomers()
    {
        $teamIds = self::getCustomerIds();
        return Team::whereIn('id', $teamIds)->get();
    }

    public static function isManager($teamId)
    {
        return $teamId == env('MANAGE_TEAM_ID');
    }
}
