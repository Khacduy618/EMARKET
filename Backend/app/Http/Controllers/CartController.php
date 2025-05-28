<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

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
        // $user = Auth::user();$user->UserID)->first()
        $cart = Cart::with('cartItems.product')->where('UserID_Buyer', 1);

        if (!$cart) {
            return response()->json(['message' => 'Cart not found'], 404);
        }

        return response()->json($cart);
    }

    /**
     * Add a product to the cart.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function addItem(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,ProductID',
            'quantity' => 'required|integer|min:1',
            'shop_id' => 'required|exists:shops,ShopID', // Assuming shop_id is needed for cart item
        ]);

        $user = Auth::user();
        $cart = Cart::firstOrCreate(['UserID_Buyer' => $user->UserID]);

        $cartItem = CartItem::where('CartID', $cart->CartID)
                            ->where('ProductID', $request->product_id)
                            ->first();

        if ($cartItem) {
            // Update quantity if item already exists
            $cartItem->Quantity += $request->quantity;
            $cartItem->save();
        } else {
            // Add new item to cart
            $cartItem = new CartItem();
            $cartItem->CartID = $cart->CartID;
            $cartItem->ProductID = $request->product_id;
            $cartItem->ShopID = $request->shop_id;
            $cartItem->Quantity = $request->quantity;
            $cartItem->save();
        }

        $cart->load('cartItems.product'); // Reload cart with updated items
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
        $cart = Cart::where('UserID_Buyer', $user->UserID)->first();

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

        $cart->load('cartItems.product'); // Reload cart with updated items
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
        $cart = Cart::where('UserID_Buyer', $user->UserID)->first();

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

        $cart->load('cartItems.product'); // Reload cart with updated items
        return response()->json($cart);
    }
}
