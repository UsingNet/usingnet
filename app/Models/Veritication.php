<?php

namespace App\Models;

use App\Services\Sms;
use Illuminate\Database\Eloquent\Model;

class Veritication extends Model
{
    const TYPE_MAIL = 'MAIL';
    const TYPE_PHONE = 'PHONE';

    protected $table = 'veritication_code';
    protected $fillable = ['type', 'user_id', 'source', 'code'];
    protected $casts = [
        'id' => 'integer',
        'user_id' => 'integer'
    ];
}
