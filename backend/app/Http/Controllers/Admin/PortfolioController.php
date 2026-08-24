<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PortfolioProject;
use Illuminate\Http\Request;

class PortfolioController extends Controller
{
    /**
     * Validate that a URL:
     *
     * 1. Uses HTTP or HTTPS.
     * 2. Contains a valid domain with a TLD of at least 2 letters.
     *
     * Examples accepted:
     * - https://example.com
     * - https://www.example.com
     * - https://sub.example.co.uk
     * - https://abeekey.s3.eu-west-1.amazonaws.com/image.png
     *
     * Examples rejected:
     * - example.com
     * - ftp://example.com
     * - https://example
     * - https://asdf
     */
    private static function httpUrlRule(): array
    {
        return [
            'url:http,https',

            function (string $attribute, mixed $value, \Closure $fail): void {
                if (! is_string($value)) {
                    return;
                }

                $host = parse_url($value, PHP_URL_HOST);

                if (
                    ! is_string($host) ||
                    ! preg_match('/\.[a-zA-Z]{2,}$/', $host)
                ) {
                    $fail(
                        'The ' . $attribute .
                        ' must include a valid domain, e.g. https://example.com.'
                    );
                }
            },
        ];
    }

    /**
     * List every project regardless of status.
     *
     * Drafts are visible to administrators/staff.
     */
    public function index()
    {
        $projects = PortfolioProject::with('author:id,name')
            ->latest()
            ->get();

        return response()->json([
            'data' => $projects,
        ]);
    }

    /**
     * Show a single portfolio project.
     */
    public function show(int $id)
    {
        $project = PortfolioProject::with('author:id,name')
            ->findOrFail($id);

        return response()->json([
            'data' => $project,
        ]);
    }

    /**
     * Create a new portfolio project.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => [
                'required',
                'string',
                'max:200',
            ],

            'client_name' => [
                'nullable',
                'string',
                'max:150',
            ],

            'industry' => [
                'nullable',
                'string',
                'max:80',
            ],

            'summary' => [
                'nullable',
                'string',
                'max:300',
            ],

            'description' => [
                'required',
                'string',
            ],

            'cover_image_url' => [
                'nullable',
                'string',
                'max:500',
                ...self::httpUrlRule(),
            ],

            'gallery_images' => [
                'nullable',
                'array',
            ],

            'gallery_images.*' => [
                'string',
                'max:500',
                ...self::httpUrlRule(),
            ],

            'technologies' => [
                'nullable',
                'array',
            ],

            'technologies.*' => [
                'string',
                'max:60',
            ],

            'project_url' => [
                'nullable',
                'string',
                'max:500',
                ...self::httpUrlRule(),
            ],

            'status' => [
                'required',
                'in:draft,published',
            ],

            'completed_at' => [
                'nullable',
                'date',
            ],
        ]);

        $project = PortfolioProject::create([
            ...$validated,

            'author_id' => $request->user()->id,

            'slug' => PortfolioProject::generateUniqueSlug(
                $validated['title']
            ),

            'published_at' => $validated['status'] === 'published'
                ? now()
                : null,
        ]);

        return response()->json([
            'data' => $project->load('author:id,name'),
        ], 201);
    }

    /**
     * Update an existing portfolio project.
     */
    public function update(Request $request, int $id)
    {
        $project = PortfolioProject::findOrFail($id);

        $validated = $request->validate([
            'title' => [
                'sometimes',
                'required',
                'string',
                'max:200',
            ],

            'client_name' => [
                'nullable',
                'string',
                'max:150',
            ],

            'industry' => [
                'nullable',
                'string',
                'max:80',
            ],

            'summary' => [
                'nullable',
                'string',
                'max:300',
            ],

            'description' => [
                'sometimes',
                'required',
                'string',
            ],

            'cover_image_url' => [
                'nullable',
                'string',
                'max:500',
                ...self::httpUrlRule(),
            ],

            'gallery_images' => [
                'nullable',
                'array',
            ],

            'gallery_images.*' => [
                'string',
                'max:500',
                ...self::httpUrlRule(),
            ],

            'technologies' => [
                'nullable',
                'array',
            ],

            'technologies.*' => [
                'string',
                'max:60',
            ],

            'project_url' => [
                'nullable',
                'string',
                'max:500',
                ...self::httpUrlRule(),
            ],

            'status' => [
                'sometimes',
                'required',
                'in:draft,published',
            ],

            'completed_at' => [
                'nullable',
                'date',
            ],
        ]);

        /*
         * Do not regenerate the slug when the title changes.
         *
         * Existing shared URLs should continue to work.
         * The slug is generated only when the project is created.
         */

        /*
         * If a draft is being published for the first time,
         * record the publication timestamp.
         */
        if (
            isset($validated['status']) &&
            $validated['status'] === 'published' &&
            ! $project->published_at
        ) {
            $validated['published_at'] = now();
        }

        /*
         * If a published project is changed back to draft,
         * remove its publication timestamp.
         */
        if (
            isset($validated['status']) &&
            $validated['status'] === 'draft'
        ) {
            $validated['published_at'] = null;
        }

        $project->update($validated);

        return response()->json([
            'data' => $project
                ->fresh()
                ->load('author:id,name'),
        ]);
    }

    /**
     * Delete a portfolio project.
     */
    public function destroy(int $id)
    {
        PortfolioProject::findOrFail($id)->delete();

        return response()->json([
            'message' => 'Project deleted.',
        ]);
    }
}