<?php

namespace App\Models\Sms;

use Jenssegers\Mongodb\Eloquent\Model;

class Record extends Model
{
    protected $connection = 'mongodb';
    protected $table = 'sms_record';
    protected $fillable = ['msg', 'phone', 'team_id', 'contact_id', 'status', 'message_id'];
}
