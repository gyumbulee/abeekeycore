<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuotationRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_name',
        'company_name',
        'email',
        'phone',
        'service_interest',
        'project_summary',
        'budget_range',
        'status',
    ];

    protected $casts = [
        'status' => 'string',
    ];

    // status: new | reviewed | quoted | won | lost
    public function isNew(): bool
    {
        return $this->status === 'new';
    }
}
