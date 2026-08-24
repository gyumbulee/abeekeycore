<?php

namespace App\Http\Controllers;

use App\Models\PortfolioProject;
use Illuminate\Http\Request;

class PortfolioController extends Controller
{
    public function index(Request $request)
    {
        $query = PortfolioProject::published()->latest('published_at');

        if ($request->filled('industry')) {
            $query->where('industry', $request->string('industry'));
        }

        $projects = $query->paginate(9)->withQueryString();

        return response()->json([
            'data' => $projects->items(),
            'meta' => [
                'current_page' => $projects->currentPage(),
                'last_page' => $projects->lastPage(),
                'total' => $projects->total(),
            ],
        ]);
    }

    public function show(string $slug)
    {
        $project = PortfolioProject::published()->where('slug', $slug)->firstOrFail();

        return response()->json(['data' => $project]);
    }

    /**
     * Distinct industries among published projects — powers the industry
     * filter pills on the public portfolio listing.
     */
    public function industries()
    {
        $industries = PortfolioProject::published()
            ->whereNotNull('industry')
            ->distinct()
            ->pluck('industry');

        return response()->json(['data' => $industries]);
    }
}
