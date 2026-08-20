<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;

class ClientController extends Controller
{
    public function index()
    {
        $clients = User::where('role', 'client')
            ->withCount(['invoices', 'quotations', 'contracts'])
            ->select('id', 'name', 'email', 'created_at')
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $clients]);
    }
}