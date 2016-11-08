<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePhraseTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('setting_phrase', function ($table) {
            $table->increments('id');
            $table->integer('team_id');
            $table->text('content');
            $table->timestamps();
        });

        $replies = \App\Models\Setting\QuickReply::all();

        foreach ($replies as $reply) {
            \App\Models\Setting\Phrase::create([
                'team_id' => $reply->team_id,
                'content' => $reply->content
            ]);
        }

        \DB::select(\DB::raw('alter table setting_quick_reply change team_id user_id int not null'));
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
