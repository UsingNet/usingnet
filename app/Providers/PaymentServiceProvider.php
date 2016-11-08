<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

use App\Models\Payment;
use App\Observers\PaymentObserver;

class PaymentServiceProvider extends ServiceProvider
{
    public function boot()
    {
        Payment::observe(new PaymentObserver());
    }

    public function register()
    {
    }
}