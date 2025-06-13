<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\ProductVariant; // Import ProductVariant
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB; // Keep DB facade for now if needed elsewhere, but refactor index
use Illuminate\Support\Facades\Log;

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
        // Original logic below (commented out for testing)
        try {
            // Fetch the cart and its items using Facades\DB
            // Modified query to include attribute names and values
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
            // Log::info('Raw cart data:', ['data' => $cartData]); // Log raw data if needed for debugging large responses

            // Structure the data, grouping attributes by cart item
            $cart = [
                'CartID' => null,
                'UserID' => $user->UserID,
                'CreatedAt' => null,
                'UpdatedAt' => null,
                'cartItems' => []
            ];

            $cartItems = [];

            foreach ($cartData as $item) {
                // If this is the first time we see this cart item, initialize its structure
                if (!isset($cartItems[$item->CartItemID])) {
                     // Assuming all items belong to the same cart for a user
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
                        'CartItemUpdatedAt' => $item->CartItemUpdatedAt, // Use CartItemUpdatedAt
                        'productVariant' => [
                            'VariantID' => $item->VariantID,
                            'ProductID' => $item->ProductID,
                            'SKU' => $item->SKU,
                            'Price' => $item->VariantPrice,
                            'CompareAtPrice' => $item->CompareAtPrice,
                            'StockQuantity' => $item->StockQuantity,
                            'ImageURL' => $item->VariantImageURL,
                            'IsActive' => 1, // Assuming active based on query results
                            'CreatedAt' => null, // Not fetched in this query
                            'UpdatedAt' => null, // Not fetched in this query
                            'product' => [
                                'ProductID' => $item->ProductID,
                                'ShopID' => $item->ShopID,
                                'CategoryID' => null, // Not fetched
                                'Name' => $item->ProductName,
                                'Description' => $item->ProductDescription,
                                'Discount' => $item->ProductDiscount,
                                'IsActive' => 1, // Assuming active
                                'AdminApprovalStatus' => 'Approved', // Assuming approved
                                'ReasonForRejection' => null,
                                'CreatedAt' => null, // Not fetched
                                'UpdatedAt' => null // Not fetched
                            ],
                            'attributeValues' => [] // Initialize attribute values array
                        ],
                        'shop' => [
                            'ShopID' => $item->ShopID,
                            'UserID' => null, // Not fetched
                            'ShopName' => $item->ShopName,
                            'Description' => null, // Not fetched
                            'LogoURL' => null, // Not fetched
                            'CoverImageURL' => null, // Not fetched
                            'AddressStreet' => null, // Not fetched
                            'AddressWard' => null, // Not fetched
                            'AddressDistrict' => null, // Not fetched
                            'AddressCity' => null, // Not fetched
                            'ShopPhone' => null, // Not fetched
                            'Level' => null, // Not fetched
                            'Status' => 'Approved', // Assuming approved
                            'CreatedAt' => null, // Not fetched
                            'UpdatedAt' => null // Not fetched
                        ]
                    ];
                }

                // Add attribute value to the product variant if it exists
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

            // Convert associative array back to indexed array
            $cart['cartItems'] = array_values($cartItems);

            Log::info('Cart data structured successfully. Number of items: ' . count($cart['cartItems']));
            // Log::info('Structured cart data:', ['cart' => $cart]); // Log structured data if needed

            // The rest of the logic to fetch all variants for each product will be added here

            return response()->json($cart);

        } catch (\Exception $e) {
            Log::error('Error fetching or structuring cart data: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['message' => 'Internal Server Error'], 500);
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
            'variant_id' => 'required|exists:product_variants,VariantID', // Use variant_id
            'quantity' => 'required|integer|min:1',
            'shop_id' => 'required|exists:shops,ShopID',
        ]);

        $user = Auth::user();
        $cart = Cart::firstOrCreate(['UserID' => $user->UserID]); // Use UserID

        $cartItem = CartItem::where('CartID', $cart->CartID)
                            ->where('VariantID', $request->variant_id) // Use VariantID
                            ->first();

        if ($cartItem) {
            // Update quantity if item already exists
            $cartItem->Quantity += $request->quantity;
            $cartItem->save();
        } else {
            // Add new item to cart
            $cartItem = new CartItem();
            $cartItem->CartID = $cart->CartID;
            $cartItem->VariantID = $request->variant_id; // Use VariantID
            $cartItem->ShopID = $request->shop_id;
            $cartItem->Quantity = $request->quantity;
            $cartItem->save();
        }

        $cart->load(['cartItems.productVariant', 'cartItems.shop']); // Reload cart with updated items and relationships
        return response()->json($cart, 201);
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
        $cart = Cart::where('UserID', $user->UserID)->first(); // Use UserID

        if (!$cart) {
            return response()->json(['message' => 'Cart not found'], 404);
        }

        $cartItem = CartItem::where('CartID', $cart->CartID)
                            ->where('CartItemID', $cartItemId)
                            ->first();

        if (!$cartItem) {
            return response()->json(['message' => 'Cart item not found'], 404);
        }

        $cartItem->Quantity = $request->quantity;
        $cartItem->save();

        $cart->load(['cartItems.productVariant', 'cartItems.shop']); // Reload cart with updated items and relationships
        return response()->json($cart);
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
        $cart = Cart::where('UserID', $user->UserID)->first(); // Use UserID

        if (!$cart) {
            return response()->json(['message' => 'Cart not found'], 404);
        }

        $cartItem = CartItem::where('CartID', $cart->CartID)
                            ->where('CartItemID', $cartItemId)
                            ->first();

        if (!$cartItem) {
            return response()->json(['message' => 'Cart item not found'], 404);
        }

        $cartItem->delete();

        // After deleting, check if the cart is empty and delete it if necessary
        if ($cart->cartItems()->count() === 0) {
            $cart->delete();
            return response()->json(['message' => 'Cart item removed and cart is now empty']);
        }


        $cart->load(['cartItems.productVariant', 'cartItems.shop']); // Reload cart with updated items and relationships
        return response()->json($cart);
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
                'AttributeValues.AttributeValueID', // Thêm AttributeValueID
                'Attributes.AttributeID' // Thêm AttributeID nếu frontend cần (khuyến nghị)
            )
            ->distinct() // Đảm bảo lấy các cặp (tên thuộc tính, giá trị thuộc tính, ID giá trị, ID thuộc tính) duy nhất
            ->get();

        // Nhóm các dữ liệu theo tên thuộc tính và chuẩn bị định dạng output
        $groupedAttributes = $attributesData->groupBy('attribute_name')
            ->map(function ($itemsPerAttribute) {
                // Lọc các giá trị thuộc tính duy nhất cho mỗi loại thuộc tính
                return $itemsPerAttribute->unique('AttributeValueID')->map(function($item) {
                    return [
                        'AttributeValueID' => $item->AttributeValueID,
                        'Value' => $item->attribute_value,
                        'AttributeID' => $item->AttributeID // Giữ nguyên AttributeID từ DB
                    ];
                })->values(); // Reset keys để đảm bảo là mảng chuẩn
            });

        // Giới hạn chỉ lấy 2 loại thuộc tính đầu tiên
        // Ví dụ: nếu có "Màu sắc", "Kích thước", "RAM", nó sẽ chỉ lấy "Màu sắc" và "Kích thước"
        $finalAttributes = $groupedAttributes->take(3);

        return response()->json([
            'product_id' => $productId,
            'attributes' => $finalAttributes
        ]);
    }
}
