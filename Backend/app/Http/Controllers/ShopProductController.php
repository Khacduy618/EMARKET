<?php
namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Shop;
use App\Models\Attribute;
use App\Models\ShopCategory;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ShopProductController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        $shop = Shop::where('UserID', $user->UserID)->firstOrFail();
        $products = Product::where('ShopID', $shop->ShopID)
            ->with([
                'category' => function ($query) {
                    $query->select('CategoryID', 'Name');
                },
                'images',
                'variants' => function ($query) {
                    $query->where('IsActive', 1)->select('VariantID', 'ProductID', 'SKU', 'Price', 'StockQuantity');
                }
            ])
            ->get()
            ->map(function ($product) {
                $variant = $product->variants->first();
                return [
                    'ProductID' => $product->ProductID,
                    'ShopID' => $product->ShopID,
                    'CategoryID' => $product->CategoryID,
                    'CategoryName' => $product->category->Name,
                    'Name' => $product->Name,
                    'Description' => $product->Description,
                    'SKU' => $variant ? $variant->SKU : null,
                    'Price' => $variant ? $variant->Price : null,
                    'Discount' => $product->discount,
                    'StockQuantity' => $product->variants->sum('StockQuantity'),
                    'ImageURLs' => $product->images->map(function ($image) {
                        return [
                            'ImageURL' => $image->ImageURL,
                            'IsPrimary' => $image->IsPrimary,
                            'SortOrder' => $image->SortOrder,
                        ];
                    })->toArray(),
                    'IsActive' => $product->IsActive,
                    'AdminApprovalStatus' => $product->AdminApprovalStatus,
                    'ReasonForRejection' => $product->ReasonForRejection,
                    'AverageRating' => $product->AverageRating,
                    'ViewCount' => $product->ViewCount,
                    'SoldCount' => $product->SoldCount,
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
            'Discount' => 'required|integer|min:0|max:100',
            'Images' => 'array|max:9',
            'Images.*.ImageURL' => 'required|url|max:512',
            'Images.*.IsPrimary' => 'boolean',
            'Images.*.SortOrder' => 'integer|min:0',
            'Variants' => 'required|array|min:1',
            'Variants.*.AttributeValues' => 'array',
            'Variants.*.AttributeValues.*.AttributeID' => 'required|exists:attributes,AttributeID',
            'Variants.*.AttributeValues.*.Value' => 'required|string|max:255',
            'Variants.*.SKU' => 'nullable|string|max:100',
            'Variants.*.Price' => 'required|integer|min:0',
            'Variants.*.CompareAtPrice' => 'nullable|integer|min:0',
            'Variants.*.StockQuantity' => 'required|integer|min:0',
            'Variants.*.ImageURL' => 'nullable|url|max:512',
        ]);

        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        $shop = Shop::where('UserID', $user->UserID)->firstOrFail();
        $shopCategory = ShopCategory::where('ShopID', $shop->ShopID)
            ->where('CategoryID', $request->CategoryID)
            ->first();

        if (!$shopCategory) {
            return response()->json(['message' => 'Category not approved for your shop'], 403);
        }

        // Validate unique SKU for shop in productvariants
        $variantSKUs = collect($request->Variants)->pluck('SKU')->filter();
        if ($variantSKUs->isNotEmpty() && ProductVariant::whereIn('SKU', $variantSKUs)
            ->whereHas('product', function ($query) use ($shop) {
                $query->where('ShopID', $shop->ShopID);
            })
            ->exists()) {
            return response()->json(['message' => 'Variant SKU already exists for this shop'], 422);
        }

        // // Validate attributes belong to the selected category
        // $attributeIds = collect($request->Variants)
        //     ->pluck('AttributeValues')
        //     ->flatten(1)
        //     ->pluck('AttributeID')
        //     ->unique();
        // if ($attributeIds->isNotEmpty()) {
        //     $validAttributes = DB::table('categoryattribute')
        //         ->where('CategoryID', $request->CategoryID)
        //         ->whereIn('AttributeID', $attributeIds)
        //         ->pluck('AttributeID');
        //     if ($attributeIds->diff($validAttributes)->isNotEmpty()) {
        //         return response()->json(['message' => 'Invalid attributes for the selected category'], 422);
        //     }
        // }

        // Validate exactly one primary image
        if ($request->has('Images')) {
            $primaryImages = collect($request->Images)->where('IsPrimary', true)->count();
            if ($primaryImages !== 1) {
                return response()->json(['message' => 'Exactly one image must be set as primary'], 422);
            }
        }

        DB::beginTransaction();
        try {
            $product = Product::create([
                'ShopID' => $shop->ShopID,
                'CategoryID' => $request->CategoryID,
                'Name' => $request->Name,
                'Description' => $request->Description,
                'discount' => $request->Discount,
                'StockQuantity' => collect($request->Variants)->sum('StockQuantity'),
                'IsActive' => 1,
                'AdminApprovalStatus' => 'Pending',
                'AverageRating' => 0,
                'ViewCount' => 0,
            ]);

            if ($request->has('Images')) {
                foreach ($request->Images as $index => $image) {
                    ProductImage::create([
                        'ProductID' => $product->ProductID,
                        'ImageURL' => $image['ImageURL'],
                        'IsPrimary' => $image['IsPrimary'] ?? false,
                        'SortOrder' => $image['SortOrder'] ?? $index,
                    ]);
                }
            }

            foreach ($request->Variants as $variantData) {
                $variant = ProductVariant::create([
                    'ProductID' => $product->ProductID,
                    'SKU' => $variantData['SKU'],
                    'Price' => $variantData['Price'],
                    'CompareAtPrice' => $variantData['CompareAtPrice'] ?? null,
                    'StockQuantity' => $variantData['StockQuantity'],
                    'ImageURL' => $variantData['ImageURL'] ?? null,
                    'IsActive' => 1,
                ]);

                // if (!empty($variantData['AttributeValues'])) {
                //     foreach ($variantData['AttributeValues'] as $attr) {
                //         $variant->attributes()->attach($attr['AttributeID'], ['Value' => $attr['Value']]);
                //     }
                // }
            }

            DB::commit();
            return response()->json(['message' => 'Product created successfully', 'data' => $product], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to create product: ' . $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $productID)
    {
        $request->validate([
            'CategoryID' => 'required|exists:platformcategories,CategoryID',
            'Name' => 'required|string|max:255',
            'Description' => 'nullable|string',
            'Discount' => 'required|integer|min:0|max:100',
            'Images' => 'array|max:9',
            'Images.*.ImageURL' => 'required|url|max:512',
            'Images.*.IsPrimary' => 'boolean',
            'Images.*.SortOrder' => 'integer|min:0',
            'Variants' => 'required|array|min:1',
            'Variants.*.AttributeValues' => 'array',
            'Variants.*.AttributeValues.*.AttributeID' => 'required|exists:attributes,AttributeID',
            'Variants.*.AttributeValues.*.Value' => 'required|string|max:255',
            'Variants.*.SKU' => 'nullable|string|max:100',
            'Variants.*.Price' => 'required|integer|min:0',
            'Variants.*.CompareAtPrice' => 'nullable|integer|min:0',
            'Variants.*.StockQuantity' => 'required|integer|min:0',
            'Variants.*.ImageURL' => 'nullable|url|max:512',
        ]);

        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        $shop = Shop::where('UserID', $user->UserID)->firstOrFail();
        $product = Product::where('ShopID', $shop->ShopID)->where('ProductID', $productID)->firstOrFail();
        
        $shopCategory = ShopCategory::where('ShopID', $shop->ShopID)
            ->where('CategoryID', $request->CategoryID)
            ->where('Status', 'Approved')
            ->first();

        if (!$shopCategory) {
            return response()->json(['message' => 'Category not approved for your shop'], 403);
        }

        // Validate unique SKU for shop in productvariants
        $variantSKUs = collect($request->Variants)->pluck('SKU')->filter();
        if ($variantSKUs->isNotEmpty() && ProductVariant::whereIn('SKU', $variantSKUs)
            ->whereHas('product', function ($query) use ($shop, $productID) {
                $query->where('ShopID', $shop->ShopID)->where('ProductID', '!=', $productID);
            })
            ->exists()) {
            return response()->json(['message' => 'Variant SKU already exists for this shop'], 422);
        }

        // Validate attributes belong to the selected category
        $attributeIds = collect($request->Variants)
            ->pluck('AttributeValues')
            ->flatten(1)
            ->pluck('AttributeID')
            ->unique();
        if ($attributeIds->isNotEmpty()) {
            $validAttributes = DB::table('categoryattribute')
                ->where('CategoryID', $request->CategoryID)
                ->whereIn('AttributeID', $attributeIds)
                ->pluck('AttributeID');
            if ($attributeIds->diff($validAttributes)->isNotEmpty()) {
                return response()->json(['message' => 'Invalid attributes for the selected category'], 422);
            }
        }

        // Validate exactly one primary image
        if ($request->has('Images')) {
            $primaryImages = collect($request->Images)->where('IsPrimary', true)->count();
            if ($primaryImages !== 1) {
                return response()->json(['message' => 'Exactly one image must be set as primary'], 422);
            }
        }

        DB::beginTransaction();
        try {
            $product->update([
                'CategoryID' => $request->CategoryID,
                'Name' => $request->Name,
                'Description' => $request->Description,
                'discount' => $request->Discount,
                'StockQuantity' => collect($request->Variants)->sum('StockQuantity'),
                'IsActive' => $request->IsActive ?? 1,
                'AdminApprovalStatus' => 'Pending',
            ]);

            if ($request->has('Images')) {
                $product->images()->delete();
                foreach ($request->Images as $index => $image) {
                    ProductImage::create([
                        'ProductID' => $product->ProductID,
                        'ImageURL' => $image['ImageURL'],
                        'IsPrimary' => $image['IsPrimary'] ?? false,
                        'SortOrder' => $image['SortOrder'] ?? $index,
                    ]);
                }
            }

            $product->variants()->delete();
            foreach ($request->Variants as $variantData) {
                $variant = ProductVariant::create([
                    'ProductID' => $product->ProductID,
                    'SKU' => $variantData['SKU'],
                    'Price' => $variantData['Price'],
                    'CompareAtPrice' => $variantData['CompareAtPrice'] ?? null,
                    'StockQuantity' => $variantData['StockQuantity'],
                    'ImageURL' => $variantData['ImageURL'] ?? null,
                    'IsActive' => 1,
                ]);

                if (!empty($variantData['AttributeValues'])) {
                    foreach ($variantData['AttributeValues'] as $attr) {
                        $variant->attributes()->attach($attr['AttributeID'], ['Value' => $attr['Value']]);
                    }
                }
            }

            DB::commit();
            return response()->json(['message' => 'Product updated successfully', 'data' => $product], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to update product: ' . $e->getMessage()], 500);
        }
    }

    public function destroy($productID)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        $shop = Shop::where('UserID', $user->UserID)->firstOrFail();
        $product = Product::where('ShopID', $shop->ShopID)->where('ProductID', $productID)->firstOrFail();
        $product->delete();

        return response()->json(['message' => 'Product deleted successfully'], 200);
    }

    

    public function getAttributes($categoryID)
    {
    if (!$categoryID) {
        return response()->json(['message' => 'CategoryID is required'], 400);
    }

    $attributes = DB::table('attributes')
        ->join('categoryattribute', 'attributes.AttributeID', '=', 'categoryattribute.AttributeID')
        ->where('categoryattribute.CategoryID', $categoryID)
        ->select('attributes.AttributeID', 'attributes.Name')
        ->orderBy('attributes.Name')
        ->get();

    return response()->json($attributes);
    }
}