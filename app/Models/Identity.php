<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Identity extends Model
{
    //
    const STATUS_INIT = 'INIT';
    const STATUS_FAIL = 'FAIL';
    const STATUS_CHECKING = 'CHECKING';
    const STATUS_SUCCESS = 'SUCCESS';

    protected $table = 'identity';
    protected $fillable = ['team_id', 'company_id', 'industry', 'organization_number','organization_certificate',
        'tax_number', 'tax_certificate', 'license_number', 'license_certificate', 'legal_person', 'telphone',
        'website', 'company_name', 'company_address', 'status', 'phone'];
    protected $casts = [
        'id' => 'integer',
        'team_id' => 'integer'
    ];

    public function team()
    {
        return $this->belongsTo(Team::class);
    }
}
