// // app/(main)/vouchers/components/VoucherCard.tsx
// import React from 'react';
// import { FaClock } from 'react-icons/fa';

// // Import Voucher interface
// import { Voucher } from '@/types/voucher.interface';

// interface VoucherCardProps {
//   voucher: Voucher;
// }

// // Hàm hỗ trợ format tiền tệ (Ví dụ: 120000 -> 120k, 2000000 -> 1tr)
// const formatCurrency = (value: number): string => {
//   if (value >= 1_000_000) {
//     return `${value / 1_000_000}tr`;
//   }
//   if (value >= 1_000) {
//     return `${value / 1_000}k`;
//   }
//   return value.toString();
// };

// // Hàm hỗ trợ format ngày (Ví dụ: "2025-05-25T00:00:00Z" -> "25.05.2025")
// const formatDate = (isoString: string): string => {
//   const date = new Date(isoString);
//   const day = String(date.getDate()).padStart(2, '0');
//   const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
//   const year = date.getFullYear();
//   return `${day}.${month}.${year}`;
// };

// const VoucherCard: React.FC<VoucherCardProps> = ({ voucher }) => {
//   // Hàm render icon/image dựa trên visualType (hoặc có thể tự suy luận từ VoucherType/Scope)
//   const renderVoucherImage = (type?: Voucher['visualType']) => {
//     switch (type) {
//       case 'VOUCHER_XTRA':
//         return (
//           <div className="flex flex-col items-center justify-center p-2">
//             <span className="text-white text-3xl font-bold italic -rotate-12">VOUCHER</span>
//             <span className="text-yellow-300 text-3xl font-bold italic rotate-12 -mt-2">XTRA</span>
//           </div>
//         );
//       case 'SHOPEE':
//         return (
//           <div className="flex items-center justify-center h-full">
//             <span className="text-white text-5xl font-bold">S</span>
//           </div>
//         );
//       case 'XA_HANG':
//         return (
//           <div className="flex flex-col items-center justify-center p-2">
//             <span className="text-white text-2xl font-bold leading-none">XẢ</span>
//             <span className="text-white text-2xl font-bold leading-none">HÀNG</span>
//           </div>
//         );
//       case 'SHOPEE_LIVE':
//         return (
//           <div className="flex flex-col items-center justify-center p-2">
//             <span className="text-white text-xl font-bold leading-none">Shopee</span>
//             <span className="text-red-300 text-xl font-bold leading-none">Live</span>
//           </div>
//         );
//       case 'ONLY_LIVE':
//         return (
//           <div className="flex flex-col items-center justify-center p-2 text-center">
//             <span className="text-white text-xs font-bold leading-tight">CHỈ CÓ</span>
//             <span className="text-white text-xs font-bold leading-tight">TRÊN LIVE</span>
//           </div>
//         );
//       default:
//         // Fallback nếu không có visualType cụ thể
//         if (voucher.VoucherType === 'FreeShip') return <div className="text-white text-lg">Freeship</div>;
//         if (voucher.Scope === 'Platform') return <div className="text-white text-lg">Platform</div>;
//         if (voucher.Scope === 'Shop' && voucher.shopName) return <div className="text-white text-lg">{voucher.shopName}</div>;
//         if (voucher.Scope === 'Shop') return <div className="text-white text-lg">Shop</div>;
//         return <div className="text-white text-xl">Voucher</div>;
//     }
//   };

//   // Tính toán các giá trị hiển thị từ dữ liệu voucher
//   const discountText =
//     voucher.DiscountType === 'Percentage'
//       ? `Giảm ${voucher.DiscountValue}%` + (voucher.MaxValueForPercentage !== null && voucher.MaxValueForPercentage !== undefined ? ` Giảm tối đa đ${formatCurrency(voucher.MaxValueForPercentage)}` : '')
//       : `Giảm đ${formatCurrency(voucher.DiscountValue)}`;

//   const minOrderText = `Đơn Tối Thiểu đ${formatCurrency(voucher.MinOrderValue)}`;

//   const validityText = `Hiệu lực từ: ${formatDate(voucher.EndDate)}`; // Hoặc tính thời gian còn lại nếu cần

//   // Lấy tags từ Scope và VoucherType, Description
//   const tags = [];
//   if (voucher.Scope === 'Platform') {
//     tags.push('Toàn Ngành Hàng');
//   } else if (voucher.Scope === 'Shop' && voucher.shopName) {
//     tags.push(voucher.shopName);
//   } else if (voucher.Scope === 'Shop') {
//       tags.push('Shop');
//   }
//   if (voucher.VoucherType === 'FreeShip') {
//     tags.push('Miễn Phí Vận Chuyển');
//   }
//   if (voucher.Description) {
//     if (voucher.Description.includes("Xả Hàng")) {
//       tags.push("Xả Hàng");
//     }
//     if (voucher.Description.includes("Siêu Live Xả Hàng")) {
//       tags.push("Siêu Live Xả Hàng");
//     }
//     if (voucher.Description.includes("Chỉ có trên Live")) {
//       tags.push("Chỉ Có Trên Live");
//     }
//   }


//   // FIX LỖI Ở ĐÂY: Sử dụng nullish coalescing operator (??) để cung cấp giá trị mặc định là 0
//   // khi UsageLimitPerUser hoặc TimesUsedByUser là null hoặc undefined.
//   const effectiveUsageLimitPerUser = voucher.UsageLimitPerUser ?? 0;
//   const effectiveTimesUsedByUser = voucher.TimesUsedByUser ?? 0;

//   // Tính toán số lượng hiển thị (đảm bảo không âm)
//   const displayQuantity = Math.max(0, effectiveUsageLimitPerUser - effectiveTimesUsedByUser);

//   return (
//     <div className="relative flex bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden min-h-[160px]">
//       {/* Left section: Icon/Logo and main tag */}
//       <div className="flex-shrink-0 w-32 bg-orange-500 flex flex-col items-center justify-center py-3 text-white">
//         {renderVoucherImage(voucher.visualType)} {/* Sử dụng visualType */}
//         {tags[0] && ( // Chỉ hiển thị tag đầu tiên ở phần này
//           <span className="text-xs text-center mt-2 px-1 text-opacity-80">
//             {tags[0]}
//           </span>
//         )}
//       </div>

//       {/* Right section: Details and buttons */}
//       <div className="flex-1 p-4 relative flex flex-col justify-between">
//         <div>
//           <h3 className="font-semibold text-gray-800 text-base mb-1">
//             {discountText}
//           </h3>
//           <p className="text-sm text-gray-600 mb-1">
//             {minOrderText}
//           </p>
//           <p className="text-xs text-gray-500 flex items-center">
//             <FaClock className="mr-1" /> {validityText}{' '}
//             <a href="#" className="text-blue-500 hover:underline ml-1">
//               Điều Kiện
//             </a>
//           </p>
//         </div>

//         {/* Quantity tag - Sử dụng displayQuantity đã tính toán */}
//         {displayQuantity > 0 && (
//           <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
//             x{displayQuantity}
//           </span>
//         )}

//         {/* Các tag khác (nếu có) */}
//         <div className="flex gap-2 mt-2 flex-wrap">
//           {tags.slice(1).map((tag, i) => ( // Hiển thị các tag còn lại
//             <span key={i} className="text-xs border border-gray-300 text-gray-700 px-2 py-0.5 rounded-full">
//               {tag}
//             </span>
//           ))}
//         </div>

//         {/* Button "Dùng Sau" */}
//         <button className="self-end bg-gray-100 text-gray-700 py-1.5 px-4 rounded-md text-sm transition-colors duration-200 hover:bg-gray-200">
//           Dùng Sau
//         </button>
//       </div>
//     </div>
//   );
// };

// export default VoucherCard;
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
      case 'SHOPEE':
        return (
          <div className="flex items-center justify-center h-full">
            <span className="text-white text-5xl font-bold">S</span>
          </div>
        );
      case 'XA_HANG':
        return (
          <div className="flex flex-col items-center justify-center p-2">
            <span className="text-white text-2xl font-bold leading-none">XẢ</span>
            <span className="text-white text-2xl font-bold leading-none">HÀNG</span>
          </div>
        );
      case 'SHOPEE_LIVE':
        return (
          <div className="flex flex-col items-center justify-center p-2">
            <span className="text-white text-xl font-bold leading-none">Shopee</span>
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


  const effectiveUsageLimitPerUser = voucher.UsageLimitPerUser ?? 0;
  const effectiveTimesUsedByUser = voucher.TimesUsedByUser ?? 0;
  const displayQuantity = Math.max(0, effectiveUsageLimitPerUser - effectiveTimesUsedByUser);

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

        {displayQuantity > 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            x{displayQuantity}
          </span>
        )}

        <div className="flex gap-2 mt-2 flex-wrap">
          {tags.slice(1).map((tag, i) => (
            <span key={i} className="text-xs border border-gray-300 text-gray-700 px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        <button className="self-end bg-gray-100 text-gray-700 py-1.5 px-4 rounded-md text-sm transition-colors duration-200 hover:bg-gray-200">
          Dùng Sau
        </button>
      </div>
    </div>
  );
};

export default VoucherCard;