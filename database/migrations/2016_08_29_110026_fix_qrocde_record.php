<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class FixQrocdeRecord extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $qrcodes = \App\Models\Qrcode\Qrcode::get();
        foreach ($qrcodes as $qrcode) {
            $qrcode->subscribes = \App\Models\Qrcode\Record::where('qrcode_id', $qrcode->_id)->where('type', \App\Models\Qrcode\Record::TYPE_SUBSCRIBE)->count();
            $qrcode->scans = \App\Models\Qrcode\Record::where('qrcode_id', $qrcode->_id)->where('type', \App\Models\Qrcode\Record::TYPE_SCAN)->count();
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
