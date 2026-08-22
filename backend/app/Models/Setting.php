<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

/**
 * A simple key-value settings store so admin-editable values (currently:
 * domain pricing) can be changed at runtime without touching .env or
 * redeploying. Reading falls back to whatever default the caller provides
 * (typically the existing config()/env() value) until an override is
 * actually saved here — so nothing behaves differently until an admin
 * deliberately changes something on the Settings page.
 */
class Setting extends Model
{
    protected $fillable = ['key', 'value'];

    protected function casts(): array
    {
        return [
            'value' => 'array',
        ];
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        return Cache::rememberForever("setting:{$key}", function () use ($key, $default) {
            $setting = static::where('key', $key)->first();

            return $setting ? $setting->value : $default;
        });
    }

    public static function set(string $key, mixed $value): void
    {
        static::updateOrCreate(['key' => $key], ['value' => $value]);
        Cache::forget("setting:{$key}");
    }

    public static function has(string $key): bool
    {
        return static::where('key', $key)->exists();
    }
}