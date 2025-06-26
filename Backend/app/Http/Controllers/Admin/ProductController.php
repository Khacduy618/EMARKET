<?php

namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\Category;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Support\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
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
// --- CẤU HÌNH CHO ĐIỂM GỢI Ý ---
    /**
     * Số điểm thưởng cho một sản phẩm mới, tương đương với số lượt xem.
     * @var int
     */
    private const NEW_PRODUCT_SCORE_BOOST = 1000;

    /**
     * Một sản phẩm được coi là "mới" nếu được tạo trong vòng X ngày.
     * @var int
     */
    private const NEW_PRODUCT_DAYS_THRESHOLD = 7;

    /**
     * Lấy danh sách sản phẩm gợi ý cho trang chủ (giới hạn cố định).
     *
     * @return JsonResponse
     */
    public function getSuggestions(): JsonResponse
    {
        $query = $this->buildBaseSuggestionsQuery();
        
        // Lấy 30 sản phẩm gợi ý hàng đầu
        $products = $query->limit(30)->get();

        return response()->json($this->transformProductCollection($products));
    }

    /**
     * Lấy tất cả sản phẩm phổ biến, có hỗ trợ phân trang.
     * Dùng cho trang "Xem tất cả".
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getAllPopular(Request $request): JsonResponse
    {
        $limit = $request->query('limit', 12);
        $sortBy = $request->query('sortBy', 'popular');

        $query = Product::query()->publishedAndAvailable();

        $query->with([
            'primaryImage',
            'variants' => function ($variantQuery) {
                $variantQuery->where('IsActive', 1)->where('StockQuantity', '>', 0);
            }
        ]);

        // --- XỬ LÝ SẮP XẾP ---
        switch ($sortBy) {
            case 'price-low':
            case 'price-high':
                $direction = ($sortBy === 'price-low') ? 'ASC' : 'DESC';
                $query->orderBy(function ($subQuery) use ($direction) {
                    $subQuery->select('Price')
                        ->from('ProductVariants') // SỬA: Viết hoa chữ V
                        ->whereColumn('ProductVariants.ProductID', 'Products.ProductID') // SỬA: Viết hoa P và V
                        ->where('IsActive', 1)
                        ->orderBy('Price', $direction)
                        ->limit(1);
                }, $direction);
                break;

                case 'best-selling':
                    $query->select('Products.*') // <-- DÒNG QUAN TRỌNG NHẤT
                    ->selectSub(function ($subQuery) {
                        $subQuery->select(DB::raw('SUM(order_items.Quantity)'))
                            ->from('OrderItems as order_items')
                            ->join('ProductVariants as variants', 'order_items.VariantID', '=', 'variants.VariantID')
                            ->whereColumn('variants.ProductID', 'Products.ProductID')
                            ->where('order_items.CreatedAt', '>=', now()->subMonth());
                    }, 'sold_count');
    
                $query->orderBy('sold_count', 'DESC');
                break;
    
            
            case 'newest':
                $query->latest('CreatedAt');
                break;
    
            case 'popular':
            default:
                // Sắp xếp theo "điểm gợi ý" như đã làm
                $query->orderByRaw(
                    '(viewCount + CASE WHEN CreatedAt >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1000 ELSE 0 END) DESC'
                );
                break;
        }
        
        // Thêm sắp xếp phụ để đảm bảo thứ tự nhất quán
        $query->latest('ProductID');

        // --- GỌI PAGINATE SAU KHI ĐÃ SẮP XẾP ---
        /** @var \Illuminate\Pagination\LengthAwarePaginator $paginatedProducts */
        $paginatedProducts = $query->paginate($limit);

        // Biến đổi dữ liệu của các sản phẩm trong trang hiện tại
        $this->transformPaginatorCollection($paginatedProducts);

        return response()->json($paginatedProducts);
    }

    /**
     * Xây dựng câu truy vấn cơ sở cho việc lấy sản phẩm.
     * Bao gồm: Lọc sản phẩm hợp lệ, Eager Loading và Sắp xếp theo "điểm gợi ý".
     *
     * @return EloquentBuilder|QueryBuilder
     */
    private function buildBaseSuggestionsQuery(): EloquentBuilder|QueryBuilder
    {
        $query = Product::query()->publishedAndAvailable();

        // Tải trước các quan hệ cần thiết để tránh N+1 query
        $query->with([
            'primaryImage',
            'variants' => function ($variantQuery) {
                // Chỉ tải các biến thể hợp lệ để tính giá thấp nhất
                $variantQuery->where('IsActive', 1)->where('StockQuantity', '>', 0);
            }
        ]);

        // Sắp xếp theo "điểm gợi ý" = viewCount + điểm thưởng cho sản phẩm mới.
        // Dùng `orderByRaw` cho các biểu thức SQL phức tạp.
        $query->orderByRaw(
            '(viewCount + CASE WHEN CreatedAt >= DATE_SUB(NOW(), INTERVAL ? DAY) THEN ? ELSE 0 END) DESC',
            [self::NEW_PRODUCT_DAYS_THRESHOLD, self::NEW_PRODUCT_SCORE_BOOST]
        );

        // Thêm một sắp xếp phụ theo ID để đảm bảo thứ tự nhất quán khi có cùng điểm.
        $query->latest('ProductID');

        return $query;
    }

    /**
     * Biến đổi một collection các sản phẩm.
     *
     * @param Collection $products
     * @return Collection
     */
    private function transformProductCollection(Collection $products): Collection
    {
        return $products->map(fn($product) => $this->transformProduct($product));
    }

    /**
     * Biến đổi collection bên trong một đối tượng Paginator.
     *
     * @param LengthAwarePaginator $paginator
     * @return void
     */
    private function transformPaginatorCollection(LengthAwarePaginator &$paginator): void
    {
        // Lấy collection hiện tại, biến đổi nó, và đặt lại vào Paginator
        $transformedItems = $this->transformProductCollection($paginator->getCollection());
        $paginator->setCollection($transformedItems);
    }

    /**
     * Biến đổi một đối tượng Product duy nhất sang định dạng JSON mong muốn.
     *
     * @param Product $product
     * @return array
     */
    private function transformProduct(Product $product): array
    {
        return [
            'ProductID' => $product->ProductID,
            'Name' => $product->Name,
            'Description' => $product->Description,
            'Discount' => $product->Discount,
            'viewCount' => $product->viewCount,
            // Lấy giá thấp nhất từ các biến thể đã được tải trước
            'Price' => $product->variants->min('Price'),
            // Dùng optional chaining và null coalescing operator để an toàn hơn
            'PrimaryImageURL' => $product->primaryImage?->ImageURL ?? null,
            'CreatedAt'=>$product->CreatedAt,
        ];
    }
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
        $productsData = DB::table('Products as p')
            ->leftJoin('ProductImages as pi', function ($join) {
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
    public function getFeaturedProducts(Request $request): JsonResponse
    {
        try {
            $perPage = $request->query('per_page', 12);

            $products = DB::table('Products as p')
                ->select(
                    'p.ProductID',
                    'p.Name as ProductName',
                    'pi.ImageURL as PrimaryImage',
                    DB::raw('MIN(pv.Price) as CurrentPrice'),
                    DB::raw('MAX(pv.CompareAtPrice) as OriginalPrice'),
                    DB::raw('COALESCE(SUM(oi.Quantity), 0) as TotalQuantitySold')
                )
                ->join('ProductVariants as pv', 'p.ProductID', '=', 'pv.ProductID')
                ->leftJoin('OrderItems as oi', 'pv.VariantID', '=', 'oi.VariantID')

                // ========== DÒNG CẦN SỬA Ở ĐÂY ==========
                // Sửa 'productimage' thành tên bảng đúng, ví dụ 'ProductImages'
                ->leftJoin('ProductImages as pi', function ($join) {
                    $join->on('p.ProductID', '=', 'pi.ProductID')
                         ->where('pi.IsPrimary', '=', 1);
                })
                // ==========================================

                ->where('p.IsActive', 1)
                ->where('pv.IsActive', 1)
                ->where('p.AdminApprovalStatus', 'Approved')
                ->where(function ($query) {
                    $query->where('p.Discount', '>', 0)
                          ->orWhereRaw('pv.CompareAtPrice > pv.Price');
                })
                ->groupBy('p.ProductID', 'p.Name', 'pi.ImageURL')
                ->orderBy('TotalQuantitySold', 'desc')
                ->orderBy('p.Name', 'asc')
                ->paginate($perPage);

            return response()->json([
                'success' => true,
                'message' => 'Lấy danh sách sản phẩm nổi bật thành công.',
                'data' => $products
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Đã có lỗi xảy ra.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}