<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Observers\TeamObserver;
use App\Models\Team;

class TeamServiceProvider extends ServiceProvider
{
    public function boot()
    {
        Team::observe(new TeamObserver());
    }

    public function register()
    {
        //
    }
}
