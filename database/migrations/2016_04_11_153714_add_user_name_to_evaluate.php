<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddUserNameToEvaluate extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('evaluation', function ($table) {
            $table->string('user_name')->after('user_id');
        });

        $evaluations = \App\Models\Evaluation::all();

        foreach ($evaluations as $eval) {
            $user = \App\Models\User::find($eval->user_id);
            if ($user) {
                $eval->update(['user_name'  => $user->name]);
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
