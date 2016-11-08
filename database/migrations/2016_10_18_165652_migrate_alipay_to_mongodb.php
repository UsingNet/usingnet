<?php

use App\Models\Payment;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class MigrateAlipayToMongodb extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $configs = \App\Models\Appstore\AlipayConfig::all();

        foreach ($configs as $config) {
            $c = \App\Models\Appstore\Alipay\Config::firstOrCreate([
                'team_id' => intval($config->team_id),
                'qrcode' => $config->qrcode,
                'img' =>  $config->img,
                'name' => $config->name
            ]);

            $pays = \App\Models\Appstore\Alipay::where('alipay_config_id', $config->id)->get();
            foreach ($pays as $pay) {
                $payment = Payment::create([
                    'type' => Payment::TYPE_ALIPAY,
                    'status' => $pay->status,
                    'fee' => $pay->money,
                ]);
                \App\Models\Appstore\Alipay\Alipay::firstOrCreate([
                    'config_id' => $c->_id,
                    'pay_id' => $payment->id
                ]);
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
