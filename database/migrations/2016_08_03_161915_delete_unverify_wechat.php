<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class DeleteUnverifyWechat extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $wechats = \App\Models\Setting\Wechat::all();
        foreach ($wechats as $wechat) {
            if ($wechat->verify_type_info != 0) {
                $wechat->delete();
            }
        }

        Schema::table('contact', function($table) {
            $table->string('nickname')->after('name');
        });

        $contacts = \App\Models\Contact::where('openid', '<>', '')->get();
        foreach ($contacts as $contact) {
            $contact->update(['nickname' => $contact->name]);
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
