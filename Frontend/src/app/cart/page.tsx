'use client';

import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { fetchCart, updateCartItemQuantity, removeCartItem } from '@/utils/api';
import { Cart, CartItem } from '@/types';

const CartPage: React.FC = () => {
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getCart = async () => {
            try {
                setLoading(true);
                const cartData = await fetchCart();
                setCart(cartData);
            } catch (err) {
                setError('Failed to load cart.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        getCart();
    }, []);

    const handleUpdateQuantity = async (cartItemId: number, quantity: number) => {
        try {
            const updatedCart = await updateCartItemQuantity(cartItemId, quantity);
            setCart(updatedCart);
        } catch (err) {
            setError('Failed to update item quantity.');
            console.error(err);
        }
    };

    const handleRemoveItem = async (cartItemId: number) => {
        try {
            const updatedCart = await removeCartItem(cartItemId);
            setCart(updatedCart);
        } catch (err) {
            setError('Failed to remove item.');
            console.error(err);
        }
    };

    if (loading) {
        return <Layout><div>Loading cart...</div></Layout>;
    }

    if (error) {
        return <Layout><div className="text-red-500">{error}</div></Layout>;
    }

    if (!cart || cart.cartItems.length === 0) {
        return <Layout><div>Your cart is empty.</div></Layout>;
    }

    return (
        <Layout>
            <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>
            <div>
                {cart.cartItems.map((item: CartItem) => (
                    <div key={item.CartItemID} className="border p-4 mb-4 flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-semibold">{item.product.Name}</h2>
                            <p>Price: ${item.product.Price.toFixed(2)}</p>
                            <div className="flex items-center mt-2">
                                <label htmlFor={`quantity-${item.CartItemID}`} className="mr-2">Quantity:</label>
                                <input
                                    id={`quantity-${item.CartItemID}`}
                                    type="number"
                                    min="1"
                                    value={item.Quantity}
                                    onChange={(e) => handleUpdateQuantity(item.CartItemID, parseInt(e.target.value))}
                                    className="border rounded w-16 text-center"
                                />
                            </div>
                        </div>
                        <button
                            onClick={() => handleRemoveItem(item.CartItemID)}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>
            {/* You might want to calculate and display a total here */}
            <div className="mt-4 text-xl font-bold">
                Total: ${cart.cartItems.reduce((sum: number, item: CartItem) => sum + item.product.Price * item.Quantity, 0).toFixed(2)}
            </div>
        </Layout>
    );
};

export default CartPage;
