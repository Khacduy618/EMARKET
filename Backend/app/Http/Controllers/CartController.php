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
public function getProductVariantsWithAttributes(Request $request, $productId)
    {
        // Fetch all variants for the product and their attributes
        $variantsData = DB::select("
            SELECT
                pv.VariantID,
                pv.ProductID,
                pv.SKU,
                pv.Price,
                pv.CompareAtPrice,
                pv.StockQuantity,
                pv.ImageURL,
                a.AttributeID,
                a.Name AS AttributeName,
                av.AttributeValueID,
                av.Value AS AttributeValue
            FROM ProductVariants pv
            LEFT JOIN ProductVariantAttribute pva ON pv.VariantID = pva.VariantID
            LEFT JOIN AttributeValues av ON pva.AttributeValueID = av.AttributeValueID
            LEFT JOIN Attributes a ON av.AttributeID = a.AttributeID
            WHERE pv.ProductID = ?
        ", [$productId]);

        // Structure the data: group by variant, then group attributes by name
        $productVariants = [];

        foreach ($variantsData as $item) {
            if (!isset($productVariants[$item->VariantID])) {
                $productVariants[$item->VariantID] = [
                    'VariantID' => $item->VariantID,
                    'ProductID' => $item->ProductID,
                    'SKU' => $item->SKU,
                    'Price' => $item->Price,
                    'CompareAtPrice' => $item->CompareAtPrice,
                    'StockQuantity' => $item->StockQuantity,
                    'ImageURL' => $item->ImageURL,
                    'attributes' => [] // Initialize attributes array
                ];
            }

            // Add attribute to the variant if it exists
            if ($item->AttributeValueID !== null) {
                // Group attribute values by attribute name
                if (!isset($productVariants[$item->VariantID]['attributes'][$item->AttributeName])) {
                    $productVariants[$item->VariantID]['attributes'][$item->AttributeName] = [];
                }
                $productVariants[$item->VariantID]['attributes'][$item->AttributeName][] = [
                    'AttributeID' => $item->AttributeID,
                    'AttributeName' => $item->AttributeName,
                    'AttributeValueID' => $item->AttributeValueID,
                    'AttributeValue' => $item->AttributeValue
                ];
            }
        }

        // Convert associative array back to indexed array
        $productVariants = array_values($productVariants);

        // Further structure for frontend: group attribute values by attribute name across all variants
        $groupedAttributes = [];
        foreach ($productVariants as $variant) {
            foreach ($variant['attributes'] as $attributeName => $attributeValues) {
                if (!isset($groupedAttributes[$attributeName])) {
                    $groupedAttributes[$attributeName] = [];
                }
                foreach ($attributeValues as $attrValue) {
                    // Add unique attribute values
                    $exists = false;
                    foreach ($groupedAttributes[$attributeName] as $existingAttrValue) {
                        if ($existingAttrValue['AttributeValueID'] === $attrValue['AttributeValueID']) {
                            $exists = true;
                            break;
                        }
                    }
                    if (!$exists) {
                        $groupedAttributes[$attributeName][] = $attrValue;
                    }
                }
            }
        }

        return response()->json([
            'variants' => $productVariants,
            'groupedAttributes' => $groupedAttributes
        ]);
    }
    public function getAvailableVariants(Request $request)
    {
        $product_id = 1;
        //$request->input('product_id');
        $attribute_value_id = 1;
        //$request->input('attribute_value_id');

        if (!$product_id) {
            return response()->json(['message' => 'Product ID is required'], 400);
        }

        $sql = "SELECT PV.VariantID, PV.SKU, PV.Price, PV.StockQuantity, AV.AttributeID, A.Name AS AttributeName, AV.AttributeValueID, AV.Value AS AttributeValue FROM ProductVariants PV JOIN ProductVariantAttribute PVA ON PV.VariantID = PVA.VariantID JOIN AttributeValues AV ON PVA.AttributeValueID = AV.AttributeValueID JOIN Attributes A ON AV.AttributeID = A.AttributeID WHERE PV.ProductID = ? AND PV.IsActive = 1 AND PV.StockQuantity > 0";

        $params = [$product_id];

        if ($attribute_value_id) {
            $sql .= " AND EXISTS ( SELECT 1 FROM ProductVariantAttribute PVA2 WHERE PVA2.VariantID = PV.VariantID AND PVA2.AttributeValueID = ? )";
            $params[] = $attribute_value_id;
        }

        $sql .= " ORDER BY PV.VariantID, A.Name";

        $variants = DB::select($sql, $params);

        $formattedVariants = [];

        foreach ($variants as $variant) {
            $formattedVariants[] = [
                'VariantID' => $variant->VariantID,
                'SKU' => $variant->SKU,
                'Price' => $variant->Price,
                'StockQuantity' => $variant->StockQuantity,
                'AttributeID' => $variant->AttributeID,
                'AttributeName' => $variant->AttributeName,
                'AttributeValueID' => $variant->AttributeValueID,
                'AttributeValue' => $variant->AttributeValue,
            ];
        }

        return response()->json($formattedVariants);
    }
}