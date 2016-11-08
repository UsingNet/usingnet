<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class QrcodeScanRecordAddType extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $qrcodes = \App\Models\Qrcode\Qrcode::all();
        foreach ($qrcodes as $qrcode) {
            $records = \App\Models\Qrcode\Record::where('qrcode_id', intval($qrcode->_id))->orderBy('_id', 'desc')->get();
            $scans = 0;
            $subscribes = 0;
            $contacts = [];
            foreach ($records as $record) {
                $contacts[] = $record->contact_id;
                if (!in_array($contacts)) {
                    $subscribes++;
                    $record->type = \App\Models\Qrcode\Record::TYPE_SCAN;
                } else {
                    $scans++;
                    $record->type = \App\Models\Qrcode\Record::TYPE_SUBSCRIBE;
                }
                $record->save();
            }

            $qrcode->subscribes = $subscribes;
            $qrcode->scans = $scans;
            $qrcode->save();
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
}
