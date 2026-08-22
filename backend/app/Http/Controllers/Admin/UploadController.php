<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    /**
     * Upload an image (blog cover/content images for now) and return its
     * public URL. Stored on the 'public' disk (see config/filesystems.php)
     * regardless of the app's default filesystem disk — that disk exists
     * specifically for user-facing uploads. Requires
     * `php artisan storage:link` to have been run once per environment.
     */
    public function image(Request $request)
    {
        $request->validate([
            'image' => ['required', 'image', 'max:5120', 'mimes:jpeg,jpg,png,gif,webp'], // 5MB max
        ]);

        $file = $request->file('image');
        $filename = Str::uuid().'.'.$file->getClientOriginalExtension();
        $path = $file->storeAs('blog-uploads', $filename, 'public');

        return response()->json([
            'data' => [
                'url' => Storage::disk('public')->url($path),
            ],
        ], 201);
    }
}