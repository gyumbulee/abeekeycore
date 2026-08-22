<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use Illuminate\Http\Request;

class BlogController extends Controller
{
    /**
     * List every post regardless of status — unlike the public
     * BlogController, drafts are visible here so staff can see what's
     * in progress.
     */
    public function index()
    {
        $posts = BlogPost::with('author:id,name')->latest()->get();

        return response()->json(['data' => $posts]);
    }

    public function show(int $id)
    {
        $post = BlogPost::with('author:id,name')->findOrFail($id);

        return response()->json(['data' => $post]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'excerpt' => ['nullable', 'string', 'max:300'],
            'content' => ['required', 'string'],
            'cover_image_url' => ['nullable', 'string', 'max:500', 'url'],
            'category' => ['nullable', 'string', 'max:80'],
            'status' => ['required', 'in:draft,published'],
        ]);

        $post = BlogPost::create([
            ...$validated,
            'author_id' => $request->user()->id,
            'slug' => BlogPost::generateUniqueSlug($validated['title']),
            'published_at' => $validated['status'] === 'published' ? now() : null,
        ]);

        return response()->json(['data' => $post->load('author:id,name')], 201);
    }

    public function update(Request $request, int $id)
    {
        $post = BlogPost::findOrFail($id);

        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:200'],
            'excerpt' => ['nullable', 'string', 'max:300'],
            'content' => ['sometimes', 'required', 'string'],
            'cover_image_url' => ['nullable', 'string', 'max:500', 'url'],
            'category' => ['nullable', 'string', 'max:80'],
            'status' => ['sometimes', 'required', 'in:draft,published'],
        ]);

        // Re-slugging on every title edit would break existing shared links,
        // so the slug is only ever set once, at creation.
        if (isset($validated['status']) && $validated['status'] === 'published' && ! $post->published_at) {
            $validated['published_at'] = now();
        }
        if (isset($validated['status']) && $validated['status'] === 'draft') {
            $validated['published_at'] = null;
        }

        $post->update($validated);

        return response()->json(['data' => $post->fresh()->load('author:id,name')]);
    }

    public function destroy(int $id)
    {
        BlogPost::findOrFail($id)->delete();

        return response()->json(['message' => 'Post deleted.']);
    }
}