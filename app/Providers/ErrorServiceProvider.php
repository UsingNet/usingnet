<?php

namespace App\Providers;

use App\Models\Developer\Error;
use App\Observers\ErrorObserver;
use Illuminate\Support\ServiceProvider;


class ErrorServiceProvider extends ServiceProvider
{
    public function boot()
    {
        Error::observe(new ErrorObserver);
    }

    public function register()
    {
        //
    }
}