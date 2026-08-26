<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DomainRenewalOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'domain_order_id',
        'user_id',
        'transaction_id',
        'years',
        'sale_price',
        'currency',
        'status',
        'previous_expiry_at',
        'new_expiry_at',
        'failure_reason',
    ];

    protected function casts(): array
    {
        return [
            'sale_price' => 'decimal:2',
            'previous_expiry_at' => 'datetime',
            'new_expiry_at' => 'datetime',
        ];
    }

    public function domainOrder(): BelongsTo
    {
        return $this->belongsTo(DomainOrder::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }
}
