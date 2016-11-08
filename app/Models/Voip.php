<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Voip extends Model
{
    protected $table = 'voip_account';
    protected $fillable = ['user_id', 'account_id', 'account_token', 'voip_id', 'voip_pwd', 'evaluation'];
    protected $casts = [
        'id' => 'integer',
        'user_id' => 'integer',
        'evaluation' => 'integer'
    ];

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }
}