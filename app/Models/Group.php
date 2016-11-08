<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    protected $table = 'group';
    protected $fillable = ['name', 'team_id'];

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_group');
    }
}