<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddStatusToAlipay extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $pays = App\Models\Appstore\Alipay\Alipay::all();
        foreach ($pays as $pay) {
            $payment = \App\Models\Payment::where('id', $pay->pay_id)->first();
            if ($payment) {
                $pay->update(['status' => $payment->status]);
            }
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
