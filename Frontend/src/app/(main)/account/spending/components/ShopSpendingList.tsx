// // (account)/spending/components/ShopSpendingList.tsx
// import React from 'react';

// interface ShopSpending {
//   shopId: string | number;
//   shopName: string;
//   amountSpent: number;
//   orderCountInShop: number;
// }

// interface ShopSpendingListProps {
//   data: ShopSpending[];
//   totalSpentForPeriod: number;
// }

// const ShopSpendingList: React.FC<ShopSpendingListProps> = ({ data, totalSpentForPeriod }) => {
//   if (!data || data.length === 0) {
//     return <p className="text-center text-gray-500 py-4">Không có dữ liệu chi tiêu theo cửa hàng.</p>;
//   }

//   return (
//     <div className="bg-white p-4 md:p-6 rounded-lg shadow">
//       <h2 className="text-xl font-semibold text-gray-700 mb-4">Chi tiêu theo Cửa hàng</h2>
//       <ul className="space-y-3">
//         {data.sort((a,b) => b.amountSpent - a.amountSpent).map((item) => (
//           <li key={item.shopId} className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
//             <div className="flex justify-between items-center mb-1">
//               <span className="font-medium text-gray-800">{item.shopName}</span>
//               <span className="font-semibold text-green-600">
//                 {item.amountSpent.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
//               </span>
//             </div>
//              <div className="w-full bg-gray-200 rounded-full h-2.5">
//               <div
//                 className="bg-green-500 h-2.5 rounded-full"
//                 style={{ width: `${totalSpentForPeriod > 0 ? (item.amountSpent / totalSpentForPeriod) * 100 : 0}%` }}
//               ></div>
//             </div>
//             <p className="text-xs text-gray-500 mt-1">{item.orderCountInShop} đơn hàng</p>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default ShopSpendingList;

// (account)/spending/components/ShopSpendingList.tsx
import React from 'react';

interface ShopSpending {
  shopId: string | number;
  shopName: string;
  amountSpent: number;
  orderCountInShop: number;
}

interface ShopSpendingListProps {
  data: ShopSpending[];
  totalSpentForPeriod: number;
  onShopClick: (shopId: string | number, shopName: string) => void; // Prop mới
}

const ShopSpendingList: React.FC<ShopSpendingListProps> = ({ data, totalSpentForPeriod, onShopClick }) => {
  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500 py-4">Không có dữ liệu chi tiêu theo cửa hàng.</p>;
  }

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Chi tiêu theo Cửa hàng</h2>
      <ul className="space-y-3">
        {data.sort((a,b) => b.amountSpent - a.amountSpent).map((item) => (
          <li
            key={item.shopId}
            className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors cursor-pointer" // Thêm cursor-pointer
            onClick={() => onShopClick(item.shopId, item.shopName)} // Gọi callback khi click
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-gray-800">{item.shopName}</span>
              <span className="font-semibold text-green-600">
                {item.amountSpent.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
              </span>
            </div>
             <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-green-500 h-2.5 rounded-full"
                style={{ width: `${totalSpentForPeriod > 0 ? (item.amountSpent / totalSpentForPeriod) * 100 : 0}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{item.orderCountInShop} đơn hàng</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ShopSpendingList;