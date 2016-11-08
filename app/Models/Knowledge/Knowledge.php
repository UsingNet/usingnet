<?php

namespace App\Models\Knowledge;

use App\Models\User;
use Jenssegers\Mongodb\Eloquent\Model;

class Knowledge extends Model
{
    protected $connection = 'mongodb';
    protected $table = 'knowledge';
    protected $fillable = ['team_id', 'title', 'keywords', 'message', 'user_id', 'category_id'];
    protected $casts = [
        'team_id' => 'integer'
    ];

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}