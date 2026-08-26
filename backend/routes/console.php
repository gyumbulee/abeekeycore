<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
|--------------------------------------------------------------------------
| Scheduled Tasks
|--------------------------------------------------------------------------
| Requires a real cron entry on the server pointing at the Laravel
| scheduler, since nothing runs this automatically otherwise:
|   * * * * * cd /path-to-app && php artisan schedule:run >> /dev/null 2>&1
| (Production runs under PM2, not cron directly — add this as a system
| crontab entry regardless; PM2 manages the app process, not scheduled
| jobs.)
*/
Schedule::command('domains:send-expiry-reminders')
    ->dailyAt('08:00')
    ->timezone('Africa/Lagos')
    ->withoutOverlapping();

Schedule::command('hosting:send-expiry-reminders')
    ->dailyAt('08:15')
    ->timezone('Africa/Lagos')
    ->withoutOverlapping();
