<?php

namespace App\Models\Plugin;

use Jenssegers\Mongodb\Eloquent\Model;

class Winning extends Model
{

    const STATUS_INIT = 'INIT';
    const STATUS_FINISH = 'FINISH';

    protected $connection = 'mongodb';
    protected $table = 'plugin_winning';
    protected $fillable = ['token', 'remark', 'status', 'title', 'people'];

    public static function genToken()
    {
        $token = str_random(40);
        $exists = Winning::where('token', $token)->first();
        if ($exists) {
            $token = static::genToken();
        }

        return $token;
    }
}