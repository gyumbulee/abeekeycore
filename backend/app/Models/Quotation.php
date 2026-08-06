<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Quotation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'quotation_request_id',
        'quotation_number',
        'title',
        'amount_total',
        'currency',
        'status',
        'valid_until',
        'items',
    ];

    protected function casts(): array
    {
        return [
            'valid_until' => 'date',
            'items' => 'array',
            'amount_total' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function quotationRequest(): BelongsTo
    {
        return $this->belongsTo(QuotationRequest::class);
    }
}