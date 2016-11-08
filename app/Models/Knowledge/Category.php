<?php

namespace App\Models\Knowledge;

use Jenssegers\Mongodb\Eloquent\Model;

class Category extends Model
{
    protected $connection = 'mongodb';
    protected $table = 'knowledge_category';
    protected $fillable = ['team_id', 'title', 'parent_id', 'description'];
    protected $casts = [
        'team_id' => 'integer'
    ];

    public function children()
    {
        return $this->hasMany(Category::class, 'parent_id');
    }
}