<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
| The public site is served by the Next.js frontend (see /frontend). This
| Laravel app is API-only, so this file just confirms the API is running.
*/

Route::get('/', function () {
    return response()->json([
        'service' => 'Abeekey Backend API',
        'status' => 'ok',
    ]);
});
