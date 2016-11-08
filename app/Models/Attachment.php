<?php

namespace App\Models;

use Jenssegers\Mongodb\Eloquent\Model;

class Attachment extends Model
{
    const FORMAT_MESSAGE = 'MESSAGE';
    const FORMAT_CERTIFICATE = 'CERTIFICATE';
    const FORMAT_OTHER = 'OTHER';

    protected $connection = 'mongodb';
    protected $table = 'attachments';
    protected $fillable = ['user_id', 'team_id', 'src', 'ref', 'format'];
    protected $casts = [
        'team_id' => 'integer'
    ];
}
