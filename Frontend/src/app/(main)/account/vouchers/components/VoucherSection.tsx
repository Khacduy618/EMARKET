'use client';

import React, { useState, useEffect } from 'react';
// Bỏ import FaPlus vì không còn dùng
import VoucherCard from './VoucherCard';
import { Voucher } from '@/types/voucher.interface';
import { Loader2 } from 'lucide-react';
import { API_URL } from '@/lib/config';
import { toast } from 'react-toastify';
import { getAuthToken } from '@/services/api'; // Đảm bảo bạn có hàm này

export default function VoucherSection() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [userVouchers, setUserVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const vouchersPerPage = 10;
  
  useEffect(() => {
    const fetchUserVouchers = async () => {
      setLoading(true);
      try {
       
        const response = await fetch(`${API_URL}/vouchers`, {
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'include', // Đảm bảo gửi cookie nếu cần

        });

        if (!response.ok) {
          throw new Error('Không thể tải danh sách voucher.');
        }

        const data: { platformVouchers: Voucher[], shopVouchers: Voucher[] } = await response.json();
        
        const allFetchedVouchers = [...data.platformVouchers, ...data.shopVouchers];

        const processedVouchers = allFetchedVouchers.map((v: Voucher) => {
            let visualType: Voucher['visualType'] = undefined;
            if (v.VoucherType === 'FreeShip') visualType = 'FREESHIP';
            else if (v.VoucherType === 'SaleOff') {
                if (v.Scope === 'Shop') visualType = 'XA_HANG';
                else if (v.Scope === 'Platform') visualType = 'EMARKET';
            }
            if (v.Description?.toLowerCase().includes("live")) visualType = 'EMARKET_LIVE';
            if (v.Description?.toLowerCase().includes("chỉ có trên live")) visualType = 'ONLY_LIVE';
            if (v.Description?.toLowerCase().includes("xtra")) visualType = 'VOUCHER_XTRA';
            return { ...v, visualType };
        });

        setUserVouchers(processedVouchers);
      } catch (error: any) {
        toast.error(error.message || "Đã có lỗi xảy ra.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserVouchers();
  }, []);

  // *** SỬA LẠI HÀM NÀY ***
  const getFilteredVouchers = () => {
    let vouchersByTab: Voucher[] = [];
    switch (activeTab) {
      case 'all':
        vouchersByTab = userVouchers;
        break;
      case 'platform':
        vouchersByTab = userVouchers.filter(v => v.Scope === 'Platform');
        break;
      case 'shop':
        vouchersByTab = userVouchers.filter(v => v.Scope === 'Shop');
        break;
      default:
        vouchersByTab = [];
        break; // Luôn cần break cho mỗi case
    }

    // Logic tìm kiếm được đưa ra ngoài switch
    if (!searchKeyword.trim()) {
      return vouchersByTab; // Trả về kết quả sau khi lọc tab
    }

    const keyword = searchKeyword.toLowerCase().trim();
    // Lọc tiếp trên kết quả đã lọc theo tab
    return vouchersByTab.filter(voucher => 
      (voucher.Code?.toLowerCase().includes(keyword)) ||
      (voucher.Description?.toLowerCase().includes(keyword)) ||
      (voucher.shopName?.toLowerCase().includes(keyword))
    );
  };

  const filteredVouchers = getFilteredVouchers();

  // Logic phân trang giữ nguyên
  const indexOfLastVoucher = currentPage * vouchersPerPage;
  const indexOfFirstVoucher = indexOfLastVoucher - vouchersPerPage;
  const currentVouchers = filteredVouchers.slice(indexOfFirstVoucher, indexOfLastVoucher);
  const totalPages = Math.ceil(filteredVouchers.length / vouchersPerPage);

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchKeyword]);

  const shopVouchersCount = userVouchers.filter(v => v.Scope === 'Shop').length;
  const platformVouchersCount = userVouchers.filter(v => v.Scope === 'Platform').length;

  const tabs = [
    { id: 'all', name: 'Tất cả', count: userVouchers.length },
    { id: 'platform', name: 'Platform', count: platformVouchersCount },
    { id: 'shop', name: 'Shop', count: shopVouchersCount },
  ];
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-gray-500" size={24} />
      </div>
    );
  }

  // Phần JSX không có lỗi, chỉ sửa lại logic và cú pháp ở trên
  return (
    <div>
        <div className="flex justify-between items-center pb-6">
            <h1 className="text-2xl font-bold text-black">Kho Voucher</h1>
        </div>

        <div className="pt-6 border-t border-gray-200 mb-8">
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-md">
                <label htmlFor="voucherSearch" className="text-gray-700 font-semibold text-sm">Tìm Voucher</label>
                <input
                    type="text"
                    id="voucherSearch"
                    placeholder="Tìm theo mã, tên shop, hoặc mô tả..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="flex-1 py-2 text-black px-3 border border-gray-300 rounded-md text-sm
                               focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                />
            </div>
        </div>

        <div className="border-b border-gray-200 mb-6">
            <div className="flex overflow-x-auto whitespace-nowrap -mb-px">
                {tabs.map((tab) => (
                    <div
                        key={tab.id}
                        className={`py-3 px-4 text-sm font-semibold cursor-pointer transition-colors duration-200
                          ${activeTab === tab.id
                            ? 'border-b-2 border-orange-500 text-orange-500'
                            : 'text-gray-700 hover:text-orange-500 hover:border-b-2 hover:border-orange-100'
                          }`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.name}
                        {tab.count > 0 && <span className="font-normal text-gray-500 ml-1">({tab.count})</span>}
                    </div>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentVouchers.length > 0 ? (
                currentVouchers.map((voucher: Voucher) => ( // Thêm type Voucher ở đây
                    <VoucherCard key={voucher.VoucherID} voucher={voucher} />
                ))
            ) : (
                <p className="col-span-full text-center text-gray-500 mt-8">
                    {searchKeyword ? `Không tìm thấy voucher nào khớp với "${searchKeyword}".` : 'Bạn chưa có voucher nào trong mục này.'}
                </p>
            )}
        </div>

        {totalPages > 1 && (
            <nav className="flex justify-center mt-8" aria-label="Pagination">
                <ul className="flex list-none p-0">
                    <li>
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 mx-1 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Trước
                        </button>
                    </li>
                    {pageNumbers.map(number => (
                        <li key={number}>
                            <button
                                onClick={() => paginate(number)}
                                className={`px-3 py-1.5 mx-1 border border-gray-300 rounded-md
                                  ${currentPage === number ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                            >
                                {number}
                            </button>
                        </li>
                    ))}
                    <li>
                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 mx-1 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Sau
                        </button>
                    </li>
                </ul>
            </nav>
        )}
    </div>
  );
}