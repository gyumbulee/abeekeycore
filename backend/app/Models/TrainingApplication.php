<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrainingApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'full_name',
        'email',
        'phone',
        'course',
        'learning_goal',
        'experience_level',
        'preferred_schedule',
        'delivery_mode',
        'preferred_batch',
        'notes',
        'payment_status',
    ];
}