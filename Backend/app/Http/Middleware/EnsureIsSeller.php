<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EnsureIsSeller
{
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if ($user->Role !== 'Seller') {
            return response()->json(['message' => 'Unauthorized: Only sellers can access this resource'], 403);
        }

        return $next($request);
    }
}