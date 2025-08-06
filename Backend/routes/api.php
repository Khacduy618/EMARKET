<?php
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\FeaturedProductController;
use App\Http\Controllers\NewArrivalController;
use App\Http\Controllers\BannerController;
use App\Http\Controllers\FlashSaleController;
use App\Http\Controllers\ProductDetailController;
use App\Http\Controllers\SearchController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CartController;
use App\Http\Controllers\AddressController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\VoucherController;
use App\Http\Middleware\HandleImage;
use App\Http\Controllers\Seller\ShopProductController;
use App\Http\Controllers\ChatController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Seller\SellerRegisterController;
use App\Http\Controllers\Admin\CategoryController as AdminCategory;
use App\Http\Controllers\Admin\ShopController as ShopController;
use App\Http\Controllers\Admin\ProductControllers;
use App\Http\Controllers\Admin\StatisticsController;
use App\Http\Controllers\Seller\ShopCategoryController; 
use App\Http\Controllers\Seller\SellerOrderController;
use App\Http\Controllers\VNPayController;

use App\Http\Controllers\SellerOrderController;

use Laravel\Fortify\Http\Controllers\NewPasswordController;


Route::get('/test', function () {
    // Ghi log để chắc chắn route này được chạy
    \Illuminate\Support\Facades\Log::info('--- /api/test route was hit! ---'); 
    
    return response()->json(['message' => 'Laravel API is alive and working!']);
});
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
Route::get('/searchAll', [SearchController::class, 'searchAll']);
Route::get('/filters/available', [CategoryController::class, 'getAvailableFilters']);


Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
    ->middleware(['signed', 'throttle:6,1'])
    ->name('verification.verify');



Route::post('/email/resend', [AuthController::class, 'resendVerificationEmail'])
    ->middleware('throttle:6,1') // Chỉ cho phép 6 request mỗi phút từ 1 IP
    ->name('verification.resend'); // Đặt tên cho route

Route::get('/csrf-init', function () {
    return response()->json(['message' => 'CSRF cookie set.']);
});

// Route me của bạn BẮT BUỘC phải CÓ middleware auth:sanctum
Route::middleware('auth:sanctum')->get('/me', function (Request $request) {
    return $request->user();
});

Route::get('/user', function (Request $request) {
  return $request->user();
})->middleware('auth:sanctum');

Route::middleware(['auth:sanctum', 'role:Seller,Admin'])->get('/seller/dashboard', function () {
    $data = [
        'name' => 'Seller Test',
        'role' => 'Seller',
        'status' => 'active'
    ];
    return response()->json($data);
});


Route::middleware(['auth:sanctum', 'role:Admin'])->group(function () {
    Route::get('/admin/users', function () {
        $users = [
            [
                'id' => 1,
                'name' => 'Admin Test',
                'email' => 'admin@test.com',
                'role' => 'Admin'
            ],
            [
                'id' => 2,
                'name' => 'Seller Test',
                'email' => 'seller@test.com',
                'role' => 'Seller'
            ]
        ];
        return response()->json($users);
    });
});

// Route::middleware('auth:sanctum')->group(function () {
//     // Route để đặt làm mặc định
//     Route::post('/addresses/{address}/set-default', [AddressController::class, 'setDefault']);
//     // Route Resource cho các hành động CRUD khác
//     Route::apiResource('addresses', AddressController::class);
// });

Route::middleware('auth:sanctum')->group(function (){

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
    Route::delete('addresses/{address}', [AddressController::class, 'destroy']);
     

    Route::get('/orders', [OrderController::class, 'index']);

    Route::get('/orders/{orderId}', [OrderController::class, 'show']);
    // Route để tạo đơn hàng nháp (khi nhấn "Place Order")
    Route::post('/orders/place', [OrderController::class, 'placeOrder']);

    Route::delete('/orders/{orderId}/cancel-draft', [OrderController::class, 'cancelDraft']);
    // Route MỚI để xác nhận và hoàn tất đơn hàng đã có
    Route::put('/orders/{orderId}/complete', [OrderController::class, 'completeOrder']);

    Route::post('/vnpay/create-payment/{orderId}', [VNPayController::class, 'createPayment']);
    
    
});
Route::get('/vnpay/return', [VnPayController::class, 'handleReturn'])->name('vnpay.return');


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
Route::get('/admin/products', [ProductControllers::class, "index"]);

Route::put('/admin/products/{id}/approval-status', [ProductControllers::class, 'updateApprovalStatus']);

Route::get('/admin/products/{id}', [ProductControllers::class, 'detailProduct']);

// End product route




/* ___________________________________________________________________
  |                            Seller route                           |
  |___________________________________________________________________| */

// Seller Register + Dashboard (auth required)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/seller/register', [SellerRegisterController::class, 'showRegistrationForm']);
    Route::post('/seller/register', [SellerRegisterController::class, 'register']);
    Route::get('/seller/dashboard', [SellerRegisterController::class, 'dashboard']);
    Route::get('/user', [AuthController::class, 'user']);

    // Seller protected routes (must be seller)
    Route::middleware('seller')->group(function () {
        // Shop category
        Route::get('/platform-categories', [ShopCategoryController::class, 'getPlatformCategories']);
        Route::get('/shop-categories', [ShopCategoryController::class, 'getShopCategories']);
        Route::post('/shop-categories', [ShopCategoryController::class, 'registerCategory']);
        Route::delete('/shop-categories/{shopCategoryID}', [ShopCategoryController::class, 'deleteCategory']);

        // Shop products
        Route::get('/products', [ShopProductController::class, 'index']);
        Route::post('/shop/products', [ShopProductController::class, 'addProduct']);
        Route::get('/shop/products/{productID}', [ShopProductController::class, 'showProduct']);
        Route::post('/shop/products/{productID}', [ShopProductController::class, 'updateProduct']);
        Route::delete('/shop/products/{productID}', [ShopProductController::class, 'destroy']);
        Route::get('/attributes/{categoryID}', [ShopProductController::class, 'getAttributes']);
        Route::get('/shop/products/{productID}/attribute-values', [ShopProductController::class, 'getProductAttributeValues']);

        // Orders
        Route::get('/seller/orders', [SellerOrderController::class, 'index']);
        // Route::get('/seller/orders/{id}', [SellerOrderController::class, 'show']);
        Route::put('/seller/orders/{id}/status', [SellerOrderController::class, 'updateStatus']);

        Route::get('/seller/orders/{id}', [SellerOrderController::class, 'show'])->name('seller.orders.show');
        Route::put('/seller/orders/{orderId}/confirm', [SellerOrderController::class, 'confirmOrder']);
        Route::put('/seller/orders/{orderId}/cancel', [SellerOrderController::class, 'cancelOrder']);
        Route::put('/seller/orders/{orderId}/print', [SellerOrderController::class, 'printShippingLabel']);
        
    
        // Statistics
        Route::get('/seller/statistics', [StatisticsController::class, "getRevenueByDate"]);
        Route::get('/seller/statistics/orders', [StatisticsController::class, 'getOrdersByAction']);

        Route::get('/seller/statistics/orders/deaill/{id}', [StatisticsController::class, 'showOderDetail']);
    });
});

//shipping_requests 
Route::post('/webhook', [SellerOrderController::class, 'handle']);



// ================= ADMIN ROUTES =================== //



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
  Route::get('/seller/orderss', [StatisticsController::class, "getOrderByDate"]);
});

Route::middleware(['auth:sanctum', 'role:Admin'])->prefix('admin')->group(function () {
    // Route này sẽ tự tạo:
    // GET    /api/admin/users             -> index()
    // POST   /api/admin/users             -> store()
    // GET    /api/admin/users/{user}      -> show()
    // PUT    /api/admin/users/{user}      -> update()
    // DELETE /api/admin/users/{user}      -> destroy()
    Route::apiResource('users', AdminUserController::class)->except(['show']); // Bỏ show() nếu không cần

    // Route cập nhật trạng thái vẫn giữ riêng
    Route::patch('/users/{user:UserID}/status', [AdminUserController::class, 'updateStatus']);
});

Route::post('/check-phone-availability', [AuthController::class, 'checkPhone'])
    ->middleware('throttle:10,1'); // Giới hạn 10 request/phút mỗi IP
Route::post('/check-username-availability', [AuthController::class, 'checkUsername']);
Route::post('/check-email-availability', [AuthController::class, 'checkEmail']);
// Product route
Route::get('/admin/products', [ProductControllers::class, "index"]);
Route::put('/admin/products/{id}/approval-status', [ProductControllers::class, 'updateApprovalStatus']);
Route::get('/admin/products/{id}', [ProductControllers::class, 'detailProduct']);
