<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderCategory extends Model
{
    protected $table = 'order_category';
    protected $fillable = ['team_id', 'order_id', 'title', 'order_count'];
    protected $casts = [
        'id' => 'integer',
        'team_id' => 'integer',
        'order_count' => 'integer'
    ];
}

