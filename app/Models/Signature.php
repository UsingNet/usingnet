<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Signature extends Model
{

    const STATUS_CHECKING = 'CHECKING';
    const STATUS_FAIL = 'FAIL';
    const STATUS_SUCCESS = 'SUCCESS';

    protected $table = 'sms_signature';
    protected $fillable = ['team_id','status', 'signature'];
    protected $casts = [
        'id' => 'integer',
        'team_id' => 'integer'
    ];
}