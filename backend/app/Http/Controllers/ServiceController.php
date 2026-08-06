<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;

class ServiceController extends Controller
{
    /**
     * Return Abeekey's service catalogue.
     * Static for Phase 1 — can move to a database-backed model later
     * once the admin dashboard (CMS) is built.
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => [
                ['slug' => 'custom-software-development', 'name' => 'Custom Software Development', 'icon' => '💻'],
                ['slug' => 'web-mobile-development', 'name' => 'Web & Mobile App Development', 'icon' => '📱'],
                ['slug' => 'cloud-api-solutions', 'name' => 'Cloud & API Solutions', 'icon' => '☁️'],
                ['slug' => 'fintech-solutions', 'name' => 'FinTech Solutions', 'icon' => '🏦'],
                ['slug' => 'it-consulting-cybersecurity', 'name' => 'IT Consulting & Cybersecurity', 'icon' => '🛡️'],
                ['slug' => 'training-capacity-building', 'name' => 'Training & Capacity Building', 'icon' => '🎓'],
                ['slug' => 'ui-ux-design', 'name' => 'UI/UX Design', 'icon' => '🎨'],
                ['slug' => 'business-automation', 'name' => 'Business Automation', 'icon' => '⚙️'],
                ['slug' => 'database-design', 'name' => 'Database Design', 'icon' => '🗄️'],
            ],
        ]);
    }
}
