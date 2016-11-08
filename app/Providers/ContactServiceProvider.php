<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Observers\ContactObserver;
use App\Models\Contact;



class ContactServiceProvider extends ServiceProvider
{
    public function boot()
    {
        Contact::observe(new ContactObserver());
    }

    public function register()
    {
        //
    }
}