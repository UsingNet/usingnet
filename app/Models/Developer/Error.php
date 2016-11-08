<?php

namespace App\Models\Developer;

use Jenssegers\Mongodb\Eloquent\Model;

class Error extends Model
{
    const TYPE_FRONTEND = 'FRONTEND';
    const TYPE_PLUGIN = 'PLUGIN';
    const TYPE_BACKEND = 'BACKEND';
    const STATUS_INIT = 'INIT';
    const STATUS_PENDING = 'PENDING';
    const STATUS_FINISH = 'FINISH';
    protected $connection = 'mongodb';
    protected $table = 'developer_error';
    protected $fillable = ['user_id', 'desc', 'type', 'content', 'status'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}