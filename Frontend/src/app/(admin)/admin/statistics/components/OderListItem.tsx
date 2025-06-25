import Link from 'next/link';

const OrderListItem = ({ id, customer, date, total, status, handelOrder }:
  { id: string, customer?: string, date?: string, total?: string, status?: string, handelOrder?: (date?: string) => void; }) => {
  const statusClasses = {
    Processing: 'bg-yellow-100 text-yellow-800',
    Shipped: 'bg-blue-100 text-blue-800',
    Delivered: 'bg-green-100 text-green-800',
  };
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="p-4 font-medium">{id}</td>
      <td className="p-4 text-gray-700">{customer}</td>
      <td className="p-4 text-secondary text-center">{date}</td>
      <td className="p-4 fw-medium text-dark text-center">{total}</td>
      <td className="p-4">{status} </td>
      <td className="p-4">
      <button
        className="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#createCategoryModal"
        onClick={() => handelOrder?.(customer)}>
        Chi tiết
      </button></td>
    </tr>
  );
};

export default OrderListItem;