<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\Order;
use App\Observers\OrderObserver;


class OrderServiceProvider extends ServiceProvider
{
    public function boot()
    {
        Order::observe(new OrderObserver());
    }

    public function register()
    {
        //
    }
}