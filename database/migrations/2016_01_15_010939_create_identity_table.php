<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateIdentityTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //
        Schema::create('identity', function ($table) {
            $table->increments('id');
            $table->enum('status', ['CHECKING', 'SUCCESS'])->default('CHECKING');
            $table->integer('team_id');
            $table->string('company_name');
            $table->string('industry');
            $table->string('organization_number');
            $table->string('organization_certificate');
            $table->string('tax_number');
            $table->string('tax_certificate');
            $table->string('license_number');
            $table->string('license_certificate');
            $table->string('legal_person');
            $table->string('telphone');
            $table->string('website')->nullable();
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
        //
    }
}
