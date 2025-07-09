<?php

namespace App\Http\Controllers;
use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\Category;
use App\Models\ProductVariant;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
{
    $products = DB::table('Products')
        ->leftJoin('ProductImages', 'Products.ProductID', '=', 'ProductImages.ProductID')
        ->select('Products.*', 'ProductImages.ImageURL')
        ->where('ProductImages.IsPrimary', 1)
        ->get();

    return response()->json($products);
}
    public function store(Request $request)
    {
        try {
        // Validate dữ liệu đầu vào
        $request->validate([
            'ShopID' => 'required|integer|exists:Shops,ShopID',
            'CategoryID' => 'required|integer|exists:platformcategories,CategoryID',
            'Name' => 'required|string|max:255',
            'Description' => 'nullable|string',
            'SKU' => 'nullable|string|max:100|unique:Products,SKU',
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
            'ShopID' => 'sometimes|integer|exists:Shops,ShopID',
            'CategoryID' => 'sometimes|integer|exists:platformcategories,CategoryID',
            'Name' => 'sometimes|string|max:255',
            'Description' => 'nullable|string',
            'SKU' => 'sometimes|string|max:100|unique:Products,SKU,' . $id . ',ProductID',
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
        $products = Product::where('Products.IsActive', 1) // Chỉ định rõ bảng cho cột IsActive
            ->where('Products.AdminApprovalStatus', 'Approved') // Chỉ định rõ bảng
            ->where('Products.Discount', '>', 0) // Lấy sản phẩm có giảm giá (từ bảng Products)
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
                              'AttributeValues' => function ($q_attr_val) {
                                  $q_attr_val->select('AttributeValues.AttributeValueID', 'AttributeValues.Value', 'AttributeValues.AttributeID')
                                             ->with('Attribute:AttributeID,Name'); // Lấy tên thuộc tính (Màu sắc, Kích thước)
                              }
                          ]);
                },
            ])
            ->limit(11)
            ->select('Products.ProductID', 'Products.Name', 'Products.Discount') // Chọn cột từ bảng products
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
         $variantSubQuery = DB::raw("(
        SELECT
            ProductID,
            Price AS VariantMinPrice,
            SKU AS VariantSKU,
            StockQuantity AS VariantStockQuantity,
            ImageURL AS VariantImageURL,
            -- DÒNG THAY ĐỔI: Lấy CompareAtPrice NHỎ NHẤT từ TẤT CẢ các biến thể của sản phẩm này
            MinCompareAtPrice AS VariantCompareAtPrice
        FROM (
            SELECT
                pv.*,
                ROW_NUMBER() OVER(PARTITION BY pv.ProductID ORDER BY pv.Price ASC, pv.VariantID ASC) as rn,
                -- Tính toán giá so sánh nhỏ nhất trên toàn bộ nhóm sản phẩm
                MIN(CASE
                        WHEN pv.CompareAtPrice IS NOT NULL AND pv.CompareAtPrice > pv.Price THEN pv.CompareAtPrice
                        ELSE NULL
                    END) OVER (PARTITION BY pv.ProductID) as MinCompareAtPrice
            FROM ProductVariants pv
            WHERE pv.IsActive = 1
        ) as ranked_variants
        WHERE rn = 1 -- Chỉ lấy thông tin của biến thể rẻ nhất (SKU, Image,...)
    ) as variant_info");

    $productsData = DB::table('Products as p')
        ->leftJoin('ProductImages as pi', function ($join) {
            $join->on('p.ProductID', '=', 'pi.ProductID')
                 ->where('pi.IsPrimary', '=', 1);
        })
        // SỬ DỤNG TRUY VẤN CON MỚI Ở ĐÂY
        ->leftJoin($variantSubQuery, 'p.ProductID', '=', 'variant_info.ProductID')
        ->where('p.IsActive', 1)
        ->where('p.AdminApprovalStatus', 'Approved')
        ->whereNotNull('variant_info.VariantMinPrice')
        ->orderByDesc('p.Discount')
        ->orderByDesc('p.CreatedAt')
        ->limit(6)
        ->select(
            'p.ProductID',
            'p.Name as ProductName',
            'p.Description as ProductDescription',
            'p.Discount as ProductLevelDiscount',
            'variant_info.VariantMinPrice as Price',
            'variant_info.VariantCompareAtPrice as CompareAtPrice', // Đã được cập nhật theo logic mới
            'variant_info.VariantSKU as SKU',
            'variant_info.VariantStockQuantity as StockQuantity',
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
                'Variants' => fn($query) => $query->where('IsActive', 1)->orderBy('Price', 'asc'),
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

    public function showProductsCategory(Request $request, Category $category)
    {
        // === BƯỚC 1: LẤY ID CỦA DANH MỤC HIỆN TẠI VÀ TẤT CẢ CÁC DANH MỤC CON ===
        $categoryIds = $this->getAllChildCategoryIds($category);
        $categoryIds[] = $category->CategoryID;

        // === BƯỚC 2: XÂY DỰNG QUERY CƠ BẢN ===
        $query = Product::query()
            ->whereIn('CategoryID', $categoryIds)
            // Eager Loading các quan hệ để tối ưu hiệu năng, tránh N+1 query
            ->with(['images', 'Variants', 'Category']);

        // === BƯỚC 3: XỬ LÝ SẮP XẾP (SORTING) DỰA TRÊN HÌNH ẢNH MỚI ===
        // Lấy giá trị sort từ request, mặc định là 'popular' (Phổ biến)
        $sort = $request->input('sort', 'popular');

        switch ($sort) {
            case 'price_asc':
                // Sắp xếp theo giá tăng dần
                // Lưu ý: Cần join và group by để lấy giá từ bảng variants
                $query->select('Products.*')
                      ->join('Variants', 'Products.ProductID', '=', 'Variants.ProductID')
                      ->groupBy('Products.ProductID')
                      ->orderBy('Variants.Price', 'asc');
                break;

            case 'price_desc':
                // Sắp xếp theo giá giảm dần
                $query->select('Products.*')
                      ->join('Variants', 'Products.ProductID', '=', 'Variants.ProductID')
                      ->groupBy('Products.ProductID')
                      ->orderBy('Variants.Price', 'desc');
                break;

            case 'bestselling':
                // Sắp xếp theo "Bán Chạy"
                // YÊU CẦU: Cần có bảng `order_items` chứa `ProductID` và `Quantity` để tính tổng đã bán.
                // Nếu cấu trúc DB của bạn khác, hãy sửa lại đoạn này.
                $query->leftJoin('order_items', 'Products.ProductID', '=', 'order_items.ProductID')
                      ->selectRaw('Products.*, SUM(order_items.Quantity) as total_sold')
                      ->groupBy('Products.ProductID') // Quan trọng khi dùng hàm tổng hợp SUM
                      ->orderByDesc('total_sold');
                break;

            case 'newest':
                // Sắp xếp theo "Mới Nhất", dựa vào ProductID giảm dần (giả định ID cao hơn là mới hơn)
                $query->orderBy('Products.ProductID', 'desc');
                break;

            case 'popular':
            default:
                // Sắp xếp theo "Phổ Biến" hoặc mặc định.
                // Bạn có thể định nghĩa 'popular' theo nhiều cách (lượt xem, bán chạy,...).
                // Ở đây, chúng ta tạm lấy sản phẩm mới nhất làm mặc định cho "Phổ biến".
                $query->orderBy('Products.ProductID', 'desc');
                break;
        }

        // === BƯỚC 4: PHÂN TRANG (PAGINATION) ===
        $perPage = $request->input('per_page', 20);
        $paginatedProducts = $query->paginate($perPage);

        // === BƯỚC 5: BIẾN ĐỔI DỮ LIỆU ĐỂ KHỚP VỚI FRONTEND ===
        $transformedProducts = $paginatedProducts->getCollection()->map(function ($product) {
            return [
                'ProductID' => $product->ProductID,
                'Name'      => $product->Name,
                'images'    => $product->images->map(function ($image) {
                    return [
                        'ImageID'   => $image->ImageID,
                        'ImageURL'  => $image->ImageURL,
                        'IsPrimary' => $image->IsPrimary,
                    ];
                }),
                'Variants'  => $product->variants->map(function ($variant) {
                    return [
                        'VariantID'      => $variant->VariantID,
                        'Price'          => $variant->Price,
                        'CompareAtPrice' => $variant->CompareAtPrice,
                    ];
                }),
                'category'  => [
                    'CategoryID'       => $product->category->CategoryID,
                    'Name'             => $product->category->Name,
                    'ParentCategoryID' => $product->category->ParentCategoryID,
                ]
            ];
        });

        // === BƯỚC 6: TRẢ VỀ RESPONSE JSON VỚI CẤU TRÚC ĐÚNG ===
        // Cấu trúc này khớp với interface `PaginatedResponse<T>` bên phía Next.js
        return response()->json([
            'data'         => $transformedProducts,
            'total'        => $paginatedProducts->total(),
            'current_page' => $paginatedProducts->currentPage(),
            'last_page'    => $paginatedProducts->lastPage(),
        ]);
    }
     private function getAllChildCategoryIds(Category $category): array
    {
        $childIds = [];
        // Sử dụng eager loading cho quan hệ đệ quy để tối ưu
        $children = $category->load('allChildren')->allChildren;

        foreach ($children as $child) {
            $childIds[] = $child->CategoryID;
            if ($child->allChildren->isNotEmpty()) {
                $childIds = array_merge($childIds, $this->getAllChildCategoryIds($child));
            }
        }
        return $childIds;
    }

    /**
     * Lấy danh sách các biến thể sản phẩm và các tùy chọn thuộc tính khả dụng dựa trên các lựa chọn hiện tại.
     *
     * @param Request $request
     * @param int $productId
     * @return \Illuminate\Http\JsonResponse
     */
    public function filterVariants(Request $request, $productId)
    {
        $selectedAttributeValueIds = explode(',', $request->query('attribute_values', ''));
        // Loại bỏ các giá trị rỗng và chuyển sang kiểu int
        $selectedAttributeValueIds = array_filter(array_map('intval', $selectedAttributeValueIds));
        $numSelectedAttributes = count($selectedAttributeValueIds);

        // 1. Lấy tất cả các VariantID hợp lệ (active, in_stock) cho sản phẩm này
        // Đây là base set để tìm kiếm
        $baseValidVariantIds = ProductVariant::where('ProductID', $productId)
            ->where('IsActive', 1)
            ->where('StockQuantity', '>', 0)
            ->pluck('VariantID')
            ->toArray();

        if (empty($baseValidVariantIds)) {
            return response()->json([
                'success' => true,
                'message' => 'No active or in-stock variants found for this product.',
                'data' => [
                    'selected_product_id' => $productId,
                    'current_selected_attribute_value_ids' => $selectedAttributeValueIds,
                    'matching_variants_count' => 0,
                    'exact_matched_variant' => null,
                    'available_attributes_options' => []
                ]
            ]);
        }

        // 2. Tìm các VariantID khớp với TẤT CẢ các AttributeValueID đã chọn
        $query = DB::table('ProductVariants AS PV')
            ->select('PV.VariantID')
            ->join('ProductVariantAttribute AS PVA', 'PV.VariantID', '=', 'PVA.VariantID')
            ->where('PV.ProductID', $productId)
            ->where('PV.IsActive', 1)
            ->where('PV.StockQuantity', '>', 0);

        if ($numSelectedAttributes > 0) {
            $query->whereIn('PVA.AttributeValueID', $selectedAttributeValueIds)
                ->groupBy('PV.VariantID')
                ->havingRaw('COUNT(DISTINCT PVA.AttributeValueID) = ?', [$numSelectedAttributes]);
        } else {
            // Nếu không có thuộc tính nào được chọn, tất cả baseValidVariantIds đều là "matching_variants"
            $query->whereIn('PV.VariantID', $baseValidVariantIds);
        }

        $matchingVariantIds = $query->pluck('VariantID')->toArray();

        // Chuẩn bị dữ liệu trả về
        $exactMatchedVariant = null;

        if (empty($matchingVariantIds)) {
            // Không tìm thấy biến thể nào khớp với các lựa chọn hiện tại
            $matchingVariantsCount = 0;
            $availableAttributesOptions = $this->getAvailableAttributeOptions(
                $productId,
                $baseValidVariantIds, // Vẫn dựa vào các variant ban đầu để hiển thị các tùy chọn cơ bản
                $selectedAttributeValueIds
            );
        } else {
            // Lấy thông tin chi tiết của các biến thể khớp
            $matchingVariants = ProductVariant::with(['attributeValues.attribute'])
                ->whereIn('VariantID', $matchingVariantIds)
                ->get();

            $matchingVariantsCount = $matchingVariants->count();

            // Nếu chỉ có một biến thể khớp duy nhất và tất cả thuộc tính của nó đã được chọn
            if ($matchingVariantsCount === 1) {
                $variant = $matchingVariants->first();
                $variantAttributeValueIds = $variant->attributeValues->pluck('AttributeValueID')->toArray();

                // Kiểm tra xem tất cả các thuộc tính của variant đó có nằm trong selectedAttributeValueIds không
                // Điều này có nghĩa là người dùng đã chọn đầy đủ các thuộc tính để xác định một variant duy nhất
                if (count($selectedAttributeValueIds) === count($variantAttributeValueIds) &&
                    empty(array_diff($selectedAttributeValueIds, $variantAttributeValueIds)) &&
                    empty(array_diff($variantAttributeValueIds, $selectedAttributeValueIds))) {
                    $exactMatchedVariant = [
                        'variant_id' => $variant->VariantID,
                        'product_id' => $variant->ProductID,
                        'sku' => $variant->SKU,
                        'price' => $variant->Price,
                        'compare_at_price' => $variant->CompareAtPrice,
                        'stock_quantity' => $variant->StockQuantity,
                        'image_url' => $variant->ImageURL,
                        'attributes_display' => $variant->attributeValues->map(function($av) {
                            return [
                                'attribute_id' => $av->AttributeID,
                                'name' => $av->attribute->Name,
                                'value_id' => $av->AttributeValueID,
                                'value' => $av->Value
                            ];
                        })
                    ];
                }
            }

            // Lấy các tùy chọn thuộc tính khả dụng dựa trên CÁC BIẾN THỂ CÒN LẠI SAU KHI LỌC
            $availableAttributesOptions = $this->getAvailableAttributeOptions(
                $productId,
                $matchingVariantIds, // Giờ đây chỉ dựa vào các variant đã khớp
                $selectedAttributeValueIds
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Product variants and available options retrieved successfully.',
            'data' => [
                'selected_product_id' => $productId,
                'current_selected_attribute_value_ids' => $selectedAttributeValueIds,
                'matching_variants_count' => $matchingVariantsCount,
                'exact_matched_variant' => $exactMatchedVariant,
                'available_attributes_options' => $availableAttributesOptions
            ]
        ]);
    }

    /**
     * Hàm helper để lấy các tùy chọn thuộc tính khả dụng.
     *
     * @param int $productId
     * @param array $currentValidVariantIds Các VariantID còn khả năng được chọn (đã lọc theo các lựa chọn trước đó và tồn kho)
     * @param array $selectedAttributeValueIds Các AttributeValueID đã được chọn
     * @return array
     */
    private function getAvailableAttributeOptions($productId, array $currentValidVariantIds, array $selectedAttributeValueIds)
    {
        // 1. Lấy tất cả các Attribute (và AttributeValue) mà sản phẩm này có thể có
        $allProductAttributes = DB::table('Attributes AS A')
            ->select('A.AttributeID', 'A.Name AS AttributeName', 'AV.AttributeValueID', 'AV.Value AS AttributeValue')
            ->join('AttributeValues AS AV', 'A.AttributeID', '=', 'AV.AttributeID')
            ->join('ProductVariantAttribute AS PVA', 'AV.AttributeValueID', '=', 'PVA.AttributeValueID')
            ->join('ProductVariants AS PV', 'PVA.VariantID', '=', 'PV.VariantID')
            ->where('PV.ProductID', $productId)
            ->groupBy('A.AttributeID', 'A.Name', 'AV.AttributeValueID', 'AV.Value') // Group by all selected columns
            ->orderBy('A.AttributeID')
            ->get()
            ->groupBy('AttributeName'); // Nhóm theo tên thuộc tính để dễ xử lý

        $availableOptions = [];

        foreach ($allProductAttributes as $attributeName => $attributeValues) {
            $attributeId = $attributeValues->first()->AttributeID;
            $values = [];

            foreach ($attributeValues as $av) {
                $isAvailable = false;
                $reason = null;

                // Kiểm tra xem AttributeValue này có nằm trong bất kỳ currentValidVariantIds nào không
                $checkAvailability = DB::table('ProductVariantAttribute')
                    ->where('AttributeValueID', $av->AttributeValueID)
                    ->whereIn('VariantID', $currentValidVariantIds)
                    ->exists();

                if ($checkAvailability) {
                    $isAvailable = true;
                } else {
                    $reason = 'Không có biến thể nào còn hàng với lựa chọn hiện tại và giá trị này.';
                }

                $values[] = [
                    'attribute_value_id' => $av->AttributeValueID,
                    'value' => $av->AttributeValue,
                    'is_selected' => in_array($av->AttributeValueID, $selectedAttributeValueIds),
                    'is_available' => $isAvailable,
                    'reason' => $reason // Lý do không khả dụng (chỉ khi !is_available)
                ];
            }
            $availableOptions[] = [
                'attribute_id' => $attributeId,
                'attribute_name' => $attributeName,
                'values' => $values
            ];
        }

        return $availableOptions;
    }
}