<?php

namespace App\Models;

use Config;
use App\Models\Team;
use App\Services\Mail;
use App\Services\Sms;
use App\Services\Voip;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    const TYPE_MAIL = 'MAIL';
    const TYPE_SMS = 'SMS';
    const TYPE_VOICE_RECORD = 'VOIP_RECORD';
    const TYPE_VOICE_STAFF = 'VOIP_STAFF';
    const STATUS_INIT = 'INIT';
    const STATUS_COMPILE = 'COMPILE';
    const STATUS_FINISH = 'FINISH';
    const REDIS_KEY = 'usingnet_tasks';

    const STATUS_CONTACT_UNASSIGNED = 'UNASSIGNED';
    const STATUS_CONTACT_ASSIGNED = 'ASSIGNED';

    protected $table = 'task';
    protected $fillable = ['team_id', 'type', 'title', 'user_id', 'media_id', 'store', 'jobs', 'progress', 'status', 'start_time', 'end_time', 'reference'];
    protected $casts = [
        'id' => 'integer',
        'user_id' => 'integer',
        'media_id' => 'integer',
    ];

    public function assigners()
    {
        return $this->belongsToMany(\App\Models\User::class, 'task_user');
    }

    public function receivers($status = null)
    {
        $handler = $this->belongsToMany(\App\Models\Contact::class, 'task_contact');
        if ($status !== null) {
            $handler->where('status', $status);
        }

        return $handler;
    }

    public function media()
    {
        return $this->belongsTo(\App\Models\Media::class);
    }

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }

}
