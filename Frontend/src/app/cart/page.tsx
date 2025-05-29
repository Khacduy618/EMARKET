'use client';

import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { fetchCart, updateCartItemQuantity, removeCartItem } from '@/utils/api';
import { Cart, CartItem, AttributeValue } from '@/types'; // Import AttributeValue type

const CartPage: React.FC = () => {
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDropdownItemId, setOpenDropdownItemId] = useState<number | null>(null); // State to track which item's dropdown is open

    useEffect(() => {
        const getCart = async () => {
            try {
                console.log('Fetching cart...');
                setLoading(true);
                const cartData = await fetchCart();
                console.log('Raw cart data fetched:', cartData); // Added logging
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
    }, []);

    // Simplified handleUpdateQuantity and handleRemoveItem (no changes needed for this task)
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
        return <Layout><div>Đang tải giỏ hàng...</div></Layout>;
    }

    if (error) {
        return <Layout><div className="text-red-500">{error}</div></Layout>;
    }

    if (!cart || !Array.isArray(cart.cartItems) || cart.cartItems.length === 0) {
        console.log('Cart is empty or invalid:', cart);
        return <Layout><div>Giỏ hàng của bạn đang trống.</div></Layout>;
    }

    console.log('Rendering cart items:', cart.cartItems);

    // Group cart items by shop
    const groupedItems = cart.cartItems.reduce((acc, item) => {
        const shopId = item.ShopID;
        if (!acc[shopId]) {
            acc[shopId] = [];
        }
        acc[shopId].push(item);
        return acc;
    }, {} as Record<number, CartItem[]>);


    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumbs */}
                <div className="text-sm text-gray-600 mb-4">
                    Trang chủ / <span className="font-semibold">Giỏ Hàng</span>
                </div>

                {/* Cart Items List */}
                <div className="border rounded-sm overflow-hidden bg-white shadow-sm mb-6">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 text-gray-500 text-xs uppercase px-4 py-2 border-b">
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
                            <div key={shopId} className="shop-group border-b last:border-b-0">
                                {/* Shop Header */}
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 border-b border-t">
                                    <span className="text-lg text-red-500">🏪</span>
                                    <span className="font-bold text-sm text-gray-800">{shopName || `Shop ID: ${shopId}`}</span>
                                </div>
                                {/* Cart Items for this shop */}
                                {items.map((item: CartItem) => (
                                    <div key={item.CartItemID} className="grid grid-cols-12 items-center px-4 py-3 border-b last:border-b-0">
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
                                        <div className="col-span-2 text-sm text-gray-700 relative"> {/* Added relative positioning */}
                                            {item.productVariant?.attributeValues && item.productVariant.attributeValues.length > 0 ? (
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-xs text-gray-500">Phân Loại Hàng:</span>
                                                        <button
                                                            className="flex items-center gap-1 px-2 py-1 border rounded-sm text-xs text-gray-700 hover:border-red-500"
                                                            onClick={() => {
                                                                setOpenDropdownItemId(openDropdownItemId === item.CartItemID ? null : item.CartItemID); // Toggle dropdown for this item
                                                            }}
                                                        >
                                                            {item.productVariant.attributeValues.map(attrValue => attrValue.Value).join(' - ')}
                                                            <span className="text-gray-400 text-xs">▼</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-500"></span>
                                            )}

                                            {/* Attribute Selection Dropdown for this item */}
                                            {openDropdownItemId === item.CartItemID && (
                                                <div className="absolute z-50 bg-white border rounded-md shadow-lg p-4 top-full left-0"> {/* Position dropdown below the button */}
                                                    <h3 className="text-lg font-semibold mb-4">Chọn Phân Loại Hàng</h3>
                                                    {/* Display attribute options based on available data */}
                                                    {/* TODO: Replace with actual data from backend API that includes all options */}
                                                    {item.productVariant?.attributeValues && item.productVariant.attributeValues.length > 0 ? (
                                                        <div className="flex flex-col gap-4">
                                                            {/* Group by attribute name if possible (simulated) */}
                                                            {/* For now, just display the selected attributes as buttons */}
                                                            <div>
                                                                <span className="font-semibold text-sm text-gray-700">Phân Loại:</span>
                                                                <div className="flex flex-wrap gap-2 mt-2">
                                                                    {item.productVariant.attributeValues.map(attrValue => (
                                                                        <button
                                                                            key={attrValue.AttributeValueID}
                                                                            className={`px-4 py-2 border rounded-sm text-sm ${
                                                                                'border-red-500 text-red-500' // Indicate selected
                                                                            }`}
                                                                            // TODO: Implement logic to select a new variant
                                                                            onClick={() => console.log('Attribute option clicked:', attrValue)}
                                                                        >
                                                                            {attrValue.Value}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            {/* Placeholder for other options */}
                                                            <p className="text-sm text-gray-500">
                                                                Nhiều tùy chọn thuộc tính hơn sẽ được hiển thị ở đây khi dữ liệu phụ trợ có sẵn.
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-gray-500">Không có phân loại hàng nào khác.</p>
                                                    )}

                                                    <div className="flex justify-end gap-4 mt-6">
                                                        <button
                                                            className="px-6 py-2 text-gray-700 border border-gray-300 rounded-sm hover:bg-gray-100"
                                                            onClick={() => setOpenDropdownItemId(null)} // Close dropdown
                                                        >
                                                            TRỞ LẠI
                                                        </button>
                                                        {/* TODO: Implement confirmation logic */}
                                                        <button
                                                            className="px-6 py-2 bg-red-500 text-white rounded-sm hover:bg-red-600 font-semibold"
                                                            onClick={() => {
                                                                console.log('XÁC NHẬN clicked');
                                                                setOpenDropdownItemId(null); // Close dropdown after action
                                                            }}
                                                        >
                                                            XÁC NHẬN
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>


                                        {/* Price */}
                                        <div className="col-span-2 text-sm text-gray-700 text-center">
                                            {item.productVariant?.CompareAtPrice && item.productVariant.CompareAtPrice > item.productVariant.Price ? (
                                                <div className="flex flex-col items-center">
                                                    <span className="line-through text-gray-500 text-xs">₫{item.productVariant.CompareAtPrice.toLocaleString('vi-VN')}</span>
                                                    <span className="text-red-500 font-semibold">₫{item.productVariant.Price.toLocaleString('vi-VN')}</span>
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
                                <div className="border rounded-md p-4 mb-6 bg-white shadow-sm">
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
                {/* <div className="border rounded-md p-4 mb-6 bg-white shadow-sm">
                    <div className="flex items-center gap-2 text-red-500 mb-2">
                        <span className="text-lg">🎁</span>
                        <span>Shopee Voucher</span>
                        <button className="text-blue-500 text-sm hover:underline">Chọn hoặc nhập mã</button>
                    </div>
                </div> */}

                {/* Sticky Footer */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md z-10">
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
                            <span className="text-sm text-gray-600">Tổng thanh toán ({cart.cartItems.length} Sản phẩm):</span>
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
        </Layout>
    );
};

export default CartPage;
