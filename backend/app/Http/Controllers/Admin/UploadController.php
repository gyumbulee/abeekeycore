<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    /**
     * Folders an uploaded image may be stored under. Kept as an explicit
     * allowlist (rather than accepting any client-supplied string) so the
     * 'folder' input can never be used to write outside the intended
     * upload directories.
     */
    private const ALLOWED_FOLDERS = ['blog-uploads', 'portfolio-uploads'];

    /**
     * Upload an image (blog cover/content, portfolio cover/gallery images)
     * and return its public URL. Stored on whichever disk
     * config('filesystems.default') points to (see config/filesystems.php)
     * — 'public' (local) until an admin sets FILESYSTEM_DISK=s3 with real
     * AWS credentials, after which uploads switch to S3 automatically with
     * no code change needed. Local disk requires `php artisan storage:link`
     * once per environment.
     */
    public function image(Request $request)
    {
        $request->validate([
            'image' => ['required', 'image', 'max:5120', 'mimes:jpeg,jpg,png,gif,webp'], // 5MB max
            'folder' => ['nullable', 'string', 'in:'.implode(',', self::ALLOWED_FOLDERS)],
        ]);

        $folder = $request->string('folder')->toString() ?: 'blog-uploads';

        $disk = config('filesystems.default');
        $file = $request->file('image');
        $filename = Str::uuid().'.'.$file->getClientOriginalExtension();
        $path = $file->storeAs($folder, $filename, $disk);

        return response()->json([
            'data' => [
                'url' => Storage::disk($disk)->url($path),
            ],
        ], 201);
    }
}