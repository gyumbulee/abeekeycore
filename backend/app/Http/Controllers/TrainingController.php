<?php

namespace App\Http\Controllers;

use App\Models\TrainingApplication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TrainingController extends Controller
{
    /**
     * List Abeekey training programmes.
     *
     * Training fees are not published because programmes can be customised
     * based on audience, duration, delivery mode and class size.
     */
    public function courses(): JsonResponse
    {
        return response()->json([
            'data' => [
                [
                    'slug' => 'computer-digital-literacy',
                    'name' => 'Computer Fundamentals & Digital Literacy',
                    'category' => 'Digital Foundations',
                    'icon' => '??',
                    'level' => 'Beginner',
                    'description' => 'Build the essential computer and digital skills needed for modern work, study and business.',
                    'featured' => true,
                ],
                [
                    'slug' => 'microsoft-excel-data-analysis',
                    'name' => 'Microsoft Excel & Data Analysis',
                    'category' => 'Productivity & Data',
                    'icon' => '??',
                    'level' => 'Beginner to Intermediate',
                    'description' => 'Learn practical Excel skills for organising, analysing and presenting business data.',
                    'featured' => true,
                ],
                [
                    'slug' => 'advanced-excel-business-reporting',
                    'name' => 'Advanced Excel & Business Reporting',
                    'category' => 'Productivity & Data',
                    'icon' => '??',
                    'level' => 'Intermediate to Advanced',
                    'description' => 'Create advanced formulas, dashboards, reports and decision-ready business insights.',
                    'featured' => true,
                ],
                [
                    'slug' => 'graphic-design-canva',
                    'name' => 'Graphic Design with Canva',
                    'category' => 'Creative & Media',
                    'icon' => '??',
                    'level' => 'Beginner',
                    'description' => 'Create professional graphics, presentations, social content and marketing materials.',
                    'featured' => false,
                ],
                [
                    'slug' => 'social-media-management',
                    'name' => 'Social Media Management',
                    'category' => 'Marketing & Business',
                    'icon' => '??',
                    'level' => 'Beginner to Intermediate',
                    'description' => 'Plan, manage and grow professional social media presence for brands and organisations.',
                    'featured' => false,
                ],
                [
                    'slug' => 'digital-marketing',
                    'name' => 'Digital Marketing',
                    'category' => 'Marketing & Business',
                    'icon' => '??',
                    'level' => 'Beginner to Intermediate',
                    'description' => 'Learn practical digital marketing strategies for reaching customers and growing a business.',
                    'featured' => true,
                ],
                [
                    'slug' => 'wordpress-website-design',
                    'name' => 'Website Design with WordPress',
                    'category' => 'Web & Technology',
                    'icon' => '??',
                    'level' => 'Beginner to Intermediate',
                    'description' => 'Build, customise and manage professional websites using WordPress.',
                    'featured' => false,
                ],
                [
                    'slug' => 'web-development-fundamentals',
                    'name' => 'Web Development Fundamentals',
                    'category' => 'Web & Technology',
                    'icon' => '?????',
                    'level' => 'Beginner',
                    'description' => 'Learn the foundations of HTML, CSS, JavaScript and modern web development.',
                    'featured' => true,
                ],
                [
                    'slug' => 'business-process-automation',
                    'name' => 'Business Process Automation',
                    'category' => 'Business & Technology',
                    'icon' => '??',
                    'level' => 'Intermediate',
                    'description' => 'Identify repetitive processes and use digital tools to make operations faster and more efficient.',
                    'featured' => false,
                ],
                [
                    'slug' => 'ai-productivity-tools',
                    'name' => 'Artificial Intelligence & Productivity Tools',
                    'category' => 'Emerging Technology',
                    'icon' => '??',
                    'level' => 'Beginner to Intermediate',
                    'description' => 'Use modern AI tools responsibly to improve research, writing, productivity, analysis and workflows.',
                    'featured' => true,
                ],
                [
                    'slug' => 'cybersecurity-awareness',
                    'name' => 'Cybersecurity Awareness',
                    'category' => 'Security',
                    'icon' => '??',
                    'level' => 'Beginner',
                    'description' => 'Understand common cyber threats and practical ways to protect people, devices and organisations.',
                    'featured' => false,
                ],
                [
                    'slug' => 'cloud-computing-fundamentals',
                    'name' => 'Cloud Computing Fundamentals',
                    'category' => 'Cloud & Infrastructure',
                    'icon' => '??',
                    'level' => 'Beginner to Intermediate',
                    'description' => 'Understand cloud platforms, infrastructure, deployment models and modern digital infrastructure.',
                    'featured' => false,
                ],
                [
                    'slug' => 'database-fundamentals',
                    'name' => 'Database Fundamentals',
                    'category' => 'Web & Technology',
                    'icon' => '???',
                    'level' => 'Beginner to Intermediate',
                    'description' => 'Learn how databases are structured, queried and used to power digital applications.',
                    'featured' => false,
                ],
                [
                    'slug' => 'api-development-integration',
                    'name' => 'APIs & Digital Integration',
                    'category' => 'Web & Technology',
                    'icon' => '??',
                    'level' => 'Intermediate',
                    'description' => 'Understand APIs, integrations and how modern digital systems communicate with each other.',
                    'featured' => false,
                ],
                [
                    'slug' => 'freelancing-digital-entrepreneurship',
                    'name' => 'Freelancing & Digital Entrepreneurship',
                    'category' => 'Career & Entrepreneurship',
                    'icon' => '??',
                    'level' => 'Beginner',
                    'description' => 'Learn how to build a digital career, find opportunities and structure sustainable online services.',
                    'featured' => true,
                ],
                [
                    'slug' => 'ecommerce-online-business',
                    'name' => 'E-commerce & Online Business',
                    'category' => 'Business & Entrepreneurship',
                    'icon' => '??',
                    'level' => 'Beginner to Intermediate',
                    'description' => 'Learn the foundations of launching, managing and growing an online business.',
                    'featured' => false,
                ],
                [
                    'slug' => 'digital-project-management',
                    'name' => 'Digital Project Management',
                    'category' => 'Business & Management',
                    'icon' => '??',
                    'level' => 'Intermediate',
                    'description' => 'Learn practical methods for planning, coordinating and delivering technology projects.',
                    'featured' => false,
                ],
                [
                    'slug' => 'digital-transformation',
                    'name' => 'Technology & Digital Transformation for Organisations',
                    'category' => 'Business & Management',
                    'icon' => '??',
                    'level' => 'Professional',
                    'description' => 'Help teams understand, adopt and manage technology-driven organisational change.',
                    'featured' => true,
                ],
            ],
        ]);
    }

    /**
     * Store a new training enquiry/application.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'full_name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:150'],
            'phone' => ['required', 'string', 'max:30'],
            'course' => ['required', 'string', 'max:150'],
            'learning_goal' => ['nullable', 'string', 'max:2000'],
            'experience_level' => ['nullable', 'string', 'max:50'],
            'preferred_schedule' => ['nullable', 'string', 'max:100'],
            'delivery_mode' => ['nullable', 'string', 'max:50'],
            'preferred_batch' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $validated['payment_status'] = 'pending';

        $application = TrainingApplication::create($validated);

        return response()->json([
            'message' => 'Training enquiry received. Our team will contact you with the appropriate programme and delivery options.',
            'data' => $application,
        ], 201);
    }
}
