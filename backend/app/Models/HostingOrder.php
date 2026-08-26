<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HostingOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'hosting_plan_id',
        'transaction_id',
        'domain_order_id',
        'domain_name',
        'billing_cycle',
        'cost_price',
        'sale_price',
        'currency',
        'status',
        'site_user',
        'site_user_password',
        'database_name',
        'database_user',
        'database_password',
        'failure_reason',
        'provisioned_at',
        'expires_at',
        'expiry_reminders_sent',
    ];

    // site_user_password and database_password are deliberately excluded
    // from array/JSON output at the model level (not just relying on
    // controllers to omit them) so a future `HostingOrder::all()` or
    // accidental ->toArray() in an admin index endpoint can't leak them,
    // even encrypted.
    protected $hidden = ['site_user_password', 'database_password'];

    protected function casts(): array
    {
        return [
            'cost_price' => 'decimal:2',
            'sale_price' => 'decimal:2',
            // Laravel's 'encrypted' cast transparently encrypts on write /
            // decrypts on read using APP_KEY — never stored as plaintext.
            'site_user_password' => 'encrypted',
            'database_password' => 'encrypted',
            'provisioned_at' => 'datetime',
            'expires_at' => 'datetime',
            'expiry_reminders_sent' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(HostingPlan::class, 'hosting_plan_id');
    }

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    public function domainOrder(): BelongsTo
    {
        return $this->belongsTo(DomainOrder::class);
    }
}
