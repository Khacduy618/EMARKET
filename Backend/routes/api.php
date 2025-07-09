<?php
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\FeaturedProductController;
use App\Http\Controllers\NewArrivalController;
use App\Http\Controllers\BannerController;
use App\Http\Controllers\FlashSaleController;
use App\Http\Controllers\ProductDetailController;
use App\Http\Controllers\SearchController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CartController;

use App\Http\Controllers\VoucherController;
use App\Http\Controllers\AddressController;
use App\Http\Middleware\HandleImage;
use App\Http\Controllers\Admin\ProductControllers AS AdminProductController;
use App\Http\Controllers\ShopProductController;
use App\Http\Controllers\ChatController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

// Lấy API của Category Trả về dạng json theo CRUD 
Route::get('/category' ,[CategoryController::class , 'index']);
Route::get('/categorySubMenu' ,[CategoryController::class , 'category_cha_con']);
Route::get('/categorySubMenu/{id}/products' ,[CategoryController::class , 'category_cha_con']);
Route::get('/products/filter', [CategoryController::class, 'filterProducts']);
//api router cho sản phẩm nổi bật cho category 
Route::get('/featuredRelated-products/{id}', [FeaturedProductController::class, 'getRelatedProducts']);
Route::get('/categories/{category}/products', [CategoryController::class, 'showProductsCategory']);
Route::get('/categories/{category}/filters', [CategoryController::class, 'getCategoryFilters']);
///
Route::post('/CreateCategory', [CategoryController::class, 'store']);
Route::put('/UpdateCategory/{id}', [CategoryController::class, 'update']);
Route::delete('/DeleteCategory/{id}', [CategoryController::class, 'destroy']);
// Lấy API của Products Trả về dạng json theo CRUD 
Route::get('/Products', [ProductController::class, 'index']);
Route::post('/CreateProducts', [ProductController::class, 'store']);
Route::put('/UpdateProducts/{id}', [ProductController::class, 'update']);
Route::delete('/DeleteProducts/{id}', [ProductController::class, 'destroy']);
//API trả về giảm giá và % của product
Route::get('/ProductFinalPrice', [ProductController::class, 'ProductFinalPrice']);
// Laravel API – GET /api/products/best-selling
Route::get('/products/best-selling', [ProductController::class, 'getFeaturedProducts']);
//flash sale 
// Route::get('/flashSales', [ProductController::class, 'index']);
/////////////////////////////
Route::get('/flash-sales/active', [FlashSaleController::class, 'getFlashSalesGroupedBySlot']);
// router lấy api banner cho trang chủ
Route::get('/banners', [BannerController::class, 'index']);
Route::get('/category_banner', [BannerController::class, 'getBannersByPosition']);
//router cho sản phẩm mới nhất
Route::get('/new-arrivals', [NewArrivalController::class, 'index']);
Route::get('/productDetail/{productId}', [ProductDetailController::class, 'show']);
//router sản phẩm hôm nay xem thêm nữa
Route::get('/suggestions', [ProductController::class, 'getSuggestions']);
Route::get('/products/popular', [ProductController::class, 'getAllPopular']);
//api cho itemproducst
Route::get('/related-products', [ProductController::class, 'getRelatedProducts']);
Route::get('/products/{currentProductId}/related', [ProductController::class, 'getRelatedProducts']);
// router tìm kiếm lọc sản phẩm 
Route::get('/search/suggest', [SearchController::class, 'suggest']);
Route::get('/search', [SearchController::class, 'search']);
// API 1: Lấy các tùy chọn cho bộ lọc (danh mục, brand, khoảng giá...)
// Frontend sẽ gọi API này để lấy dữ liệu xây dựng nên thanh sidebar.
// Ví dụ cách gọi từ Frontend: /api/filters/available?base_category_id=1
Route::get('/filters/available', [CategoryController::class, 'getAvailableFilters']);

// API 2: Lấy danh sách sản phẩm đã được lọc theo các tiêu chí
// Frontend sẽ gọi API này để hiển thị danh sách sản phẩm chính.
// Ví dụ cách gọi từ Frontend: /api/products/filter?categories=5,8&sort=price_asc&page=1

Route::get('/user', function (Request $request) {
  return $request->user();
})->middleware('auth:sanctum');
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);


use App\Http\Controllers\Seller\SellerRegisterController;
use App\Http\Controllers\Admin\CategoryController as AdminCategory;
use App\Http\Controllers\Admin\ShopController as ShopController;
use App\Http\Controllers\Admin\ProductControllers;
use App\Http\Controllers\Admin\StatisticsController;
use App\Http\Controllers\Seller\ShopCategoryController; 

Route::middleware('auth:sanctum')->group(function (){
    // Auth routes already defined above, removing duplicates
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Cart routes - require authentication
    
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/items', [CartController::class, 'addItem']);
    Route::put('/cart/items/{cartItemId}/variant', [CartController::class, 'updateVariant']);
    Route::put('/cart/items/{cartItemId}', [CartController::class, 'updateItem']);
    Route::delete('/cart/items/{cartItemId}', [CartController::class, 'removeItem']);
    Route::delete('/cart/items', [CartController::class, 'removeMultipleItems']);

    //voucher routes
    Route::get('/vouchers', [VoucherController::class, 'index']);
    Route::get('/shops/{shopId}/eligible-vouchers', [VoucherController::class, 'getEligibleVouchersForShop']);

     //checkout
    Route::get('/addresses', [AddressController::class, 'index']);
    Route::put('/addresses/{addressId}/set-default', [AddressController::class, 'setDefault']);
    Route::get('/addresses/{address}', [AddressController::class, 'show']); // Lấy chi tiết 1 địa chỉ
    Route::put('/addresses/{address}', [AddressController::class, 'update']); // Cập nhật địa chỉ
    Route::post('/addresses', [AddressController::class, 'store']);
    
});


Route::get('/products/{product_id}/variants/filter',[ProductController::class, 'filterVariants']);
Route::get('/product-attributes/{productId}', [CartController::class, 'getProductAttributes']);


Route::middleware('auth:sanctum')->group(function () {
    Route::get('/seller/register', [SellerRegisterController::class, 'showRegistrationForm']);
    Route::post('/seller/register', [SellerRegisterController::class, 'register']);
    Route::get('/seller/dashboard', [SellerRegisterController::class, 'dashboard']); 
});

Route::middleware('auth:sanctum' )->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::middleware('seller')->group(function () {
        Route::get('/platform-categories', [ShopCategoryController::class, 'getPlatformCategories']);
        Route::get('/shop-categories', [ShopCategoryController::class, 'getShopCategories']);
        Route::post('/shop-categories', [ShopCategoryController::class, 'registerCategory']);
        Route::delete('/shop-categories/{shopCategoryID}', [ShopCategoryController::class, 'deleteCategory']);
        Route::get('/products', [ShopProductController::class, 'index']);
        Route::post('/shop/products', [ShopProductController::class, 'store']);
        Route::get('/shop/products/{productID}', [ShopProductController::class, 'show']);
        Route::post('/shop/products/{ProductID}', [ShopProductController::class, 'update']);
        Route::delete('/shop/products/{productID}', [ShopProductController::class, 'destroy']);
        Route::get('/attributes/{categoryID}', [ShopProductController::class, 'getAttributes']);
        Route::get('/shop/products/{productID}/attribute-values', [ShopProductController::class, 'getProductAttributeValues']);
    });
});


/*____________________________________________________________________
  |                            Admin route                           |
  |__________________________________________________________________| */

// Category route
Route::get('/admin/categories/getAllCategory', [AdminCategory::class, "getAllCategory"]);
Route::get('/admin/categories/list', [AdminCategory::class, "index"]);
Route::post('/admin/categories/create', [AdminCategory::class, "createPost"])->middleware(HandleImage::class);
Route::get('/admin/categories/edit/{id}', [AdminCategory::class, "editGet"]);
Route::patch('/admin/categories/update', [AdminCategory::class, "updateCategory"])->middleware(HandleImage::class);
Route::delete('/admin/categories/delete/{id}', [AdminCategory::class, 'deleteCategory']);

// Shop route
Route::get('/admin/shops', [ShopController::class, "index"]);
Route::put('/admin/shops/{shopId}/status', [ShopController::class, 'changeStatus']);
Route::get('/admin/shops/{id}', [ShopController::class, 'shopDetail']);

// Product route
Route::get('/admin/products', [ProductControllers::class, "index"]);
Route::put('/admin/products/{id}/approval-status', [ProductControllers::class, 'updateApprovalStatus']);
Route::get('/admin/products/{id}', [ProductControllers::class, 'detailProduct']);
Route::get('/admin/products', [AdminProductController::class, "index"]);

Route::put('/admin/products/{id}/approval-status', [AdminProductController::class, 'updateApprovalStatus']);

Route::get('/admin/products/{id}', [AdminProductController::class, 'detailProduct']);

// End product route




/* ___________________________________________________________________
  |                            Seller route                           |
  |___________________________________________________________________| */

Route::middleware('auth:sanctum')->group(function () {
  Route::get('/seller/register', [SellerRegisterController::class, 'showRegistrationForm']);
  Route::post('/seller/register', [SellerRegisterController::class, 'register']);
  Route::get('/seller/dashboard', [SellerRegisterController::class, 'dashboard']);
});
//route chat;



Route::middleware('auth:sanctum')->post('/auth/validate-socket-token', function (Request $request) {
    Log::info('--- Socket Token Validation Endpoint Hit ---');
    Log::info('Request Headers: ', $request->headers->all()); // Xem tất cả headers
    Log::info('Authorization Header Content: ' . $request->header('Authorization'));
    Log::info('Auth User (before check): ', ['user_id' => Auth::id(), 'user_object' => Auth::user() ? Auth::user() : null]);


    $user = Auth::user(); // Thử lấy user sau khi middleware chạy

    if ($user) {
        Log::info('Token VALIDATED for user:', ['user_id' => $user->UserID, 'username' => $user->Username]);
        return response()->json(['user' => [
            'id' => $user->UserID,
            'username' => $user->Username,
            'avatar_url' => $user->avatar_url ?? null,
        ]]);
    } else {
        Log::warning('Token VALIDATION FAILED: $request->user() is null or middleware did not authenticate.');
        // Thử kiểm tra thủ công token nếu $request->user() là null
        // (Phần này tùy thuộc vào cách bạn quản lý token - ví dụ với Sanctum Personal Access Tokens)
        // $token = $request->bearerToken();
        // if ($token) {
        //     $personalAccessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
        //     if ($personalAccessToken && $personalAccessToken->tokenable) {
        //          Log::info('Manual token check successful for user:', ['user_id' => $personalAccessToken->tokenable->UserID]);
        //          // Logic trả về user info nếu muốn
        //     } else {
        //          Log::warning('Manual token check failed: Token not found or not valid.');
        //     }
        // } else {
        //      Log::warning('Manual token check failed: No bearer token found.');
        // }
        return response()->json(['message' => 'Unauthenticated.'], 401);
    }
});

    // Route::get('/chat/my-conversations', [ChatController::class, 'getMyConversations']);
    Route::get('/chat/my-conversations', [ChatController::class, 'getMyConversations'])->middleware('auth:sanctum');

// API Routes for Socket.IO Server (cần cơ chế bảo vệ riêng, ví dụ IP Whitelisting hoặc Secret Key)
// Bạn có thể nhóm chúng lại với một middleware bảo vệ riêng.
Route::prefix('internal-chat-api')->middleware(['auth.socketserver'])->group(function () { // 'auth.socketserver' là middleware bạn tự tạo
    Route::post('/update-conversation-meta', [ChatController::class, 'updateConversationMeta']);
    Route::post('/mark-meta-as-read', [ChatController::class, 'markMetaAsRead']);
});

Route::middleware('auth:sanctum')->group(function () {
  Route::get('/seller/statistics', [StatisticsController::class, "getRevenueByDate"]);
  Route::get('/seller/orders', [StatisticsController::class, "getOrderByDate"]);
});