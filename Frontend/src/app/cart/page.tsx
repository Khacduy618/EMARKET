'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { fetchCart, updateCartItemQuantity, removeCartItem, fetchProductVariantsWithAttributes } from '@/services/login';
import { Cart, CartItem, AttributeValue } from '@/types';
import AttributeSelectionDropdown from '../components/AttributeSelectionDropdown';

const CartPage: React.FC = () => {
    const [cart, setCart] = useState<Cart | null>(null);
    const router = useRouter(); // Get router instance
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDropdownItemId, setOpenDropdownItemId] = useState<number | null>(null);
    const [attributeOptions, setAttributeOptions] = useState<{ [key: string]: any } | null>(null);
    // Removed selectedAttributes state as it's now managed within the dropdown

    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            // If no token, redirect to login page
            router.push('/login');
            return; // Stop execution of the effect
        }

        const getCart = async () => {
            try {
                console.log('Fetching cart...');
                setLoading(true);
                const cartData = await fetchCart();
                console.log('Raw cart data fetched:', cartData);
                console.log('Cart fetched successfully:', cartData);
                setCart(cartData);
            } catch (err) {
                console.error('Error fetching cart:', err);
                setError('Failed to load cart.');
            } finally {
                console.log('Finished fetching cart. Loading:', false);
                setLoading(false);
            }
        };

        getCart();
    }, [router]); // Add router to dependency array

    const handleUpdateQuantity = async (cartItemId: number, quantity: number) => {
        try {
            const newQuantity = Math.max(1, quantity);
            const updatedCart = await updateCartItemQuantity(cartItemId, newQuantity);
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

    

    console.log('Rendering CartPage. Loading:', loading, 'Error:', error, 'Cart:', cart);

    if (loading) {
        return <div>Đang tải giỏ hàng...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    if (!cart || !Array.isArray(cart.cartItems) || cart.cartItems.length === 0) {
        console.log('Cart is empty or invalid:', cart);
        return <div>Giỏ hàng của bạn đang trống.</div>;
    }

    console.log('Rendering cart items:', cart.cartItems);

    const groupedItems = cart.cartItems.reduce((acc, item) => {
        const shopId = item.ShopID;
        if (!acc[shopId]) {
            acc[shopId] = [];
        }
        acc[shopId].push(item);
        return acc;
    }, {} as Record<number, CartItem[]>);


    return (
            <div className="container mx-auto px-4">
                

                {/* Cart Items List */}
                <div className="mb-6">
                    {/* Table Header */}
                    <div className="bg-white shadow-box mt-4 mb-4 grid grid-cols-12 text-gray-500 text-xs uppercase px-4 py-4">
                        <div className="col-span-4 flex items-center gap-2">
                            <input type="checkbox" className="form-checkbox text-red-500 rounded" />
                            Sản Phẩm
                        </div>
                        <div className="col-span-2 text-center"></div>
                        <div className="col-span-2 text-center">Đơn Giá</div>
                        <div className="col-span-2 text-center">Số Lượng</div>
                        <div className="col-span-1 text-center">Số Tiền</div>
                        <div className="col-span-1 text-center">Thao Tác</div>
                    </div>

                    {/* Grouped Cart Items */}
                    {Object.entries(groupedItems).map(([shopId, items]) => {
                        const shopName = items[0]?.shop?.ShopName;

                        return (
                            <div key={shopId} className="shop-group bg-white rounded-sm shadow-sm last:border-b-0">
                                {/* Shop Header */}
                                <div className="flex items-center gap-2 px-4 py-2 border-b border-opacity-50">
                                    <input type="checkbox" className="form-checkbox text-red-500 rounded" />
                                    <span className="text-lg text-red-500">🏪</span>
                                    <span className="font-bold text-sm text-gray-800">{shopName || `Shop ID: ${shopId}`}</span>
                                </div>
                                {/* Cart Items for this shop */}
                                {items.map((item: CartItem) => (
                                    <div key={item.CartItemID} className="grid grid-cols-12 items-center px-4 py-3 last:border-b-0">
                                        {/* Product */}
                                        <div className="col-span-4 flex items-center gap-3">
                                            <input type="checkbox" className="form-checkbox text-red-500 rounded" />
                                            <div className="w-16 h-16 bg-gray-100 rounded-sm flex items-center justify-center text-gray-500 overflow-hidden border">
                                                <img src={item.productVariant?.ImageURL || '/images/placeholder.png'} alt={item.productVariant?.product?.Name || 'Product Image'} className="object-cover w-full h-full" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-sm text-gray-800">{item.productVariant?.product?.Name}</span>
                                            </div>
                                        </div>

                                        {/* Attributes/Classification */}
                                        <div className="col-span-2 text-sm text-gray-700 relative">
                                            {item.productVariant?.attributeValues && item.productVariant.attributeValues.length > 0 ? (
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-1">
                                                        
                                                        <button
                                                            className="flex items-center gap-1 px-2 py-1 rounded-sm text-xs text-gray-700 hover:border-red-500"
                                                            onClick={async () => {
                                                                if (openDropdownItemId !== item.CartItemID) {
                                                                    try {
                                                                        const data = await fetchProductVariantsWithAttributes(item.productVariant.ProductID);
                                                                        setAttributeOptions(data.groupedAttributes);
                                                                    } catch (error) {
                                                                        console.error("Error fetching attribute options:", error);
                                                                        setError("Failed to load attribute options.");
                                                                    }
                                                                }
                                                                setOpenDropdownItemId(item.CartItemID);
                                                            }}
                                                        >
                                                            <div className="flex flex-col items-center">
                                                                <div className="w-full"><span className="text-xs text-gray-500">Phân Loại Hàng:</span>
                                                                <span className="text-gray-400 text-xs">▼</span></div>
                                                                <div className="text-gray-500 text-xs">{item.productVariant?.attributeValues?.map(attrValue => attrValue.Value).join(' - ') || 'Chọn phân loại'}</div>
                                                            </div>
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-500">Chọn phân loại</span>
                                            )}

                                            {/* Attribute Selection Dropdown for this item */}
                                            {openDropdownItemId === item.CartItemID && (
                                                <AttributeSelectionDropdown
                                                    productId={item.productVariant?.ProductID || 0}
                                                    attributeOptions={attributeOptions}
                                                    onAttributeSelected={(selectedAttributes) => {
                                                        // Implement logic to update the cart based on selectedAttributes
                                                    }}
                                                    onClose={() => setOpenDropdownItemId(null)}
                                                />
                                            )}
                                        </div>


                                        {/* Price */}
                                        <div className="col-span-2 text-sm text-gray-700 text-center">
                                            {item.productVariant?.CompareAtPrice && item.productVariant.CompareAtPrice > item.productVariant.Price ? (
                                                <div className="flex flex-col items-center">
                                                    <span className="line-through text-gray-500 text-xs">₫{item.productVariant.CompareAtPrice.toLocaleString('vi-VN')}</span>
                                                    <span className="text-red-500 font-semibold">₫{item.productVariant?.Price?.toLocaleString('vi-VN') || '0'}</span>
                                                </div>
                                            ) : (
                                                <span className="text-red-500 font-semibold">₫{item.productVariant?.Price?.toLocaleString('vi-VN') || '0'}</span>
                                            )}
                                        </div>

                                        {/* Quantity */}
                                        <div className="col-span-2 flex items-center justify-center">
                                            <div className="flex items-center border rounded-sm w-24">
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.CartItemID, item.Quantity - 1)}
                                                    className="px-2 py-1 text-gray-600 hover:text-gray-800"
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="text"
                                                    value={item.Quantity}
                                                    onChange={(e) => handleUpdateQuantity(item.CartItemID, parseInt(e.target.value) || 1)}
                                                    className="w-full text-center text-black text-sm border-l border-r outline-none"
                                                />
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.CartItemID, item.Quantity + 1)}
                                                    className="px-2 py-1 text-gray-600 hover:text-gray-800"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        {/* Subtotal */}
                                        <div className="col-span-1 text-red-500 font-semibold text-sm text-center">
                                            ₫{((item.productVariant?.Price || 0) * item.Quantity).toLocaleString('vi-VN')}
                                        </div>

                                        {/* Action */}
                                        <div className="col-span-1 text-center flex flex-col items-center gap-1">
                                            <button
                                                onClick={() => handleRemoveItem(item.CartItemID)}
                                                className="text-gray-500 hover:text-red-500 text-sm"
                                            >
                                                Xóa
                                            </button>
                                            <button className="text-blue-500 hover:underline text-xs">
                                                Tìm sản phẩm tương tự
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {/* Voucher and Shipping sections */}
                                <div className="rounded-md p-4 mb-6">
                                    <div className="flex items-center gap-2 text-red-500 mb-2">
                                        <span className="text-lg">🎁</span>
                                        <span>Voucher giảm đến ₫30k</span>
                                        <button className="text-blue-500 text-sm hover:underline">Xem thêm voucher</button>
                                    </div>
                                    <div className="flex items-center gap-2 text-green-600">
                                        <span className="text-lg">🚚</span>
                                        <span>Giảm ₫500.000 phí vận chuyển đơn tối thiểu ₫0</span>
                                        <button className="text-blue-500 text-sm hover:underline">Tìm hiểu thêm</button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Placeholder for Shop Voucher section */}
                {/* <div className="rounded-md p-4 mb-6 bg-white shadow-sm">
                    <div className="flex items-center gap-2 text-red-500 mb-2">
                        <span className="text-lg">🎁</span>
                        <span>Shopee Voucher</span>
                        <button className="text-blue-500 text-sm hover:underline">Chọn hoặc nhập mã</button>
                    </div>
                </div> */}

                {/* Sticky Footer */}
                <div className="sticky bottom-0 left-0 right-0 bg-white shadow-md z-10">
                    <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <input type="checkbox" className="form-checkbox text-red-500 rounded" />
                                <span className="text-sm text-gray-800">Chọn Tất Cả ({cart.cartItems.length})</span>
                            </div>
                            <button className="text-gray-600 hover:text-gray-800 text-sm">Xóa</button>
                            <button className="text-blue-500 hover:underline text-sm">Lưu vào mục Đã thích</button>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">Tổng thanh toán ({cart.cartItems.length}) Sản phẩm:</span>
                            <span className="text-xl text-red-500 font-bold">
                                ₫{cart.cartItems.reduce((sum: number, item: CartItem) => sum + (item.productVariant?.Price || 0) * item.Quantity, 0).toLocaleString('vi-VN')}
                            </span>
                        </div>
                        <button className="bg-red-500 text-white px-8 py-2 rounded-sm hover:bg-red-600 font-semibold text-sm">
                            Mua Hàng
                        </button>
                    </div>
                </div>
            </div>
    );
};

export default CartPage;
