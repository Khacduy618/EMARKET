<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\ProductVariant; // Import ProductVariant
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB; // Keep DB facade for now if needed elsewhere, but refactor index
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class CartController extends Controller
{
    /**
     * Get the user's cart.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        try {
            $cartData = DB::select("
                WITH RankedVariantAttributes AS (
            SELECT
                pva.VariantID,
                a.AttributeID,
                a.Name AS AttributeName,
                av.AttributeValueID,
                av.Value AS AttributeValue,
                ROW_NUMBER() OVER (PARTITION BY pva.VariantID ORDER BY a.AttributeID) as rn
            FROM ProductVariantAttribute pva
            JOIN AttributeValues av ON pva.AttributeValueID = av.AttributeValueID
            JOIN Attributes a ON av.AttributeID = a.AttributeID
        )
        SELECT
            c.CartID,
            c.UserID,
            c.CreatedAt,
            c.UpdatedAt,
            ci.CartItemID,
            ci.VariantID,
            ci.ShopID,
            ci.Quantity,
            ci.AddedAt,
            ci.UpdatedAt AS CartItemUpdatedAt,
            pv.SKU,
            pv.Price AS VariantPrice,
            pv.CompareAtPrice,
            pv.StockQuantity,
            pv.ImageURL AS VariantImageURL,
            p.ProductID,
            p.Name AS ProductName,
            p.Description AS ProductDescription,
            p.Discount AS ProductDiscount,
            s.ShopName,
            s.ShopPhone, -- THÊM DÒNG NÀY
            rva.AttributeID,
            rva.AttributeName,
            rva.AttributeValueID,
            rva.AttributeValue
        FROM Carts c
        JOIN CartItems ci ON c.CartID = ci.CartID
        JOIN ProductVariants pv ON ci.VariantID = pv.VariantID
        JOIN Products p ON pv.ProductID = p.ProductID
        JOIN Shops s ON ci.ShopID = s.ShopID
        LEFT JOIN RankedVariantAttributes rva
            ON pv.VariantID = rva.VariantID
            AND rva.rn <= 3
        WHERE c.UserID = ?
            ", [$user->UserID]);

            Log::info('Cart data fetched from DB. Number of rows: ' . count($cartData));

            $cart = [
                'CartID' => null,
                'UserID' => $user->UserID,
                'CreatedAt' => null,
                'UpdatedAt' => null,
                'cartItems' => []
            ];

            $cartItems = [];

            foreach ($cartData as $item) {
                if (!isset($cartItems[$item->CartItemID])) {
                    $cart['CartID'] = $item->CartID;
                    $cart['UserID'] = $item->UserID;
                    $cart['CreatedAt'] = $item->CreatedAt;
                    $cart['UpdatedAt'] = $item->UpdatedAt;

                    $cartItems[$item->CartItemID] = [
                        'CartItemID' => $item->CartItemID,
                        'CartID' => $item->CartID,
                        'VariantID' => $item->VariantID,
                        'ShopID' => $item->ShopID,
                        'Quantity' => $item->Quantity,
                        'AddedAt' => $item->AddedAt,
                        'CartItemUpdatedAt' => $item->CartItemUpdatedAt,
                        'productVariant' => [
                            'VariantID' => $item->VariantID,
                            'ProductID' => $item->ProductID,
                            'SKU' => $item->SKU,
                            'Price' => $item->VariantPrice,
                            'CompareAtPrice' => $item->CompareAtPrice,
                            'StockQuantity' => $item->StockQuantity,
                            'ImageURL' => $item->VariantImageURL,
                            'CreatedAt' => null,
                            'UpdatedAt' => null,
                            'product' => [
                                'ProductID' => $item->ProductID,
                                'ShopID' => $item->ShopID,
                                'CategoryID' => null,
                                'Name' => $item->ProductName,
                                'Description' => $item->ProductDescription,
                                'Discount' => $item->ProductDiscount,
                                'AdminApprovalStatus' => 'Approved',
                                'ReasonForRejection' => null,
                                'CreatedAt' => null,
                                'UpdatedAt' => null
                            ],
                            'attributeValues' => []
                        ],
                        'shop' => [
                            'ShopID' => $item->ShopID,
                            'UserID' => null,
                            'ShopName' => $item->ShopName,
                            'ShopPhone' => $item->ShopPhone, // THÊM DÒNG NÀY
                            'Description' => null,
                            'LogoURL' => null,
                            'CoverImageURL' => null,
                            'AddressStreet' => null,
                            'AddressWard' => null,
                            'AddressDistrict' => null,
                            'AddressCity' => null,
                            // 'ShopPhone' => null, // Bạn có thể bỏ dòng này nếu đã có ở trên
                            'Level' => null,
                            'Status' => 'Approved',
                            'CreatedAt' => null,
                            'UpdatedAt' => null
                        ]
                    ];
                }

                if ($item->AttributeValueID !== null) {
                    $cartItems[$item->CartItemID]['productVariant']['attributeValues'][] = [
                        'AttributeValueID' => $item->AttributeValueID,
                        'AttributeID' => $item->AttributeID,
                        'Value' => $item->AttributeValue,
                        'attribute' => [
                            'AttributeID' => $item->AttributeID,
                            'Name' => $item->AttributeName
                        ]
                    ];
                }
            }

            $cart['cartItems'] = array_values($cartItems);

            Log::info('Cart data structured successfully. Number of items: ' . count($cart['cartItems']));

            return response()->json($cart);

        } catch (\Exception $e) {
            Log::error('Error fetching or structuring cart data: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['message' => 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.'], 500);
        }
    }


    // Test
    // app/Http/Controllers/CartController.php


    /**
     * Update the variant of a cart item.
     * This is the new endpoint to handle changing product classification in the cart.
     */
    public function updateVariant(Request $request, $cartItemId)
    {
        $request->validate([
            'new_variant_id' => 'required|integer|exists:ProductVariants,VariantID',
        ]);

        $user = Auth::user();
        $newVariantId = $request->input('new_variant_id');

        DB::beginTransaction();
        try {
            // 1. Lấy thông tin cart item gốc và ProductID của nó
            $originalCartItem = DB::table('CartItems as ci')
                ->join('ProductVariants as pv', 'ci.VariantID', '=', 'pv.VariantID')
                ->join('Carts as c', 'ci.CartID', '=', 'c.CartID')
                ->where('ci.CartItemID', $cartItemId)
                ->where('c.UserID', $user->UserID)
                ->select('ci.CartID', 'ci.Quantity', 'pv.ProductID')
                ->first();

            if (!$originalCartItem) {
                DB::rollBack();
                return response()->json(['message' => 'Không tìm thấy mục sản phẩm trong giỏ hàng.'], 404);
            }

            // 2. Lấy thông tin variant mới
            $newVariant = DB::table('ProductVariants')
                ->where('VariantID', $newVariantId)
                ->select('ProductID', 'StockQuantity')
                ->first();

            // Nếu không tìm thấy variant mới (dù `exists` đã kiểm tra, nhưng để chắc chắn)
            if (!$newVariant) {
                DB::rollBack();
                return response()->json(['message' => 'Phiên bản sản phẩm mới không hợp lệ.'], 404);
            }
            
            // 3. Đảm bảo variant mới thuộc cùng một sản phẩm
            if ($newVariant->ProductID !== $originalCartItem->ProductID) {
                DB::rollBack();
                return response()->json(['message' => 'Lỗi: Phiên bản mới không thuộc cùng một sản phẩm.'], 400);
            }

            // 4. Kiểm tra xem variant mới này đã tồn tại trong giỏ hàng chưa
            $existingItemWithNewVariant = DB::table('CartItems')
                ->where('CartID', $originalCartItem->CartID)
                ->where('VariantID', $newVariantId)
                ->first();

            if ($existingItemWithNewVariant) {
                // Kịch bản 1: Variant mới đã tồn tại -> Cộng dồn số lượng và xóa item cũ
                
                $newQuantity = $existingItemWithNewVariant->Quantity + $originalCartItem->Quantity;
                
                // Ràng buộc số lượng theo tồn kho và giới hạn
                $hardLimit = 10;
                $stock = $newVariant->StockQuantity;
                if ($newQuantity > $stock) $newQuantity = $stock;
                if ($newQuantity > $hardLimit) $newQuantity = $hardLimit;

                // Cập nhật item đã có
                DB::table('CartItems')
                    ->where('CartItemID', $existingItemWithNewVariant->CartItemID)
                    ->update(['Quantity' => $newQuantity, 'UpdatedAt' => now()]);
                
                // Xóa item cũ đi
                DB::table('CartItems')->where('CartItemID', $cartItemId)->delete();

            } else {
                // Kịch bản 2: Variant mới chưa tồn tại -> Chỉ cần cập nhật VariantID của item gốc
                DB::table('CartItems')
                    ->where('CartItemID', $cartItemId)
                    ->update([
                        'VariantID' => $newVariantId,
                        'UpdatedAt' => now()
                    ]);
            }

            DB::commit();

            // Trả về toàn bộ giỏ hàng đã được cập nhật
            return $this->index($request);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating cart item variant with DB Facade: ' . $e->getMessage(), [
                'exception' => $e,
                'cart_item_id' => $cartItemId,
                'new_variant_id' => $newVariantId
            ]);
            return response()->json(['message' => 'Lỗi máy chủ khi thay đổi phiên bản sản phẩm.'], 500);
        }
    }

    /**
     * Add a product variant to the cart.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function addItem(Request $request)
    {
        $request->validate([
            'variant_id' => 'required|integer',
            'quantity' => 'required|integer|min:1',
            'shop_id' => 'required|integer',
        ]);

        $user = Auth::user();
        $hardLimit = 10; // Định nghĩa hard limit ở đây

        // Lấy thông tin variant và sản phẩm
        $variant = DB::table('ProductVariants')
                    ->join('Products', 'ProductVariants.ProductID', '=', 'Products.ProductID')
                    ->where('ProductVariants.VariantID', $request->variant_id)
                    ->select('ProductVariants.*', 'Products.Name as ProductName', 'Products.ShopID')
                    ->first();

        // Lấy thông tin shop
        $shop = DB::table('Shops')->where('ShopID', $request->shop_id)->first();

        if (!$variant) {
            return response()->json(['message' => 'Không tìm thấy phiên bản sản phẩm.'], 404);
        }
        if (!$shop) {
            return response()->json(['message' => 'Không tìm thấy cửa hàng.'], 404);
        }

        DB::beginTransaction();
        try {
            $cart = DB::table('Carts')->where('UserID', $user->UserID)->first();

            if (!$cart) {
                $cartId = DB::table('Carts')->insertGetId([
                    'UserID' => $user->UserID,
                    'CreatedAt' => Carbon::now(),
                    'UpdatedAt' => Carbon::now()
                ]);
                $cart = (object)['CartID' => $cartId, 'UserID' => $user->UserID];
            }

            $cartItem = DB::table('CartItems')
                            ->where('CartID', $cart->CartID)
                            ->where('VariantID', $request->variant_id)
                            ->first();

            $initialQuantityInCart = $cartItem ? $cartItem->Quantity : 0;
            $requestedQuantity = $request->quantity;
            $newTotalQuantity = $initialQuantityInCart + $requestedQuantity;

            $responseMessage = 'Sản phẩm đã được thêm vào giỏ hàng.';
            $shouldShowLargeQuantityPrompt = false;
            $finalQuantityForFrontend = $newTotalQuantity; // Quantity to update in DB

            // Kiểm tra tồn kho
            if ($newTotalQuantity > $variant->StockQuantity) {
                // Nếu vượt quá tồn kho, đặt số lượng về tồn kho
                $finalQuantityForFrontend = $variant->StockQuantity;
                $responseMessage = 'Số lượng yêu cầu vượt quá tồn kho. Đã thêm tối đa số lượng có sẵn.';
                // Nếu số lượng tồn kho vẫn vượt quá hard limit, vẫn hiển thị prompt
                if ($variant->StockQuantity > $hardLimit) {
                    $shouldShowLargeQuantityPrompt = true;
                }
            }

            // Kiểm tra hard limit (10 sản phẩm)
            if ($newTotalQuantity > $hardLimit) {
                // Nếu tổng số lượng vượt quá hard limit
                // Và chưa bị tồn kho hạn chế dưới hard limit
                if ($finalQuantityForFrontend > $hardLimit) { // Check if after stock clamping, it's still > hardLimit
                    $finalQuantityForFrontend = $hardLimit; // Clamp to hard limit for DB
                    $shouldShowLargeQuantityPrompt = true;
                    $responseMessage = 'Số lượng đã đạt giới hạn cho phép mỗi mặt hàng. Vui lòng liên hệ cửa hàng để đặt số lượng lớn hơn.';
                }
            }


            if ($cartItem) {
                // Cập nhật số lượng nếu mục đã tồn tại
                DB::table('CartItems')
                    ->where('CartItemID', $cartItem->CartItemID)
                    ->update([
                        'Quantity' => $finalQuantityForFrontend, // Sử dụng số lượng đã được xử lý
                        'UpdatedAt' => Carbon::now()
                    ]);
            } else {
                // Thêm mục mới vào giỏ hàng
                DB::table('CartItems')->insert([
                    'CartID' => $cart->CartID,
                    'VariantID' => $request->variant_id,
                    'ShopID' => $request->shop_id,
                    'Quantity' => $finalQuantityForFrontend, // Sử dụng số lượng đã được xử lý
                    'AddedAt' => Carbon::now(),
                    'UpdatedAt' => Carbon::now()
                ]);
            }

            DB::commit();

            // Lấy lại toàn bộ giỏ hàng với định dạng đầy đủ sau khi cập nhật
            // Gọi lại hàm index() để lấy dữ liệu mới nhất với định dạng Cart
            $updatedCartData = $this->index($request)->getData();

            return response()->json([
                'cart' => $updatedCartData,
                'message' => $responseMessage,
                'shouldShowLargeQuantityPrompt' => $shouldShowLargeQuantityPrompt,
                'productName' => $variant->ProductName,
                'shopPhone' => $shop->ShopPhone,
                'finalQuantityInCart' => $finalQuantityForFrontend,
                'availableStock' => $variant->StockQuantity,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error adding item to cart: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['message' => 'Lỗi máy chủ nội bộ. Không thể thêm sản phẩm vào giỏ hàng.'], 500);
        }
    }

    /**
     * Update the quantity of a cart item.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $cartItemId
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateItem(Request $request, $cartItemId)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $user = Auth::user();

        $cart = DB::table('Carts')->where('UserID', $user->UserID)->first();

        if (!$cart) {
            return response()->json(['message' => 'Không tìm thấy giỏ hàng của bạn.'], 404);
        }

        $cartItemWithVariant = DB::table('CartItems AS ci')
                                ->join('ProductVariants AS pv', 'ci.VariantID', '=', 'pv.VariantID')
                                ->where('ci.CartID', $cart->CartID)
                                ->where('ci.CartItemID', $cartItemId)
                                ->select('ci.CartItemID', 'ci.Quantity', 'pv.StockQuantity', 'pv.IsActive')
                                ->first();

        if (!$cartItemWithVariant) {
            return response()->json(['message' => 'Không tìm thấy mục sản phẩm trong giỏ hàng.'], 404);
        }

        $requestedQuantity = $request->quantity;

        if (!$cartItemWithVariant->IsActive) {
            Log::warning("Cart item {$cartItemWithVariant->CartItemID} references an inactive product variant.");
            return response()->json(['message' => 'Sản phẩm này hiện không còn kinh doanh.'], 400);
        }

        if ($requestedQuantity > $cartItemWithVariant->StockQuantity) {
            // Include available_stock in the error response for frontend to display
            return response()->json([
                'message' => 'Số lượng yêu cầu vượt quá số lượng sản phẩm có sẵn trong kho.',
                'available_stock' => $cartItemWithVariant->StockQuantity
            ], 400);
        }

        DB::beginTransaction();
        try {
            DB::table('CartItems')
                ->where('CartItemID', $cartItemId)
                ->update([
                    'Quantity' => $requestedQuantity,
                    'UpdatedAt' => Carbon::now()
                ]);

            DB::commit();

            $updatedCartResponse = $this->index($request)->getData();
            // Return a success message along with the cart data
            return response()->json(array_merge((array)$updatedCartResponse, ['message' => 'Số lượng sản phẩm đã được cập nhật thành công.']));

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating cart item quantity: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['message' => 'Lỗi máy chủ nội bộ. Không thể cập nhật số lượng sản phẩm.'], 500);
        }
    }

    /**
     * Remove a cart item.
     *
     * @param  int  $cartItemId
     * @return \Illuminate\Http\JsonResponse
     */
    public function removeItem($cartItemId)
    {
        $user = Auth::user();

        $cart = DB::table('Carts')->where('UserID', $user->UserID)->first();

        if (!$cart) {
            return response()->json(['message' => 'Không tìm thấy giỏ hàng của bạn.'], 404);
        }

        $cartItem = DB::table('CartItems')
                        ->where('CartID', $cart->CartID)
                        ->where('CartItemID', $cartItemId)
                        ->first();

        if (!$cartItem) {
            return response()->json(['message' => 'Không tìm thấy mục sản phẩm trong giỏ hàng.'], 404);
        }

        DB::beginTransaction();
        try {
            DB::table('CartItems')->where('CartItemID', $cartItemId)->delete();

            $remainingItemsCount = DB::table('CartItems')->where('CartID', $cart->CartID)->count();

            if ($remainingItemsCount === 0) {
                DB::table('Carts')->where('CartID', $cart->CartID)->delete();
                DB::commit();
                // Return a specific message when cart becomes empty
                return response()->json(['message' => 'Sản phẩm đã được xóa khỏi giỏ hàng và giỏ hàng hiện đang trống.']);
            }

            DB::commit();

            $updatedCartResponse = $this->index(request())->getData();
            // Return a success message along with the updated cart data
            return response()->json(array_merge((array)$updatedCartResponse, ['message' => 'Sản phẩm đã được xóa khỏi giỏ hàng.']));

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error removing cart item: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['message' => 'Lỗi máy chủ nội bộ. Không thể xóa sản phẩm khỏi giỏ hàng.'], 500);
        }
    }

    public function getProductAttributes(Request $request, $productId)
    {
       // Lấy tất cả các attribute và giá trị của chúng cho tất cả các variant của sản phẩm
        $attributesData = DB::table('ProductVariants')
            ->join('ProductVariantAttribute', 'ProductVariants.VariantID', '=', 'ProductVariantAttribute.VariantID')
            ->join('AttributeValues', 'ProductVariantAttribute.AttributeValueID', '=', 'AttributeValues.AttributeValueID')
            ->join('Attributes', 'AttributeValues.AttributeID', '=', 'Attributes.AttributeID')
            ->where('ProductVariants.ProductID', $productId)
            ->select(
                'Attributes.Name as attribute_name',
                'AttributeValues.Value as attribute_value',
                'AttributeValues.AttributeValueID',
                'Attributes.AttributeID'
            )
            ->distinct()
            ->get();

        $groupedAttributes = $attributesData->groupBy('attribute_name')
            ->map(function ($itemsPerAttribute) {
                return $itemsPerAttribute->unique('AttributeValueID')->map(function($item) {
                    return [
                        'AttributeValueID' => $item->AttributeValueID,
                        'Value' => $item->attribute_value,
                        'AttributeID' => $item->AttributeID
                    ];
                })->values();
            });

        $finalAttributes = $groupedAttributes->take(3);

        return response()->json([
            'product_id' => $productId,
            'attributes' => $finalAttributes,
            'message' => 'Thông tin thuộc tính sản phẩm đã được tải.' // Added a success message
        ]);
    }

    /**
     * Remove multiple items from the user's cart.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function removeMultipleItems(Request $request)
    {
        $user = Auth::user();
        $cart = $user->cart;

        if (!$cart) {
            return response()->json(['message' => 'Giỏ hàng không tồn tại.'], 404);
        }

        // Validate a a'cart_item_ids' là một mảng và không rỗng
        $validated = $request->validate([
            'cart_item_ids' => 'required|array|min:1',
            'cart_item_ids.*' => 'integer|exists:CartItems,CartItemID', // Đảm bảo mỗi ID đều tồn tại
        ]);

        $itemIdsToRemove = $validated['cart_item_ids'];

        // Chỉ xóa các item thuộc về giỏ hàng của user hiện tại để bảo mật
        CartItem::where('CartID', $cart->CartID)
                ->whereIn('CartItemID', $itemIdsToRemove)
                ->delete();
        
        // Trả về giỏ hàng đã được cập nhật
        $updatedCart = $cart->load(['cartItems.productVariant.product', 'cartItems.productVariant.attributeValues.attribute', 'cartItems.shop']);

        return response()->json($updatedCart);
    }
}
