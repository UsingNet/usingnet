<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateOrderTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //
        Schema::create('order', function ($table) {
            $table->increments('id');
            $table->enum('status', ['OPEN', 'CLOSED']);
            $table->string('from');
            $table->string('to');
            $table->integer('team_id');
            $table->integer('user_id');
            $table->integer('contact_id');
            $table->integer('category_id');
            $table->char('type');
            $table->timestamps();
        });

        $orders = \DB::connection('mongodb')->table('order')->get();

        foreach ($orders as $order) {
            if (isset($order['user_id']) && isset($order['team_id'])) {
                $data = [
                    'user_id' => $order['user_id'],
                    'team_id' => $order['team_id'],
                    'contact_id' => $order['contact_id'],
                    'from' => $order['from'],
                    'to' => $order['to'],
                    'status' => $order['status'],
                    'type' => $order['type'],
                    'created_at' => Carbon::createFromTimestamp($order['created_at']->sec)->toDateTimeString(),
                    'updated_at' => Carbon::createFromTimestamp($order['updated_at']->sec)->toDateTimeString()
                ];
                \DB::connection('mysql')->table('order')->insert($data);
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
