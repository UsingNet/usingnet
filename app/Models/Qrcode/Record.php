<?php

namespace App\Models\Qrcode;

use App\Models\Contact;
use Jenssegers\Mongodb\Eloquent\Model;

class Record extends Model
{
    protected $connection = 'mongodb';

    const TYPE_SUBSCRIBE = 'SUBSCRIBE';
    const TYPE_SCAN = 'SCAN';

    protected $table = 'qrcode_record';
    protected $fillable = ['team_id', 'contact_id', 'qrcode_id', 'type', 'action'];

    public function contact()
    {
        return $this->belongsTo(Contact::class)->withTrashed();
    }
}
