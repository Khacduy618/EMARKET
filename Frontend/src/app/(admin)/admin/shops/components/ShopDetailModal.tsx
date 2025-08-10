'use client';
import { Modal, Button } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { getFullImageUrl } from '@/services/api';

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

type Props = {
  show: boolean;
  onHide: () => void;
  shopId: number | null;
};

export default function ShopDetailModal({ show, onHide, shopId }: Props) {
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!shopId || !show) return;

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost/api/admin/shops/${shopId}`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        });

        const json = await res.json();
        if (json.status) {
          setShop(json.data);
        } else {
          setShop(null);
          alert('Không thể lấy dữ liệu shop');
        }
      } catch (err) {
        console.error(err);
        alert('Lỗi khi lấy chi tiết shop');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [shopId, show]);

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Thông tin chi tiết shop</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : shop ? (
          <div>
            <img
              src={getFullImageUrl(shop.CoverImageURL)}
              alt="Cover"
              className="img-fluid mb-3"
              style={{ maxHeight: 200, objectFit: 'cover', width: '100%' }}
            />
            <div className="d-flex align-items-center mb-3">
              <img
                src={shop.LogoURL}
                alt="Logo"
                style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', marginRight: 15 }}
              />
              <div>
                <h5 className="mb-0">{shop.ShopName}</h5>
                <small className="text-muted">Đại diện: {shop.RepresentativeName}</small>
              </div>
            </div>
            <p><strong>Mô tả:</strong> {shop.Description || '(Không có mô tả)'}</p>
            <p><strong>SĐT:</strong> {shop.ShopPhone}</p>
            <p><strong>Địa chỉ:</strong> {shop.AddressStreet}, {shop.AddressWard}, {shop.AddressDistrict}, {shop.AddressCity}</p>
            <p><strong>Level:</strong> {shop.Level}</p>
            <p><strong>Trạng thái:</strong> {shop.Status}</p>
            <p><strong>Ngày đăng ký:</strong> {new Date(shop.CreatedAt).toLocaleDateString('vi-VN')}</p>
          </div>
        ) : (
          <p>Không có dữ liệu</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
