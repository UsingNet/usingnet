<?php

namespace App\Models\Setting;

use Jenssegers\Mongodb\Eloquent\Model;

class Certificate extends  Model
{
    protected $connection = 'mongodb';

    protected $table = 'certificate';

    protected $fillable = ['attachment_id', 'content'];
}