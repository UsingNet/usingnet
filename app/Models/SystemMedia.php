<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemMedia extends Model
{
    protected $table = 'system_media';
    protected $fillable = ['title', 'content', 'send', 'likes', 'views', 'refuses', 'type'];
    protected $casts = [
        'id' => 'integer',
    ];
}
