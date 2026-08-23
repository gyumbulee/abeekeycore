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
     * public URL. Stored on whichever disk config('filesystems.default')
     * points to (see config/filesystems.php) — 'public' (local) until an
     * admin sets FILESYSTEM_DISK=s3 with real AWS credentials, after which
     * uploads switch to S3 automatically with no code change needed.
     * Local disk requires `php artisan storage:link` once per environment.
     */
    public function image(Request $request)
    {
        $request->validate([
            'image' => ['required', 'image', 'max:5120', 'mimes:jpeg,jpg,png,gif,webp'], // 5MB max
        ]);

        $disk = config('filesystems.default');
        $file = $request->file('image');
        $filename = Str::uuid().'.'.$file->getClientOriginalExtension();
        $path = $file->storeAs('blog-uploads', $filename, $disk);

        return response()->json([
            'data' => [
                'url' => Storage::disk($disk)->url($path),
            ],
        ], 201);
    }
}