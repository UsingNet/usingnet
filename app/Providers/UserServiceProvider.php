<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\User;
use App\Observers\UserObserver;

class UserServiceProvider extends  ServiceProvider
{
    public function boot()
    {
        User::observe(new UserObserver());
    }

    public function register()
    {
        //
    }
}