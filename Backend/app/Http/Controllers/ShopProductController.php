<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Shop;
use App\Models\AttributeValue;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ShopProductController extends Controller
{
    /**
     * Display a listing of the products for the authenticated user's shop.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $shop = Shop::where('UserID', Auth::id())->firstOrFail();

        $products = Product::where('ShopID', $shop->ShopID)
            ->with([
                'category:CategoryID,Name',
                'images' => function ($query) {
                    $query->orderBy('SortOrder', 'asc');
                },
                'variants' => function ($query) {
                    $query->where('IsActive', 1);
                },
            ])
            ->latest()
            ->get();

        return response()->json(['data' => $products], 200);
    }

    /**
     * Update the specified product.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $productId
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateProduct(Request $request, $productId)
    {
        $validatedData = $request->validate([
            'ProductID' => 'required|integer|exists:products,ProductID',
            'Name' => 'required|string|max:255',
            'Description' => 'nullable|string',
            'CategoryID' => 'required|integer|exists:platformcategories,CategoryID',
            'Discount' => 'nullable|numeric|min:0|max:100',
            'ImageData' => 'required|json',
            'Images.*' => 'nullable|image|max:2048',
            'Variants' => 'nullable|json',
            'Price' => 'required_without:Variants|numeric|min:0',
            'StockQuantity' => 'required_without:Variants|integer|min:0',
            'SKU' => 'nullable|string',
            'AttributeValues' => 'required|json',
            'VariantImages.*' => 'nullable|array',
            'VariantImages.*.*' => 'image|max:2048',
        ]);

        DB::beginTransaction();
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }

            $shop = Shop::where('UserID', $user->UserID)->firstOrFail();
            $product = Product::where('ShopID', $shop->ShopID)
                ->where('ProductID', $productId)
                ->firstOrFail();

            $product->update([
                'Name' => $validatedData['Name'],
                'Description' => $validatedData['Description'],
                'CategoryID' => $validatedData['CategoryID'],
                'Discount' => $validatedData['Discount'] ?? 0,
                'AdminApprovalStatus' => 'Pending',
                'StockQuantity' => isset($validatedData['Variants'])
                    ? collect(json_decode($validatedData['Variants'], true))->sum('StockQuantity')
                    : $validatedData['StockQuantity'],
            ]);

            $this->syncProductImages($request, $product);

            if (isset($validatedData['Variants'])) {
                $variantsData = json_decode($validatedData['Variants'], true);
                $attributeValuesData = json_decode($validatedData['AttributeValues'], true);
                $this->syncProductVariantsAndAttributes($request, $product, $variantsData, $attributeValuesData);
            } else {
                $variant = ProductVariant::updateOrCreate(
                    [
                        'ProductID' => $product->ProductID,
                        'VariantID' => $product->variants()->first()?->VariantID,
                    ],
                    [
                        'Price' => $validatedData['Price'],
                        'StockQuantity' => $validatedData['StockQuantity'],
                        'SKU' => $validatedData['SKU'] ?? '',
                        'CompareAtPrice' => null,
                        'ImageURL' => null,
                        'IsActive' => 1,
                    ]
                );

                $attributeValuesData = json_decode($validatedData['AttributeValues'], true);
                $attributeValueIdsToSync = [];
                foreach ($attributeValuesData as $attrID => $attrValue) {
                    if (!empty($attrValue)) {
                        $attributeValueRecord = AttributeValue::firstOrCreate(
                            ['AttributeID' => $attrID, 'Value' => $attrValue]
                        );
                        $attributeValueIdsToSync[] = $attributeValueRecord->AttributeValueID;
                    }
                }
                $variant->attributeValues()->sync($attributeValueIdsToSync);
            }

            DB::commit();
            return response()->json([
                'message' => 'Product updated successfully and is pending approval.',
                'data' => $product->load('images', 'variants')
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json(['message' => 'Product or shop not found'], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error updating product: ' . $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    /**
     * Display the specified product.
     *
     * @param int $productId
     * @return \Illuminate\Http\JsonResponse
     */
    public function showProduct($productId)
    {
        try {
            $shop = Shop::where('UserID', Auth::id())->firstOrFail();
            $product = Product::where('ShopID', $shop->ShopID)
                ->with([
                    'images' => function ($query) {
                        $query->select('ImageID', 'ProductID', 'ImageURL', 'IsPrimary', 'SortOrder');
                    },
                    'variants' => function ($query) {
                        $query->select('VariantID', 'ProductID', 'SKU', 'Price', 'CompareAtPrice', 'StockQuantity', 'ImageURL', 'IsActive')
                            ->with(['attributeValues' => function ($query) {
                                $query->select('attributevalues.AttributeValueID', 'attributevalues.AttributeID', 'attributevalues.Value');
                            }]);
                    }
                ])
                ->select('ProductID', 'ShopID', 'CategoryID', 'Name', 'Description', 'Discount', 'StockQuantity', 'AdminApprovalStatus')
                ->findOrFail($productId);

            return response()->json(['data' => $product], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Product not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => 'An error occurred while fetching the product: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get product attribute values.
     *
     * @param int $productID
     * @return \Illuminate\Http\JsonResponse
     */
    public function getProductAttributeValues($productID)
    {
        try {
            if (!is_numeric($productID)) {
                return response()->json(['message' => 'Invalid product ID'], 400);
            }

            $product = Product::find($productID);
            if (!$product) {
                return response()->json(['message' => 'Product not found'], 404);
            }

            $attributeValues = AttributeValue::whereIn('AttributeValueID', function ($query) use ($productID) {
                $query->select('AttributeValueID')
                    ->from('productvariantattribute')
                    ->whereIn('VariantID', function ($subQuery) use ($productID) {
                        $subQuery->select('VariantID')
                            ->from('productvariants')
                            ->where('ProductID', $productID);
                    });
            })
            ->get()
            ->groupBy('AttributeID')
            ->map(function ($group) {
                return $group->pluck('Value')->toArray();
            });

            return response()->json(['data' => $attributeValues], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error fetching attribute values: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Delete the specified product.
     *
     * @param int $productID
     * @return \Illuminate\Http\JsonResponse
     */
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

    /**
     * Get attributes for a specific category.
     *
     * @param int $categoryID
     * @return \Illuminate\Http\JsonResponse
     */
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

    /**
     * Create a new product.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function addProduct(Request $request)
    {
        $validatedData = $request->validate([
            'Name' => 'required|string|max:255',
            'Description' => 'nullable|string',
            'CategoryID' => 'required|integer|exists:platformcategories,CategoryID',
            'Discount' => 'nullable|numeric|min:0|max:100',
            'ImageData' => 'required|json',
            'Images' => 'nullable|array',
            'Images.*' => 'image|max:2048',
            'Variants' => 'required|json',
            'AttributeValues' => 'required|json',
            'VariantImages.*' => 'nullable|array',
            'VariantImages.*.*' => 'image|max:2048',
        ]);

        DB::beginTransaction();
        try {
            $shop = Shop::where('UserID', Auth::id())->firstOrFail();
            $variantsData = json_decode($validatedData['Variants'], true);
            $attributeValuesData = json_decode($validatedData['AttributeValues'], true);

            $product = Product::create([
                'ShopID' => $shop->ShopID,
                'Name' => $validatedData['Name'],
                'Description' => $validatedData['Description'],
                'CategoryID' => $validatedData['CategoryID'],
                'discount' => $validatedData['Discount'] ?? 0,
                'AdminApprovalStatus' => 'Pending',
                'StockQuantity' => collect($variantsData)->sum('StockQuantity'),
            ]);

            $imageData = json_decode($validatedData['ImageData'], true);
            if ($request->hasFile('Images')) {
                foreach ($request->file('Images') as $index => $file) {
                    $path = $file->store('product_images', 'public');
                    ProductImage::create([
                        'ProductID' => $product->ProductID,
                        'ImageURL' => $path,
                        'IsPrimary' => $imageData[$index]['IsPrimary'] ?? ($index === 0),
                        'SortOrder' => $imageData[$index]['SortOrder'] ?? $index,
                    ]);
                }
            }

            $variantFiles = $request->file('VariantImages', []);
            foreach ($variantsData as $index => $variantInfo) {
                $variant = ProductVariant::create([
                    'ProductID' => $product->ProductID,
                    'Price' => $variantInfo['Price'],
                    'StockQuantity' => $variantInfo['StockQuantity'],
                    'SKU' => $variantInfo['SKU'],
                    'CompareAtPrice' => $variantInfo['CompareAtPrice'] ?? null,
                    'ImageURL' => null,
                    'IsActive' => 1,
                ]);

                if (isset($variantFiles[$index]) && !empty($variantFiles[$index])) {
                    foreach ($variantFiles[$index] as $imageIndex => $imageFile) {
                        $path = $imageFile->store('variant_images', 'public');
                        if ($imageIndex === 0) {
                            $variant->update(['ImageURL' => $path]);
                        }
                    }
                }

                foreach ($attributeValuesData as $attrID => $attrValue) {
                    if (!empty($attrValue)) {
                        $attributeValueRecord = AttributeValue::firstOrCreate(
                            ['AttributeID' => $attrID, 'Value' => $attrValue]
                        );
                        $variant->attributeValues()->attach($attributeValueRecord->AttributeValueID);
                    }
                }
            }

            DB::commit();
            return response()->json(['message' => 'Product added successfully and is pending approval.', 'data' => $product->load('images', 'variants')], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error adding product: ' . $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    /**
     * Sync product images.
     *
     * @param \Illuminate\Http\Request $request
     * @param \App\Models\Product $product
     * @return void
     */
    private function syncProductImages(Request $request, Product $product)
    {
        $imageData = json_decode($request->input('ImageData'), true);
        $newImageFiles = $request->file('Images', []);

        $currentImageIds = $product->images()->pluck('ImageID')->toArray();
        $submittedImageIds = collect($imageData)->pluck('ImageID')->filter()->values()->toArray();

        $imagesToDeleteIds = array_diff($currentImageIds, $submittedImageIds);
        if (!empty($imagesToDeleteIds)) {
            $imagesToDelete = ProductImage::whereIn('ImageID', $imagesToDeleteIds)->get();
            foreach ($imagesToDelete as $img) {
                Storage::disk('public')->delete($img->ImageURL);
                $img->delete();
            }
        }

        $newFileIndex = 0;
        foreach ($imageData as $imgInfo) {
            if (isset($imgInfo['ImageID'])) {
                ProductImage::where('ImageID', $imgInfo['ImageID'])->update([
                    'IsPrimary' => $imgInfo['IsPrimary'],
                    'SortOrder' => $imgInfo['SortOrder'],
                ]);
            } else {
                if (isset($newImageFiles[$newFileIndex])) {
                    $path = $newImageFiles[$newFileIndex]->store('product_images', 'public');
                    $product->images()->create([
                        'ImageURL' => $path,
                        'IsPrimary' => $imgInfo['IsPrimary'],
                        'SortOrder' => $imgInfo['SortOrder'],
                    ]);
                    $newFileIndex++;
                }
            }
        }
    }

    /**
     * Sync product variants and attributes.
     *
     * @param \Illuminate\Http\Request $request
     * @param \App\Models\Product $product
     * @param array $variantsData
     * @param array $attributeValuesData
     * @return void
     */
    private function syncProductVariantsAndAttributes(Request $request, Product $product, array $variantsData, array $attributeValuesData)
    {
        $currentVariantIds = $product->variants()->pluck('VariantID')->toArray();
        $submittedVariantIds = collect($variantsData)->pluck('VariantID')->filter()->values()->toArray();

        // Delete variants that are no longer in the submitted data
        $variantsToDeleteIds = array_diff($currentVariantIds, $submittedVariantIds);
        if (!empty($variantsToDeleteIds)) {
            $variantsToDelete = ProductVariant::whereIn('VariantID', $variantsToDeleteIds)->get();
            foreach ($variantsToDelete as $variant) {
                // Detach attribute relationships
                $variant->attributeValues()->detach();
                // Delete variant image if it exists
                if ($variant->ImageURL) {
                    Storage::disk('public')->delete($variant->ImageURL);
                }
                $variant->delete();
            }
        }

        // Handle variant images
        $variantFiles = $request->file('VariantImages', []);

        // Update or create variants
        foreach ($variantsData as $index => $variantInfo) {
            $variant = ProductVariant::updateOrCreate(
                [
                    'VariantID' => $variantInfo['VariantID'] ?? null,
                    'ProductID' => $product->ProductID,
                ],
                [
                    'Price' => $variantInfo['Price'],
                    'StockQuantity' => $variantInfo['StockQuantity'],
                    'SKU' => $variantInfo['SKU'],
                    'CompareAtPrice' => $variantInfo['CompareAtPrice'] ?? null,
                    'IsActive' => 1,
                ]
            );

            // Handle variant images
            if (isset($variantFiles[$index]) && !empty($variantFiles[$index])) {
                // Delete old image if it exists
                if ($variant->ImageURL) {
                    Storage::disk('public')->delete($variant->ImageURL);
                }
                // Store new primary image (first image in the array)
                $path = $variantFiles[$index][0]->store('variant_images', 'public');
                $variant->update(['ImageURL' => $path]);
            }

            // Sync attribute values
            $attributeValueIdsToSync = [];
            foreach ($attributeValuesData as $attrID => $attrValue) {
                if (!empty($attrValue)) {
                    $attributeValueRecord = AttributeValue::firstOrCreate(
                        ['AttributeID' => $attrID, 'Value' => $attrValue]
                    );
                    $attributeValueIdsToSync[] = $attributeValueRecord->AttributeValueID;
                }
            }
            $variant->attributeValues()->sync($attributeValueIdsToSync);
        }
    }
}