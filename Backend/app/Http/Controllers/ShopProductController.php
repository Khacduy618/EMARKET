<?php
namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Shop;
use App\Models\ShopCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ShopProductController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $shop = Shop::where('UserID', $user->UserID)->firstOrFail();
         
        if (!$shop) {
            return response()->json(['message' => 'Shop not found'], 404);
        }
        $products = Product::where('ShopID', $shop->ShopID)
            ->with(['category' => function ($query) {
                $query->select('CategoryID', 'Name');
            }])
            ->get()
            ->map(function ($product) {
                return [
                    'ProductID' => $product->ProductID,
                    'ShopID' => $product->ShopID,
                    'CategoryID' => $product->CategoryID,
                    'CategoryName' => $product->category->Name,
                    'Name' => $product->Name,
                    'Description' => $product->Description,
                    'Price' => $product->Price,
                    'StockQuantity' => $product->StockQuantity,
                    'ImageURL' => $product->ImageURL,
                    'CreatedAt' => $product->CreatedAt,
                    'UpdatedAt' => $product->UpdatedAt,
                ];
            });

        return response()->json(['data' => $products], 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'CategoryID' => 'required|exists:platformcategories,CategoryID',
            'Name' => 'required|string|max:255',
            'Description' => 'nullable|string',
            'Price' => 'required|numeric|min:0',
            'StockQuantity' => 'required|integer|min:0',
            'ImageURL' => 'nullable|url|max:255',
        ]);

        $user = Auth::user();
        $shop = Shop::where('UserID', $user->UserID)->firstOrFail();

        // Check if CategoryID is approved for the shop
        $shopCategory = ShopCategory::where('ShopID', $shop->ShopID)
            ->where('CategoryID', $request->CategoryID)
            // ->where('Status', 'Approved')
            ->first();

        if (!$shopCategory) {
            return response()->json(['message' => 'Category not approved for your shop'], 403);
        }

        $product = Product::create([
            'ShopID' => $shop->ShopID,
            'CategoryID' => $request->CategoryID,
            'Name' => $request->Name,
            'Description' => $request->Description,
            'Price' => $request->Price,
            'StockQuantity' => $request->StockQuantity,
            'ImageURL' => $request->ImageURL,
        ]);

        return response()->json(['message' => 'Product created successfully', 'data' => $product], 201);
    }

    public function update(Request $request, $productID)
    {
        $request->validate([
            'CategoryID' => 'required|exists:platformcategories,CategoryID',
            'Name' => 'required|string|max:255',
            'Description' => 'nullable|string',
            'Price' => 'required|numeric|min:0',
            'StockQuantity' => 'required|integer|min:0',
            'ImageURL' => 'nullable|url|max:255',
        ]);

        $user = Auth::user();
        $shop = Shop::where('UserID', $user->UserID)->firstOrFail();

        $product = Product::where('ShopID', $shop->ShopID)->where('ProductID', $productID)->firstOrFail();

        // Check if CategoryID is approved for the shop
        $shopCategory = ShopCategory::where('ShopID', $shop->ShopID)
            ->where('CategoryID', $request->CategoryID)
            ->where('Status', 'Approved')
            ->first();

        if (!$shopCategory) {
            return response()->json(['message' => 'Category not approved for your shop'], 403);
        }

        $product->update([
            'CategoryID' => $request->CategoryID,
            'Name' => $request->Name,
            'Description' => $request->Description,
            'Price' => $request->Price,
            'StockQuantity' => $request->StockQuantity,
            'ImageURL' => $request->ImageURL,
        ]);

        return response()->json(['message' => 'Product updated successfully', 'data' => $product], 200);
    }

    public function destroy($productID)
    {
        $user = Auth::user();
        $shop = Shop::where('UserID', $user->UserID)->firstOrFail();

        $product = Product::where('ShopID', $shop->ShopID)->where('ProductID', $productID)->firstOrFail();
        $product->delete();

        return response()->json(['message' => 'Product deleted successfully'], 200);
    }
}