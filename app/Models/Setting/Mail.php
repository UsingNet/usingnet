<?php

namespace App\Models\Setting;

use App\Services\Mail as Service;
use Illuminate\Database\Eloquent\Model;
use MongoDB\Driver\Server;

class Mail extends Model
{
    const REDIS_PREFIX = 'usingnet:mail:';

    const MODE_EXPRESS = 'EXPRESS';
    const MODE_ENCRYPTION = 'ENCRYPTION';
    const STATUS_INIT = 'INIT';
    const STATUS_SUCCESS = 'SUCCESS';

    protected $table = 'setting_mail';
    protected $fillable = ['team_id', 'email', 'password', 'imap', 'imap_mode', 'smtp', 'smtp_mode', 'imap_port', 'smtp_port', 'status'];
    protected $casts = [
        'id' => 'integer',
        'team_id' => 'integer'
    ];

    public function team()
    {
        return $this->belongsTo(\App\Models\Team::class);
    }
}
