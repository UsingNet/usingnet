<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateQrocodeToAppstoreVoteConfig extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $configs = \App\Models\Appstore\VoteConfig::all();
        foreach ($configs as $config) {
            $renderer = new \BaconQrCode\Renderer\Image\Png();
            $renderer->setHeight(256);
            $renderer->setWidth(256);
            $renderer->setMargin(1);
            $writer = new \BaconQrCode\Writer($renderer);
            $path = storage_path(new \MongoDB\BSON\ObjectID() . '.png');
            $writer->writeFile('https://wx.usingnet.com/appstore/vote/upload/' . $config['app_id'], $path);
            $qrcode = \App\Services\Qiniu::upload(file_get_contents($path));
            $config->update(['qrcode' => $qrcode]);
            @unlink($path);
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
