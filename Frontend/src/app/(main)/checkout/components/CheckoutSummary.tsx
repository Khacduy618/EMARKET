'use client';

import React from 'react';
import Link from 'next/link';
import { CheckoutSummaryDetails } from '@/types';

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

interface CheckoutSummaryProps {
  summary: CheckoutSummaryDetails;
  onPlaceOrder: () => void;
}

const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({ summary, onPlaceOrder }) => {
  return (
    <div className='sticky bottom-0 mt-4'>
      <div className=" bg-white rounded-ss-sm rounded-se-sm shadow-sm border border-gray-200">
        <div className="p-4 space-y-2 text-sm border-b">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Chi tiết thanh toán</h3>
          <div className="flex justify-between">
            <span className="text-gray-600">Tổng tiền hàng</span>
            <span className="text-gray-800">{formatPrice(summary.totalProductsPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Phí vận chuyển</span>
            <span className="text-gray-800">{formatPrice(summary.totalShippingFee)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tổng cộng Voucher giảm giá</span>
            <span className="text-green-600 font-medium">-{formatPrice(summary.totalDiscount)}</span>
          </div>
        </div>
        <div className="py-4 px-4 flex justify-between items-center">
          <span className="font-semibold text-gray-800">Tổng thanh toán:</span>
          <span className="text-2xl font-bold text-orange-500">{formatPrice(summary.finalTotal)}</span>
        </div>
      </div>
      <div className=" bg-white p-4 rounded-es-sm rounded-ee-sm shadow-sm border border-gray-200 flex justify-between items-center">
        <p className="text-xs text-gray-500 max-w-md">
          Nhấn "Đặt Hàng" đồng nghĩa với việc bạn đồng ý tuân theo 
          <Link href="/terms" className="text-blue-500"> Điều khoản E-Market</Link>.
        </p>
        <button
          onClick={onPlaceOrder}
          className="bg-orange-500 text-white px-12 py-3 rounded-md text-base font-semibold hover:bg-orange-600 transition-colors"
        >
          Đặt Hàng
        </button>
      </div>
    </div>
  );
};

export default CheckoutSummary;