<?php

// namespace App\Http\Controllers;

// use App\Http\Controllers\Controller;
// use App\Models\Product;
// use Illuminate\Http\Request;

// class ProductDetailController extends Controller
// {
//     /**
//      * Display the specified product details.
//      *
//      * @param  int  $productId
//      * @return \Illuminate\Http\JsonResponse
//      */
//     public function show($productId)
//     {
//         // Eager load relationships: images, variants, and each variant's attributes
//         $product = Product::with(['images', 'variants.attributeValues'])->find($productId);

//         if (!$product) {
//             return response()->json([
//                 'message' => 'Product not found.'
//             ], 404);
//         }
//         return response()->json($product);
//     }
// }

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductDetailController extends Controller
{
    /**
     * Display the specified product details.
     *
     * @param  int  $productId
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($productId)
    {
        // Eager load relationships: images, variants, and each variant's attributes
        $product = Product::with(['images', 'Variants.AttributeValues'])->find($productId);

        if (!$product) {
            return response()->json([
                'message' => 'Product not found.'
            ], 404);
        }

        return response()->json($product);
    }
}