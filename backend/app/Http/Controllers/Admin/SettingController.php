<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class SettingController extends Controller
{
    /**
     * Current effective value of every editable setting, plus whether it's
     * coming from a DB override or still falling back to the .env-backed
     * config default — so the admin UI can show what's actually in effect.
     */
    public function index()
    {
        return response()->json([
            'data' => [
                'domains' => [
                    'markup_percent' => $this->describe(
                        'domains.markup_percent',
                        (float) config('domains.markup_percent', 30)
                    ),
                    'usd_to_ngn_rate' => $this->describe(
                        'domains.usd_to_ngn_rate',
                        (float) config('domains.usd_to_ngn_rate', 1600)
                    ),
                    'tld_markup_overrides' => $this->describe(
                        'domains.tld_markup_overrides',
                        config('domains.tld_markup_overrides', [])
                    ),
                ],
            ],
        ]);
    }

    /**
     * Update one or more domain pricing settings. Only fields actually sent
     * are changed — omit a field to leave it untouched. Also busts the
     * cached TLD price catalog, since prices need recalculating against
     * the new markup/rate immediately rather than waiting out the normal
     * cache window.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'markup_percent' => ['nullable', 'numeric', 'min:0', 'max:500'],
            'usd_to_ngn_rate' => ['nullable', 'numeric', 'min:1'],
            'tld_markup_overrides' => ['nullable', 'array'],
            'tld_markup_overrides.*' => ['numeric', 'min:0', 'max:500'],
        ]);

        if (array_key_exists('markup_percent', $validated) && $validated['markup_percent'] !== null) {
            Setting::set('domains.markup_percent', (float) $validated['markup_percent']);
        }

        if (array_key_exists('usd_to_ngn_rate', $validated) && $validated['usd_to_ngn_rate'] !== null) {
            Setting::set('domains.usd_to_ngn_rate', (float) $validated['usd_to_ngn_rate']);
        }

        if (array_key_exists('tld_markup_overrides', $validated)) {
            // Normalize TLD keys to always have a leading dot, matching
            // ConnectResellerService's own normalization elsewhere.
            $normalized = [];
            foreach ($validated['tld_markup_overrides'] as $tld => $percent) {
                $tld = str_starts_with($tld, '.') ? strtolower($tld) : '.'.strtolower($tld);
                $normalized[$tld] = (float) $percent;
            }
            Setting::set('domains.tld_markup_overrides', $normalized);
        }

        Cache::forget('connectreseller_all_tld_prices');

        return $this->index();
    }

    protected function describe(string $key, mixed $envDefault): array
    {
        return [
            'value' => Setting::get($key, $envDefault),
            'source' => Setting::has($key) ? 'db' : 'env',
        ];
    }
}