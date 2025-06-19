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
        // SỬA ĐỔI CHÍNH Ở DÒNG DƯỚI ĐÂY
        $product = Product::with([
            'category',
            'images', 
            // Tải các biến thể -> mỗi biến thể tải các giá trị thuộc tính -> mỗi giá trị thuộc tính tải tên thuộc tính cha của nó
            'variants.attributeValues.attribute' 
        ])->find($productId);

        if (!$product) {
            return response()->json([
                'message' => 'Product not found.'
            ], 404);
        }

        return response()->json($product);
    }
}