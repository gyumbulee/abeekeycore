<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class HostingPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'disk_gb',
        'bandwidth_gb',
        'website_count',
        'email_accounts',
        'databases',
        'free_ssl',
        'features',
        'price_monthly',
        'price_annual',
        'currency',
        'php_version',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'features' => 'array',
            'free_ssl' => 'boolean',
            'is_active' => 'boolean',
            'price_monthly' => 'decimal:2',
            'price_annual' => 'decimal:2',
        ];
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function hostingOrders(): HasMany
    {
        return $this->hasMany(HostingOrder::class);
    }

    public static function generateUniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $i = 1;

        while (
            static::where('slug', $slug)
                ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = "{$base}-".++$i;
        }

        return $slug;
    }

    /**
     * The price for a given billing cycle — the only two valid values are
     * 'monthly' and 'annual' (enforced at the HostingOrder validation
     * layer, not here).
     */
    public function priceFor(string $billingCycle): float
    {
        return $billingCycle === 'annual' ? (float) $this->price_annual : (float) $this->price_monthly;
    }
}
