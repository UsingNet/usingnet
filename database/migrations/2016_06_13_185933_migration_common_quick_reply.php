<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class MigrationCommonQuickReply extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $phrases = \App\Models\Setting\Phrase::all();

        foreach ($phrases as $phrase) {
            \App\Models\Setting\QuickReply::create([
                'content' => $phrase->content,
                'type' => \App\Models\Setting\QuickReply::TYPE_COMMON,
                'team_id' => $phrase->team_id
            ]);
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
