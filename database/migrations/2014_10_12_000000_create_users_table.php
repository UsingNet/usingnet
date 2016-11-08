<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('user', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name')->nullable();
            $table->enum('status', ['INIT', 'ACTIVE'])->default('INIT');
            $table->enum('role', ['MASTER','MANAGE', 'MEMBER'])->default('MEMBER');
            $table->unique('email');
            $table->integer('team_id');
            $table->string('job_number')->nullable();
            $table->string('password', 60);
            $table->rememberToken();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('user');
    }
}
