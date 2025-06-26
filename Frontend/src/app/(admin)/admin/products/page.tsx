'use client';

import { useEffect, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import ProductDetailModal from './components/ProductDetailModal';

interface Product {
  ProductID: number;
  Name: string;
  IsActive: boolean;
  AdminApprovalStatus: string;
  SoldCount: number;
  viewCount: number;
  CreatedAt: string;
  category?: {
    Name: string;
  };
}

const approvalOptions = [
  { value: 'Pending', label: 'Chờ duyệt' },
  { value: 'Approved', label: 'Đã duyệt' },
  { value: 'Rejected', label: 'Từ chối' },
];

const formatDate = (isoDate: string) => {
  const d = new Date(isoDate);
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('vi-VN');
};

export default function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [keyword, setKeyword] = useState('');
  const [sortColumn, setSortColumn] = useState('CreatedAt');
  const [sortType, setSortType] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [limitItem, setLimitItem] = useState(10);
  const [totalPage, setTotalPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        keyword,
        sort_by: sortColumn,
        sort_order: sortType,
        page: currentPage.toString(),
        per_page: limitItem.toString(),
      });

      const res = await fetch(`http://localhost:8001/api/admin/products?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      const json = await res.json();
      setProducts(json.data.data);
      console.log(json);
      setTotalPage(json.data.last_page || 1);
    } catch (err) {
      console.error('Lỗi fetch:', err);
      alert('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [keyword, sortColumn, sortType, currentPage, limitItem]);

  const handleSort = (col: string) => {
    if (col === sortColumn) {
      setSortType(sortType === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(col);
      setSortType('asc');
    }
  };

  const handleShowDetail = (id: number) => {
    setSelectedProductId(id);
    setShowModal(true);
  };

  const handleApprovalChange = async (productId: number, newStatus: string) => {
    const product = products.find(p => p.ProductID === productId);
    const statusLabel = approvalOptions.find(opt => opt.value === newStatus)?.label || newStatus;

    const result = await Swal.fire({
      title: 'Xác nhận thay đổi',
      text: `Bạn có chắc muốn cập nhật trạng thái duyệt của sản phẩm "${product?.Name}" thành "${statusLabel}" không?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Hủy',
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`http://localhost:8001/api/admin/products/${productId}/approval-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ _method: 'PUT', status: newStatus }),
      });

      const json = await res.json();
      if (json.status) {
        setProducts(prev =>
          prev.map(p => p.ProductID === productId ? { ...p, AdminApprovalStatus: newStatus } : p)
        );
        Swal.fire({ icon: 'success', title: 'Cập nhật thành công!', timer: 1500, showConfirmButton: false });
      } else {
        Swal.fire({ icon: 'error', title: 'Thất bại', text: json.message || 'Có lỗi xảy ra' });
      }
    } catch (err) {
      console.error('Lỗi khi cập nhật:', err);
      Swal.fire({ icon: 'error', title: 'Lỗi mạng!', text: 'Không thể kết nối đến máy chủ' });
    }
  };

  const renderSortIcon = (col: string) => {
    if (sortColumn !== col) return <FaSort />;
    return sortType === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-3">Danh sách sản phẩm</h3>

      <div className="mb-3 p-3 border rounded bg-light d-flex gap-2 flex-wrap align-items-center">
        <input
          type="text"
          className="form-control"
          placeholder="Tìm kiếm tên sản phẩm..."
          value={keyword}
          onChange={e => {
            setKeyword(e.target.value);
            setCurrentPage(1);
          }}
          style={{ minWidth: 200 }}
        />
        <span>Hiển thị: </span>
        <select
          className="form-select form-select-sm"
          value={limitItem}
          onChange={e => {
            setLimitItem(parseInt(e.target.value, 10));
            setCurrentPage(1);
          }}
          style={{ maxWidth: 120 }}
        >
          {[5, 10, 20, 50].map(n => (
            <option key={n} value={n}>{n} sản phẩm</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
          <Spinner animation="border" role="status" variant="primary" />
        </div>
      ) : (
        <>
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th onClick={() => handleSort('Name')} style={{ cursor: 'pointer' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    Tên sản phẩm {renderSortIcon('Name')}
                  </span>
                </th>
                <th>Danh mục</th>
                <th onClick={() => handleSort('IsActive')} style={{ cursor: 'pointer' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    Trạng thái {renderSortIcon('IsActive')}
                  </span>
                </th>
                <th>Phê duyệt</th>
                <th onClick={() => handleSort('ViewCount')} style={{ cursor: 'pointer' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    Lượt xem {renderSortIcon('ViewCount')}
                  </span>
                </th>
                <th onClick={() => handleSort('CreatedAt')} style={{ cursor: 'pointer' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    Ngày tạo {renderSortIcon('CreatedAt')}
                  </span>
                </th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted">Không có dữ liệu</td>
                </tr>
              )}
              {products.map((prod) => (
                <tr key={prod.ProductID}>
                  <td>{prod.Name}</td>
                  <td>{prod.category?.Name || 'Không có'}</td>
                  <td>{prod.IsActive ? 'Hiện' : 'Ẩn'}</td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={prod.AdminApprovalStatus}
                      onChange={(e) => handleApprovalChange(prod.ProductID, e.target.value)}
                    >
                      {approvalOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </td>
                  <td>{prod.viewCount}</td>
                  <td>{formatDate(prod.CreatedAt)}</td>
                  <td>
                    <button className="btn btn-sm btn-info" onClick={() => handleShowDetail(prod.ProductID)}>
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <nav>
            <ul className="pagination justify-content-center">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>&laquo;</button>
              </li>
              {Array.from({ length: totalPage }, (_, i) => i + 1).map(p => (
                <li key={p} className={`page-item ${p === currentPage ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(p)}>{p}</button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPage ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPage))}>&raquo;</button>
              </li>
            </ul>
          </nav>

          {selectedProductId && (
            <ProductDetailModal
              productId={selectedProductId}
              show={showModal}
              onHide={() => setShowModal(false)}
            />
          )}
        </>
      )}
    </div>
  );
}
