'use client';
import { useEffect, useState } from 'react';
import { OverlayTrigger, Tooltip, Spinner } from 'react-bootstrap';
import Swal from 'sweetalert2';
import ShopDetailModal from './components/ShopDetailModal'; // Đảm bảo đúng đường dẫn
import { getFullImageUrl } from '@/services/api';
import { API_URL } from '@/lib/config';

type Shop = {
  ShopID: number;
  UserID: number;
  ShopName: string;
  Description: string;
  LogoURL: string;
  CoverImageURL: string;
  AddressStreet: string;
  AddressWard: string;
  AddressDistrict: string;
  AddressCity: string;
  ShopPhone: string;
  Level: string;
  Status: string;
  RepresentativeName: string;
  CreatedAt: string;
};

const statusOptions = [
  { value: 'PendingApproval', label: 'Chờ xác nhận', tooltip: 'Chờ admin phê duyệt' },
  { value: 'Approved', label: 'Đã được chấp nhận', tooltip: 'Shop hoạt động bình thường' },
  { value: 'Suspended', label: 'Tạm ngưng', tooltip: 'Shop bị tạm dừng' },
  { value: 'Rejected', label: 'Bị từ chối', tooltip: 'Shop không được duyệt' },
];

type SortableThProps = {
  label: string;
  sortColumn: string;
  columnKey: string;
  sortType: 'asc' | 'desc';
  onSort: (col: string, newSortType: 'asc' | 'desc') => void;
};

function SortableTh({ label, sortColumn, columnKey, sortType, onSort }: SortableThProps) {
  const isActive = sortColumn === columnKey;
  const nextSortType = isActive && sortType === 'asc' ? 'desc' : 'asc';
  return (
    <th
      role="button"
      onClick={() => onSort(columnKey, nextSortType)}
      style={{ userSelect: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
      title={`Sắp xếp theo ${label} (${nextSortType === 'asc' ? 'Tăng dần' : 'Giảm dần'})`}
    >
      {label}
      {isActive && <span style={{ marginLeft: 5 }}>{sortType === 'asc' ? ' ▲' : ' ▼'}</span>}
    </th>
  );
}

function formatDate(isoDate: string) {
  const d = new Date(isoDate);
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('vi-VN');
}

export default function ShopTable() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [sortColumn, setSortColumn] = useState('ShopID');
  const [sortType, setSortType] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [limitItem, setLimitItem] = useState(10);
  const [totalPage, setTotalPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [selectedShopId, setSelectedShopId] = useState<number | null>(null);

  const fetchShops = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        keyword,
        sort_column: sortColumn,
        sort_type: sortType,
        current_page: currentPage.toString(),
        display_quantity: limitItem.toString(),
      });

      const res = await fetch(`${API_URL}/admin/shops?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      const json = await res.json();
      if (json.status) {
        setShops(json.data);
        setTotalPage(json.pagination.totalPage || 1);
      } else {
        alert('Không thể tải danh sách shop');
      }
    } catch (err) {
      console.error('Lỗi fetch:', err);
      alert('Lỗi khi tải danh sách shop');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, [keyword, sortColumn, sortType, currentPage, limitItem]);

  const setSortColumnAndType = (col: string, newSortType: 'asc' | 'desc') => {
    setSortColumn(col);
    setSortType(newSortType);
    setCurrentPage(1);
  };

  const handleStatusChange = async (shopId: number, newStatus: string) => {
    const shop = shops.find(s => s.ShopID === shopId);
    const statusLabel = statusOptions.find(opt => opt.value === newStatus)?.label || newStatus;

    const result = await Swal.fire({
      title: 'Xác nhận thay đổi',
      text: `Bạn có chắc muốn đổi trạng thái của shop "${shop?.ShopName}" sang "${statusLabel}" không?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Hủy',
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_URL}/admin/shops/${shopId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ _method: 'PUT', status: newStatus }),
      });

      const json = await res.json();
      if (json.status) {
        setShops(prev => prev.map(shop => shop.ShopID === shopId ? { ...shop, Status: newStatus } : shop));
        Swal.fire({ icon: 'success', title: 'Cập nhật thành công!', timer: 1500, showConfirmButton: false });
      } else {
        Swal.fire({ icon: 'error', title: 'Cập nhật thất bại!', text: json.message || 'Có lỗi xảy ra' });
      }
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái:', err);
      Swal.fire({ icon: 'error', title: 'Lỗi mạng!', text: 'Không thể kết nối đến máy chủ' });
    }
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-3">Danh sách shop</h3>

      {/* Bộ lọc tìm kiếm */}
      <div className="shop-filter-header mb-3 p-3 border rounded bg-light d-flex gap-2 flex-wrap align-items-center">
        <h4 style={{ margin: 0, whiteSpace: 'nowrap' }}>Bộ lọc và tìm kiếm</h4>
        <input
          type="text"
          className="form-control"
          placeholder="Tìm kiếm theo tên shop..."
          value={keyword}
          onChange={e => {
            setKeyword(e.target.value);
            setCurrentPage(1);
          }}
          style={{ minWidth: 100 }}
        />

        <select
          className="form-select"
          value={sortColumn}
          onChange={e => setSortColumnAndType(e.target.value, sortType)}
          style={{ maxWidth: 150 }}
        >
          <option value="ShopID">ShopID</option>
          <option value="ShopName">Tên Shop</option>
          <option value="RepresentativeName">Đại diện</option>
          <option value="ShopPhone">Điện thoại</option>
          <option value="AddressCity">Địa chỉ (TP)</option>
          <option value="Level">Level</option>
          <option value="Status">Trạng thái</option>
          <option value="CreatedAt">Ngày đăng ký</option>
        </select>

        <select
          className="form-select"
          value={sortType}
          onChange={e => setSortColumnAndType(sortColumn, e.target.value as 'asc' | 'desc')}
          style={{ maxWidth: 150 }}
        >
          <option value="asc">Tăng dần</option>
          <option value="desc">Giảm dần</option>
        </select>

        <span style={{ whiteSpace: 'nowrap' }}>Hiển thị: </span>
        <select
          className="form-select"
          value={limitItem}
          onChange={e => {
            setLimitItem(parseInt(e.target.value, 10));
            setCurrentPage(1);
          }}
          style={{ maxWidth: 100 }}
        >
          {[5, 10, 20, 50].map(n => (
            <option key={n} value={n}>{n}</option>
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
                <SortableTh label="Logo" columnKey="LogoURL" {...{ sortColumn, sortType, onSort: setSortColumnAndType }} />
                <SortableTh label="Tên Shop" columnKey="ShopName" {...{ sortColumn, sortType, onSort: setSortColumnAndType }} />
                <SortableTh label="Đại diện" columnKey="RepresentativeName" {...{ sortColumn, sortType, onSort: setSortColumnAndType }} />
                <SortableTh label="Điện thoại" columnKey="ShopPhone" {...{ sortColumn, sortType, onSort: setSortColumnAndType }} />
                <SortableTh label="Level" columnKey="Level" {...{ sortColumn, sortType, onSort: setSortColumnAndType }} />
                <SortableTh label="Ngày đăng ký" columnKey="CreatedAt" {...{ sortColumn, sortType, onSort: setSortColumnAndType }} />
                <SortableTh label="Trạng thái" columnKey="Status" {...{ sortColumn, sortType, onSort: setSortColumnAndType }} />
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {shops.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center text-muted">Không có dữ liệu</td>
                </tr>
              )}
              {shops.map(shop => (
                <tr key={shop.ShopID}>
                  <td>
                    <img src={getFullImageUrl(shop.LogoURL)} alt="Logo" style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '50%' }} />
                  </td>
                  <td>{shop.ShopName}</td>
                  <td className="text-muted">{shop.RepresentativeName}</td>
                  <td className="text-muted small">{shop.ShopPhone}</td>
                  <td className="text-muted small">{shop.Level}</td>
                  <td className="text-muted small">{formatDate(shop.CreatedAt)}</td>
                  <td>
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip id={`tooltip-${shop.ShopID}`}>Trạng thái hiện tại: {shop.Status}</Tooltip>}
                    >
                      <select
                        className="form-select form-select-sm"
                        value={shop.Status}
                        onChange={e => handleStatusChange(shop.ShopID, e.target.value)}
                      >
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </OverlayTrigger>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => {
                        setSelectedShopId(shop.ShopID);
                        setShowModal(true);
                      }}
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Phân trang */}
          <nav>
            <ul className="pagination justify-content-center">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>&laquo;</button>
              </li>
              {Array.from({ length: totalPage }, (_, i) => i + 1).map(page => (
                <li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(page)}>{page}</button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPage ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPage))}>&raquo;</button>
              </li>
            </ul>
          </nav>

          {/* Gọi Modal chi tiết */}
          <ShopDetailModal
            show={showModal}
            onHide={() => setShowModal(false)}
            shopId={selectedShopId}
          />
        </>
      )}
    </div>
  );
}
