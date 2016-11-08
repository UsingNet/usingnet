<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class MigrateWepayMysqlToMongo extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $configs = \App\Models\Appstore\PayConfig::all();
        foreach ($configs as $config) {
            $c = \App\Models\Appstore\Wepay\Config::firstOrCreate([
                'app_id' => $config->app_id,
                'team_id' => intval($config->team_id),
                'name' => $config->name,
                'img' => $config->img,
                'qrcode' => $config->qrcode,
            ]);

            $pays = \App\Models\Appstore\Pay::where('pay_config_id', $config->id)->get();
            foreach ($pays as $pay) {
                $payment = \App\Models\Payment::firstOrCreate([
                    'fee' => $pay->money ,
                    'status' => $pay->status,
                ]);
                \App\Models\Appstore\Wepay\Wepay::firstOrCreate([
                    'status' => $pay->status,
                    'pay_id' => $payment->id,
                    'config_id' => $c->_id,
                    'contact_id' => $pay->contact_id,
                    'team_id' => intval($pay->team_id)
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
