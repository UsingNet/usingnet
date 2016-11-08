<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTablePhoneLocation extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('phone_location', function ($table) {
            $table->increments('id');
            $table->integer('phone')->index();
            $table->string('location')->index();
        });

        $handler = fopen(__DIR__ . '/phone.data', 'r');

        while (($line = fgets($handler)) !== false) {
            $line = preg_replace('/\s+/', ' ', $line);
            $pair = explode(' ', $line);
            $phone = $pair[0];
            $location = $pair[1] . ' ' . $pair[2];
            \DB::table('phone_location')->insert([
                'phone' => $phone,
                'location' => $location
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
