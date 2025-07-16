// // (account)/spending/components/CategorySpendingList.tsx
// import React from 'react';

// interface CategorySpending {
//   categoryId: string | number;
//   categoryName: string;
//   amountSpent: number;
//   orderCountInCategory: number;
// }

// interface CategorySpendingListProps {
//   data: CategorySpending[];
//   totalSpentForPeriod: number; // Để tính %
// }

// const CategorySpendingList: React.FC<CategorySpendingListProps> = ({ data, totalSpentForPeriod }) => {
//   if (!data || data.length === 0) {
//     return <p className="text-center text-gray-500 py-4">Không có dữ liệu chi tiêu theo danh mục.</p>;
//   }

//   return (
//     <div className="bg-white p-4 md:p-6 rounded-lg shadow">
//       <h2 className="text-xl font-semibold text-gray-700 mb-4">Chi tiêu theo Danh mục</h2>
//       <ul className="space-y-3">
//         {data.sort((a,b) => b.amountSpent - a.amountSpent).map((item) => (
//           <li key={item.categoryId} className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
//             <div className="flex justify-between items-center mb-1">
//               <span className="font-medium text-gray-800">{item.categoryName}</span>
//               <span className="font-semibold text-indigo-600">
//                 {item.amountSpent.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
//               </span>
//             </div>
//             <div className="w-full bg-gray-200 rounded-full h-2.5">
//               <div
//                 className="bg-indigo-500 h-2.5 rounded-full"
//                 style={{ width: `${totalSpentForPeriod > 0 ? (item.amountSpent / totalSpentForPeriod) * 100 : 0}%` }}
//               ></div>
//             </div>
//             <p className="text-xs text-gray-500 mt-1">{item.orderCountInCategory} đơn hàng</p>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default CategorySpendingList;

// (account)/spending/components/CategorySpendingList.tsx
import React from 'react';

interface CategorySpending {
  categoryId: string | number;
  categoryName: string;
  amountSpent: number;
  orderCountInCategory: number;
}

interface CategorySpendingListProps {
  data: CategorySpending[];
  totalSpentForPeriod: number;
  onCategoryClick: (categoryId: string | number, categoryName: string) => void; // Prop mới
}

const CategorySpendingList: React.FC<CategorySpendingListProps> = ({ data, totalSpentForPeriod, onCategoryClick }) => {
  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500 py-4">Không có dữ liệu chi tiêu theo danh mục.</p>;
  }

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Chi tiêu theo Danh mục</h2>
      <ul className="space-y-3">
        {data.sort((a,b) => b.amountSpent - a.amountSpent).map((item) => (
          <li
            key={item.categoryId}
            className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors cursor-pointer" // Thêm cursor-pointer
            onClick={() => onCategoryClick(item.categoryId, item.categoryName)} // Gọi callback khi click
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-gray-800">{item.categoryName}</span>
              <span className="font-semibold text-indigo-600">
                {item.amountSpent.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-indigo-500 h-2.5 rounded-full"
                style={{ width: `${totalSpentForPeriod > 0 ? (item.amountSpent / totalSpentForPeriod) * 100 : 0}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{item.orderCountInCategory} đơn hàng</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategorySpendingList;