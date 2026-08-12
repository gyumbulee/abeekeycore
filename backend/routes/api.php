<?php

use App\Http\Controllers\Admin\ClientController as AdminClientController;
use App\Http\Controllers\Admin\ContactController as AdminContactController;
use App\Http\Controllers\Admin\ContractController as AdminContractController;
use App\Http\Controllers\Admin\DomainController as AdminDomainController;
use App\Http\Controllers\Admin\InvoiceController as AdminInvoiceController;
use App\Http\Controllers\Admin\LeadController;
use App\Http\Controllers\Admin\TransactionController as AdminTransactionController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\DomainController;
use App\Http\Controllers\Portal\ContractController;
use App\Http\Controllers\Portal\DomainController as PortalDomainController;
use App\Http\Controllers\Portal\InvoiceController;
use App\Http\Controllers\Portal\PaymentController;
use App\Http\Controllers\Portal\QuotationController as PortalQuotationController;
use App\Http\Controllers\Portal\TransactionController as PortalTransactionController;
use App\Http\Controllers\QuotationController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\TrainingController;
use App\Http\Controllers\WebhookController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public API Routes — Abeekey Marketing Site (Phase 1)
|--------------------------------------------------------------------------
| These endpoints back the Next.js frontend. All are unauthenticated/public
| since Phase 1 has no client portal or login yet.
*/

Route::get('/services', [ServiceController::class, 'index']);

Route::post('/contact', [ContactController::class, 'store']);

Route::post('/quotation-requests', [QuotationController::class, 'store']);

Route::post('/training/applications', [TrainingController::class, 'store']);
Route::get('/training/courses', [TrainingController::class, 'courses']);

Route::get('/domains/search', [DomainController::class, 'search']);

/*
|--------------------------------------------------------------------------
| Payment Webhook (public — called by Flutterwave's servers directly)
|--------------------------------------------------------------------------
| Verified via the 'verif-hash' header against FLUTTERWAVE_WEBHOOK_HASH,
| not via Sanctum — this is a server-to-server call, not a browser session.
*/
Route::post('/webhooks/flutterwave', [WebhookController::class, 'flutterwave']);

/*
|--------------------------------------------------------------------------
| Auth Routes (Sanctum SPA — cookie-based, not Bearer tokens)
|--------------------------------------------------------------------------
| Frontend must first hit GET /sanctum/csrf-cookie (provided by Sanctum
| automatically) before calling register/login, and send requests with
| credentials: 'include'.
*/

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/auth/resend-otp', [AuthController::class, 'resendOtp']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    /*
    |----------------------------------------------------------------------
    | Client Portal Routes (Phase 2 — to be filled in next)
    |----------------------------------------------------------------------
    */
    Route::prefix('portal')->group(function () {
        Route::get('/invoices', [InvoiceController::class, 'index']);
        Route::get('/invoices/{id}', [InvoiceController::class, 'show']);

        Route::get('/quotations', [PortalQuotationController::class, 'index']);
        Route::get('/quotations/{id}', [PortalQuotationController::class, 'show']);
        Route::post('/quotations/{id}/respond', [PortalQuotationController::class, 'respond']);

        Route::get('/contracts', [ContractController::class, 'index']);
        Route::get('/contracts/{id}', [ContractController::class, 'show']);

        Route::post('/invoices/{id}/pay', [PaymentController::class, 'initiate']);
        Route::post('/payments/verify', [PaymentController::class, 'verify']);

        Route::get('/transactions', [PortalTransactionController::class, 'index']);
        Route::get('/transactions/{id}', [PortalTransactionController::class, 'show']);

        Route::get('/domains', [PortalDomainController::class, 'index']);
        Route::post('/domains', [PortalDomainController::class, 'store']);
        Route::post('/domains/verify', [PortalDomainController::class, 'verify']);
        Route::post('/domains/{id}/pay', [PortalDomainController::class, 'pay']);
    });

    /*
    |----------------------------------------------------------------------
    | Admin Routes (staff/admin only — Abeekey internal use)
    |----------------------------------------------------------------------
    */
    Route::prefix('admin')->middleware('admin')->group(function () {
        Route::get('/leads', [LeadController::class, 'index']);
        Route::get('/leads/{id}', [LeadController::class, 'show']);
        Route::post('/leads/{id}/convert', [LeadController::class, 'convert']);

        Route::get('/clients', [AdminClientController::class, 'index']);

        Route::get('/invoices', [AdminInvoiceController::class, 'index']);
        Route::post('/invoices', [AdminInvoiceController::class, 'store']);

        Route::get('/contracts', [AdminContractController::class, 'index']);
        Route::post('/contracts', [AdminContractController::class, 'store']);

        Route::get('/transactions', [AdminTransactionController::class, 'index']);

        Route::get('/domains', [AdminDomainController::class, 'index']);

        Route::get('/contacts', [AdminContactController::class, 'index']);
        Route::get('/contacts/{id}', [AdminContactController::class, 'show']);
        Route::post('/contacts/{id}/reply', [AdminContactController::class, 'reply']);
    });
});