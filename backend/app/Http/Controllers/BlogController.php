<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use Illuminate\Http\Request;

class BlogController extends Controller
{
    public function index(Request $request)
    {
        $query = BlogPost::published()->latest('published_at');

        if ($request->filled('category')) {
            $query->where('category', $request->string('category'));
        }

        $posts = $query->paginate(9)->withQueryString();

        return response()->json([
            'data' => $posts->items(),
            'meta' => [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'total' => $posts->total(),
            ],
        ]);
    }

    public function show(string $slug)
    {
        $post = BlogPost::published()->where('slug', $slug)->firstOrFail();

        return response()->json(['data' => $post]);
    }

    /**
     * Distinct categories among published posts — powers the category
     * filter pills on the public blog listing.
     */
    public function categories()
    {
        $categories = BlogPost::published()
            ->whereNotNull('category')
            ->distinct()
            ->pluck('category');

        return response()->json(['data' => $categories]);
    }
}