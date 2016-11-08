<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddAvatarToContact extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $contacts = \App\Models\Contact::where('img', 'like', '%qlogo%')->get();
        foreach ($contacts as $contact) {
            $con = \App\Library\Curl::to($contact->img)->get();
            $url = \App\Services\Qiniu::upload($con, 'jpg');
            $contact->img = $url;
            $contact->save();
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
