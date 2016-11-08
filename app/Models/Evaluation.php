<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Evaluation extends Model
{
    const REDIS_PREFIX = 'usingnet:evaluation:';
    const LEVEL_GOOD = 'GOOD';
    const LEVEL_GENERAL = 'GENERAL';
    const LEVEL_BAD = 'BAD';

    protected $table = 'evaluation';
    protected $fillable = ['user_id', 'user_name', 'contact_id', 'contact_name', 'level', 'content', 'team_id', 'order_id',
        'good', 'bad', 'general', 'evaluation_count'];
    protected $casts = [
        'id' => 'integer',
        'user_id' => 'integer',
        'team_id' => 'integer',
        'order_id' => 'integer'
    ];

    protected $appends = ['level_text'];

    public function levelToText()
    {
        $texts = [self::LEVEL_GOOD => '好评', self::LEVEL_GENERAL => '中评', self::LEVEL_BAD => '差评'];

        return isset($texts[$this->level]) ? $texts[$this->level] : null;
    }

    public function getLevelTextAttribute()
    {
        return $this->levelToText();
    }

    public function user() {
        return $this->belongsTo(User::class)->withTrashed();
    }

    public function contact() {
        return $this->belongsTo(Contact::class)->withTrashed();
    }

}
