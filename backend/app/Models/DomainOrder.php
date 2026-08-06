<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DomainOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'transaction_id',
        'domain_name',
        'tld',
        'years',
        'cost_price',
        'sale_price',
        'currency',
        'status',
        'registrant',
        'connect_reseller_order_id',
        'failure_reason',
        'registered_at',
    ];

    protected function casts(): array
    {
        return [
            'registrant' => 'array',
            'cost_price' => 'decimal:2',
            'sale_price' => 'decimal:2',
            'registered_at' => 'datetime',
        ];
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