<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'role',
        'permissions',
        'is_active',
        'password',
        'email_verified_at',
        'last_login_at',
        'last_login_ip',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'permissions' => 'array',
            'is_active' => 'boolean',
            'password' => 'hashed',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * The real access check, used by the `permission:{key}` middleware.
     * Admins always pass. Staff pass only if the key is in their granted
     * permissions array. 'users' and 'settings' are intentionally excluded
     * from what staff can ever be granted — see App\Support\Permissions —
     * so this always returns false for them unless the role is admin,
     * regardless of what's stored in the permissions column.
     */
    public function canAccess(string $permission): bool
    {
        if ($this->role === 'admin') {
            return true;
        }

        if (in_array($permission, ['users', 'settings'], true)) {
            return false;
        }

        return $this->role === 'staff' && in_array($permission, $this->permissions ?? [], true);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function quotations(): HasMany
    {
        return $this->hasMany(Quotation::class);
    }

    public function contracts(): HasMany
    {
        return $this->hasMany(Contract::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function domainOrders(): HasMany
    {
        return $this->hasMany(DomainOrder::class);
    }

    public function otps(): HasMany
    {
        return $this->hasMany(EmailOtp::class);
    }

    public function supportTickets(): HasMany
    {
        return $this->hasMany(SupportTicket::class);
    }

    public function blogPosts(): HasMany
    {
        return $this->hasMany(BlogPost::class, 'author_id');
    }
}