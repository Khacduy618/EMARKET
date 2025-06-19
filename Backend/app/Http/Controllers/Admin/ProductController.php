<?php

namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
{
    $products = DB::table('products')
        ->leftJoin('productimages', 'products.ProductID', '=', 'productimages.ProductID')
        ->select('products.*', 'productimages.ImageURL')
        ->where('productimages.IsPrimary', 1)
        ->get();

    return response()->json($products);
}
    public function store(Request $request)
    {
        try {
        // Validate dữ liệu đầu vào
        $request->validate([
            'ShopID' => 'required|integer|exists:shops,ShopID',
            'CategoryID' => 'required|integer|exists:platformcategories,CategoryID',
            'Name' => 'required|string|max:255',
            'Description' => 'nullable|string',
            'SKU' => 'nullable|string|max:100|unique:products,SKU',
            'Price' => 'required|numeric|min:0',
            'StockQuantity' => 'required|integer|min:0',
            'IsActive' => 'required|boolean',
            'AdminApprovalStatus' => 'required|in:Pending,Approved,Rejected',
            'ReasonForRejection' => 'nullable|string',
            'AverageRating' => 'nullable|numeric|min:0|max:5',
            'ViewCount' => 'nullable|integer|min:0',
            'SoldCount' => 'nullable|integer|min:0',
        ], [
            'SKU.unique' => 'Mã SKU đã được sử dụng, vui lòng chọn mã khác.',
        ]);

        // Tạo product mới
        $product = Product::create([
            'ShopID' => $request->ShopID,
            'CategoryID' => $request->CategoryID,
            'Name' => $request->Name,
            'Description' => $request->Description,
            'SKU' => $request->SKU,
            'Price' => $request->Price,
            'StockQuantity' => $request->StockQuantity,
            'IsActive' => $request->IsActive,
            'AdminApprovalStatus' => $request->AdminApprovalStatus,
            'ReasonForRejection' => $request->ReasonForRejection,
            'AverageRating' => $request->AverageRating ?? 0,
            'ViewCount' => $request->ViewCount ?? 0,
            'SoldCount' => $request->SoldCount ?? 0,
        ]);


            
            return response()->json([
                'status' => 'success',
                'message' => 'Thêm sản phẩm thành công',
                'data' => $product,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi khi thêm sản phẩm: ' . $e->getMessage(),
            ], 500);
        }
    }
    public function update(Request $request, $id)
{
    try {
        $product = Product::findOrFail($id);

        $request->validate([
            'ShopID' => 'sometimes|integer|exists:shops,ShopID',
            'CategoryID' => 'sometimes|integer|exists:platformcategories,CategoryID',
            'Name' => 'sometimes|string|max:255',
            'Description' => 'nullable|string',
            'SKU' => 'sometimes|string|max:100|unique:products,SKU,' . $id . ',ProductID',
            'Price' => 'sometimes|numeric|min:0',
            'StockQuantity' => 'sometimes|integer|min:0',
            'IsActive' => 'sometimes|boolean',
            'AdminApprovalStatus' => 'sometimes|in:Pending,Approved,Rejected',
            'ReasonForRejection' => 'nullable|string',
            'AverageRating' => 'nullable|numeric|min:0|max:5',
            'ViewCount' => 'nullable|integer|min:0',
            'SoldCount' => 'nullable|integer|min:0',
        ]);

        $product->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Cập nhật sản phẩm thành công',
            'data' => $product,
        ]);
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Không tìm thấy sản phẩm',
        ], 404);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Lỗi khi cập nhật sản phẩm: ' . $e->getMessage(),
        ], 500);
    }
}
public function destroy($id)
{
    try {
        $product = Product::findOrFail($id);

        // Kiểm tra sản phẩm có CategoryID hợp lệ (hoặc kiểm tra điều kiện liên quan)
        if ($product->CategoryID) {
            return response()->json([
                'status' => 'error',
                'message' => 'Không thể xóa sản phẩm này vì nó vẫn thuộc một danh mục.',
            ], 400);
        }

        // Nếu muốn kiểm tra quan hệ khác, bạn có thể thêm logic ở đây
        // Ví dụ: nếu product có đơn hàng liên quan thì cũng không xóa được

        $product->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Xóa sản phẩm thành công',
        ]);
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Không tìm thấy sản phẩm',
        ], 404);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Lỗi khi xóa sản phẩm: ' . $e->getMessage(),
        ], 500);
    }
}
// public function ProductFinalPrice()
// {
//     $products = Product::where('discount', '>', 0)
//         ->get(['name','price', 'discount','', 'AverageRating']);

//     return response()->json($products);
// }
public function ProductFinalPrice()
    {
        $products = Product::where('products.IsActive', 1) // Chỉ định rõ bảng cho cột IsActive
            ->where('products.AdminApprovalStatus', 'Approved') // Chỉ định rõ bảng
            ->where('products.Discount', '>', 0) // Lấy sản phẩm có giảm giá (từ bảng products)
            ->with([
                // Lấy ảnh chính từ bảng ProductImages
                'primaryImage:ProductID,ImageURL', // Chỉ chọn cột cần thiết

                // Lấy thông tin các biến thể từ bảng ProductVariants
                // Chúng ta sẽ lấy biến thể đầu tiên hoặc một biến thể mặc định
                'defaultVariant' => function ($query) {
                    $query->select('VariantID', 'ProductID', 'SKU', 'Price', 'ImageURL as VariantImageURL') // Chọn cột từ ProductVariants
                          ->with([
                              // Lấy các thuộc tính của biến thể đó
                              // thông qua ProductVariantAttribute -> AttributeValues -> Attributes
                              'attributeValues' => function ($q_attr_val) {
                                  $q_attr_val->select('attributevalues.AttributeValueID', 'attributevalues.Value', 'attributevalues.AttributeID')
                                             ->with('attribute:AttributeID,Name'); // Lấy tên thuộc tính (Màu sắc, Kích thước)
                              }
                          ]);
                },
            ])
            ->limit(11)
            ->select('products.ProductID', 'products.Name', 'products.Discount') // Chọn cột từ bảng products
            ->get();

        $formattedProducts = $products->map(function ($product) {
            $variant = $product->defaultVariant; // Lấy biến thể đã eager load
            $variantPrice = null;
            $variantSku = null;
            $variantSpecificImage = null;
            $attributesDescription = [];
            $finalPrice = 0;

            if ($variant) {
                $variantPrice = $variant->Price;
                $variantSku = $variant->SKU;
                $variantSpecificImage = $variant->VariantImageURL; // Ảnh riêng của biến thể (nếu có)

                if ($variant->attributeValues->isNotEmpty()) {
                    foreach ($variant->attributeValues as $attrValue) {
                        if ($attrValue->attribute) { // Đảm bảo attribute được load
                            $attributesDescription[] = $attrValue->attribute->Name . ': ' . $attrValue->Value;
                        }
                    }
                }

                // Tính giá cuối cùng: Giá biến thể trừ đi khuyến mãi của sản phẩm
                // Giả sử Product.Discount là số tiền giảm giá trực tiếp
                if ($product->Discount > 0 && $variantPrice !== null) {
                    $finalPrice = $variantPrice - $product->Discount;
                } else {
                    $finalPrice = $variantPrice;
                }
                $finalPrice = max(0, $finalPrice ?? 0); // Đảm bảo giá không âm
            }

            return [
                'ProductID'        => $product->ProductID,
                'name'             => $product->Name,
                'product_discount' => $product->Discount, // Khuyến mãi của sản phẩm
                'average_rating'   => $product->AverageRating,
                'primary_image_url'=> $product->primaryImage?->ImageURL ?? null,
                'variant_sku'      => $variantSku,
                'variant_price'    => $variantPrice, // Giá gốc của biến thể
                'final_price'      => $finalPrice,   // Giá sau khi áp dụng khuyến mãi sản phẩm
                'variant_specific_image_url' => $variantSpecificImage, // Ảnh của biến thể
                'attributes'       => implode(', ', $attributesDescription), // Mô tả thuộc tính của biến thể
            ];
        });

        return response()->json($formattedProducts);
    }
    public function bestSelling() // Có thể đổi tên hàm thành مثلاً featuredOrDiscountedProducts
    {
        $productsData = DB::table('products as p')
            ->leftJoin('productimages as pi', function ($join) {
                $join->on('p.ProductID', '=', 'pi.ProductID')
                     ->where('pi.IsPrimary', '=', 1);
            })
            ->leftJoin(DB::raw('(
                SELECT
                    pv.ProductID,
                    MIN(pv.Price) as VariantMinPrice,
                    MIN(CASE
                            WHEN pv.CompareAtPrice IS NOT NULL AND pv.CompareAtPrice > pv.Price THEN pv.CompareAtPrice
                            ELSE NULL
                        END) as VariantCompareAtPrice,
                    (SELECT pv_img.ImageURL
                     FROM ProductVariants pv_img
                     WHERE pv_img.ProductID = pv.ProductID
                       AND pv_img.Price = MIN(pv.Price)
                       AND pv_img.IsActive = 1
                       AND pv_img.ImageURL IS NOT NULL
                     ORDER BY pv_img.VariantID
                     LIMIT 1) as VariantImageURL,
                    (SELECT pv_sku.SKU
                     FROM ProductVariants pv_sku
                     WHERE pv_sku.ProductID = pv.ProductID
                       AND pv_sku.Price = MIN(pv.Price)
                       AND pv_sku.IsActive = 1
                     ORDER BY pv_sku.VariantID
                     LIMIT 1) as VariantSKU,
                    MIN(pv.StockQuantity) as VariantMinStockQuantity
                FROM ProductVariants pv
                WHERE pv.IsActive = 1
                GROUP BY pv.ProductID
            ) as variant_info'), function ($join) {
                $join->on('p.ProductID', '=', 'variant_info.ProductID');
            })
            ->where('p.IsActive', 1)
            ->where('p.AdminApprovalStatus', 'Approved') // Đảm bảo 'Approved' trong dấu nháy
            ->whereNotNull('variant_info.VariantMinPrice')
            // CHỈNH SỬA Ở ĐÂY: Sắp xếp theo Discount giảm dần
            ->orderByDesc('p.Discount')
            ->orderByDesc('p.CreatedAt')
            ->limit(6)
            ->select(
                'p.ProductID',
                'p.Name as ProductName',
                'p.Description as ProductDescription',
                'p.Discount as ProductLevelDiscount', // Chọn cột Discount để có thể thấy giá trị
                'variant_info.VariantMinPrice as Price',
                'variant_info.VariantCompareAtPrice as CompareAtPrice',
                'variant_info.VariantSKU as SKU',
                'variant_info.VariantMinStockQuantity as StockQuantity',
                DB::raw('COALESCE(pi.ImageURL, variant_info.VariantImageURL) as ImageURL')
            )
            ->get();
    
        $processedProducts = $productsData->map(function ($product) {
            // Xử lý ImageURL
            if ($product->ImageURL && !(str_starts_with($product->ImageURL, 'http://') || str_starts_with($product->ImageURL, 'https://'))) {
                $product->ImageURL = asset($product->ImageURL);
            } else if (empty($product->ImageURL)) {
                // $product->ImageURL = asset('images/default-product.png'); // Hoặc ảnh placeholder của bạn
            }
    
            // Tính toán giá sau khi áp dụng ProductLevelDiscount (nếu cần hiển thị)
            // Logic này phụ thuộc vào việc p.Discount là % hay số tiền cố định
            $product->FinalPrice = $product->Price; // Mặc định giá cuối bằng giá biến thể
    
            if (!is_null($product->Price) && !is_null($product->ProductLevelDiscount) && $product->ProductLevelDiscount > 0) {
                // Nếu p.Discount là phần trăm
                $discountValue = ($product->ProductLevelDiscount / 100) * $product->Price;
                $product->FinalPrice = $product->Price - $discountValue;
            } else {
                $product->FinalPrice = $product->Price;
            }
            
            // Đảm bảo CompareAtPrice chỉ hiển thị nếu nó lớn hơn giá bán
            if (!is_null($product->CompareAtPrice) && !is_null($product->FinalPrice) && $product->CompareAtPrice <= $product->FinalPrice) {
                $product->CompareAtPrice = null;
            }
            if (!is_null($product->CompareAtPrice) && is_null($product->FinalPrice) && !is_null($product->Price) && $product->CompareAtPrice <= $product->Price) {
                 $product->CompareAtPrice = null;
            }
    
    
            // Làm tròn giá
            if(isset($product->Price)) $product->Price = round($product->Price);
            if(isset($product->FinalPrice)) $product->FinalPrice = round($product->FinalPrice);
            if(isset($product->CompareAtPrice)) $product->CompareAtPrice = round($product->CompareAtPrice);
    
    
            return $product;
        });
    
        return response()->json($processedProducts);
    }
    public function getRelatedProducts(int $currentProductId): JsonResponse
    {
        // 1. Tìm sản phẩm hiện tại để lấy ra CategoryID của nó.
        $currentProduct = Product::find($currentProductId);

        if (!$currentProduct || !$currentProduct->CategoryID) {
            return response()->json([]);
        }

        $categoryId = $currentProduct->CategoryID;

        // 2. Query các sản phẩm liên quan
        $relatedProducts = Product::active()
            ->approved()
            ->where('CategoryID', $categoryId)
            ->where('ProductID', '!=', $currentProductId)
            ->with([ // Vẫn Eager Load để tối ưu
                'variants' => fn($query) => $query->where('IsActive', 1)->orderBy('Price', 'asc'),
                'primaryImage'
            ])
            ->inRandomOrder()
            ->take(4)
            ->get();
            
        // 3. Định dạng lại dữ liệu bằng tay (thay thế cho Resource)
        $formattedProducts = $relatedProducts->map(function ($product) {
            // Lấy biến thể đầu tiên (giá rẻ nhất)
            $firstVariant = $product->variants->first();

            // Rất quan trọng: Bỏ qua sản phẩm nếu nó không có biến thể hợp lệ
            if (!$firstVariant) {
                return null;
            }

            // Lấy URL ảnh chính
            // Sử dụng "??" (null coalescing operator) để tránh lỗi nếu primaryImage là null
            $imageUrl = $product->primaryImage->ImageURL ?? null;

            // Tính toán giá và % giảm giá
            $price = $firstVariant->Price;
            $compareAtPrice = $firstVariant->CompareAtPrice;
            $discountPercent = 0;

            if ($compareAtPrice && $price < $compareAtPrice) {
                $discountPercent = round((($compareAtPrice - $price) / $compareAtPrice) * 100);
            }

            // Trả về cấu trúc JSON mà frontend cần
            return [
                'id'              => $product->ProductID,
                'name'            => $product->Name,
                'imageUrl'        => $imageUrl,
                'price'           => (float) $price,
                'originalPrice'   => $compareAtPrice ? (float) $compareAtPrice : null,
                'discountPercent' => $discountPercent,
                'rating'          => $product->rating ?? rand(40, 50) / 10, // Dữ liệu giả hoặc thật
                'reviewCount'     => $product->review_count ?? rand(50, 150),
            ];
        })->filter()->values(); // ->filter() để loại bỏ các sản phẩm bị null
                                 // ->values() để reset lại index của mảng

        // 4. Trả về JSON response
        return response()->json($formattedProducts);
    }
}