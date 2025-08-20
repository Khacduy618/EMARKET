
// app/(main)/vouchers/components/VoucherCard.tsx
import React from 'react';
import { FaClock } from 'react-icons/fa';
import { Voucher } from '@/types/voucher.interface';

interface VoucherCardProps {
  voucher: Voucher;
}

const formatCurrency = (value: number): string => {
  if (value === 0) return '0';
  if (value >= 1_000_000) {
    return `${value / 1_000_000}tr`;
  }
  if (value >= 1_000) {
    return `${value / 1_000}k`;
  }
  return value.toString();
};

const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

const VoucherCard: React.FC<VoucherCardProps> = ({ voucher }) => {
  const renderVoucherImage = (type?: Voucher['visualType']) => {
    switch (type) {
      case 'VOUCHER_XTRA':
        return (
          <div className="flex flex-col items-center justify-center p-2">
            <span className="text-white text-3xl font-bold italic -rotate-12">VOUCHER</span>
            <span className="text-yellow-300 text-3xl font-bold italic rotate-12 -mt-2">XTRA</span>
          </div>
        );
     
      case 'XA_HANG':
        return (
          <div className="flex flex-col items-center justify-center p-2">
            <span className="text-white text-2xl font-bold leading-none">XẢ</span>
            <span className="text-white text-2xl font-bold leading-none">HÀNG</span>
          </div>
        );
      case 'EMARKET_LIVE':
        return (
          <div className="flex flex-col items-center justify-center p-2">
            <span className="text-white text-xl font-bold leading-none">Emarket</span>
            <span className="text-red-300 text-xl font-bold leading-none">Live</span>
          </div>
        );
      case 'ONLY_LIVE':
        return (
          <div className="flex flex-col items-center justify-center p-2 text-center">
            <span className="text-white text-xs font-bold leading-tight">CHỈ CÓ</span>
            <span className="text-white text-xs font-bold leading-tight">TRÊN LIVE</span>
          </div>
        );
      // THÊM CÁC TRƯỜNG HỢP MỚI
      case 'EMARKET':
        return (
          <div className="flex flex-col items-center justify-center p-2">
            <span className="text-white text-3xl font-bold">E</span>
            <span className="text-white text-lg font-semibold -mt-2">MARKET</span>
          </div>
        );
      case 'FREESHIP':
        return (
          <div className="flex flex-col items-center justify-center p-2">
            <span className="text-white text-xl font-bold">FREESHIP</span>
            {/* Có thể thêm icon xe tải nếu muốn: <FaTruck className="text-white text-2xl mt-1" /> */}
          </div>
        );
      default:
        // Fallback chung
        return <div className="text-white text-xl">Voucher</div>;
    }
  };

  const discountText =
    voucher.DiscountType === 'Percentage'
      ? `Giảm ${voucher.DiscountValue}%` + (voucher.MaxValueForPercentage !== null && voucher.MaxValueForPercentage !== undefined && voucher.MaxValueForPercentage > 0 ? ` Giảm tối đa đ${formatCurrency(voucher.MaxValueForPercentage)}` : '')
      : `Giảm đ${formatCurrency(voucher.DiscountValue)}`;

  const minOrderText = `Đơn Tối Thiểu đ${formatCurrency(voucher.MinOrderValue)}`;
  const validityText = `Hiệu lực từ: ${formatDate(voucher.EndDate)}`;

  const tags: string[] = [];

  // Tạo tags dựa trên Scope và VoucherType
  if (voucher.Scope === 'Platform') {
    tags.push('Toàn Ngành Hàng');
  } else if (voucher.Scope === 'Shop' && voucher.shopName) {
    tags.push(voucher.shopName);
  } else if (voucher.Scope === 'Shop') {
    tags.push('Shop');
  }
  if (voucher.VoucherType === 'FreeShip') {
    tags.push('Miễn Phí Vận Chuyển');
  }

  // Thêm tags dựa trên Description (giả định các keywords)
  if (voucher.Description) {
    const lowerDesc = voucher.Description.toLowerCase();
    if (lowerDesc.includes("xtra") && !tags.includes("Voucher Xtra")) tags.push("Voucher Xtra");
    if (lowerDesc.includes("xả hàng") && !tags.includes("Xả Hàng")) tags.push("Xả Hàng");
    if (lowerDesc.includes("live") && !tags.includes("Siêu Live")) tags.push("Siêu Live");
    if (lowerDesc.includes("chỉ có trên live") && !tags.includes("Chỉ Có Trên Live")) tags.push("Chỉ Có Trên Live");
  }

// **LOGIC MỚI: TÍNH SỐ LƯỢT DÙNG CÒN LẠI**
  // Xử lý trường hợp UsageLimitPerUser là null (dùng không giới hạn)
  const isUnlimited = voucher.UsageLimitPerUser === null;

  // Nếu không giới hạn, chúng ta không cần hiển thị số lượng
  const displayQuantityLabel = !isUnlimited;

  // Tính số lượng còn lại để hiển thị nếu có giới hạn
  let remainingUses = 0;
  if (!isUnlimited) {
    const limit = voucher.UsageLimitPerUser ?? 0;
    const used = voucher.TimesUsedByUser ?? 0;
    remainingUses = Math.max(0, limit - used);
  }

  // Thay đổi nút dựa trên số lượt dùng còn lại
  const buttonText = isUnlimited || remainingUses > 0 ? 'Dùng ngay' : 'Đã hết lượt';
  const buttonDisabled = !isUnlimited && remainingUses <= 0;

  return (
    <div className="relative flex bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden min-h-[160px]">
      <div className="flex-shrink-0 w-32 bg-orange-500 flex flex-col items-center justify-center py-3 text-white">
        {renderVoucherImage(voucher.visualType)}
        {tags[0] && (
          <span className="text-xs text-center mt-2 px-1 text-opacity-80">
            {tags[0]}
          </span>
        )}
      </div>

      <div className="flex-1 p-4 relative flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-gray-800 text-base mb-1">
            {discountText}
          </h3>
          <p className="text-sm text-gray-600 mb-1">
            {minOrderText}
          </p>
          <p className="text-xs text-gray-500 flex items-center">
            <FaClock className="mr-1" /> {validityText}{' '}
            <a href="#" className="text-blue-500 hover:underline ml-1">
              Điều Kiện
            </a>
          </p>
        </div>

        {displayQuantityLabel && remainingUses > 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            Còn lại: x{remainingUses}
          </span>
        )}

        <div className="flex gap-2 mt-2 flex-wrap">
          {tags.slice(1).map((tag, i) => (
            <span key={i} className="text-xs border border-gray-300 text-gray-700 px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        <button 
          className={`self-end py-1.5 px-4 rounded-md text-sm transition-colors duration-200 ${
            buttonDisabled 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
              : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
          }`}
          disabled={buttonDisabled}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default VoucherCard;