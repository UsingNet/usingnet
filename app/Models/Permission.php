<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{

    protected $table = 'permission';
    protected $fillable = ['team_id', 'name', 'slug'];


    public static function getAll() {
        return [
            [
                'id' => 1,
                'name' => '历史',
                'slug' => 'history',
                'used' => false,
            ],
            [
                'id' => 2,
                'name' => '统计',
                'slug' => 'statistics',
                'used' => false,
            ],
            [
                'id' => 3,
                'name' => '客户',
                'slug' => 'contact',
                'used' => false,
            ],
            [
                'id' => 4,
                'name' => '应用',
                'slug' => 'appstore',
                'used' => false
            ],
            [
                'id' => 5,
                'name' => '设置',
                'slug' => 'setting',
                'used' => false,
            ]
        ];
    }

}
