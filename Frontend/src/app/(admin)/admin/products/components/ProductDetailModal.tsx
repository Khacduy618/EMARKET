'use client';

import { useEffect, useState } from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';

interface Variant {
  VariantID: number;
  SKU: string;
  Price: number;
  CompareAtPrice: number;
  StockQuantity: number;
  ImageURL: string;
}

interface ProductDetail {
  ProductID: number;
  Name: string;
  Description: string;
  Discount: number;
  viewCount: number;
  IsActive: boolean;
  AdminApprovalStatus: string;
  ReasonForRejection?: string;
  CreatedAt: string;
  UpdatedAt: string;
  shop: {
    ShopName: string;
    ShopPhone: string;
  };
  category: {
    Name: string;
  };
  images: {
    ImageURL: string;
  }[];
  variants: Variant[];
}

export default function ProductDetailModal({ productId, show, onHide }: {
  productId: number | null,
  show: boolean,
  onHide: () => void
}) {
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<ProductDetail | null>(null);

  useEffect(() => {
    if (!productId) return;
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8001/api/admin/products/${productId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        const json = await res.json();
        if (json.status) {
          setProduct(json.data);
        }
      } catch (err) {
        console.error('Lỗi lấy chi tiết:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [productId]);

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Chi tiết sản phẩm</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" />
          </div>
        ) : product ? (
          <div>
            <h5>{product.Name}</h5>
            <p>{product.Description}</p>
            <p><strong>Danh mục:</strong> {product.category.Name}</p>
            <p><strong>Shop:</strong> {product.shop.ShopName} ({product.shop.ShopPhone})</p>
            <p><strong>Lượt xem:</strong> {product.viewCount}</p>
            <p><strong>Trạng thái:</strong> {product.IsActive ? 'Hiện' : 'Ẩn'} - {product.AdminApprovalStatus}</p>

            <div className="mb-3">
              <strong>Hình ảnh:</strong>
              <div className="d-flex gap-2 mt-2 flex-wrap">
                {product.images.map((img, idx) => (
                  <img key={idx} src={img.ImageURL} alt="ảnh sản phẩm" width="100" className="rounded border" />
                ))}
              </div>
            </div>

            <div>
              <strong>Biến thể:</strong>
              <table className="table table-bordered mt-2">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Giá</th>
                    <th>Giá gốc</th>
                    <th>Tồn kho</th>
                    <th>Ảnh</th>
                  </tr>
                </thead>
                <tbody>
                  {product.variants.map((v) => (
                    <tr key={v.VariantID}>
                      <td>{v.SKU}</td>
                      <td>{v.Price.toLocaleString()}</td>
                      <td>{v.CompareAtPrice.toLocaleString()}</td>
                      <td>{v.StockQuantity}</td>
                      <td><img src={v.ImageURL} alt="ảnh biến thể" width="50" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : <p>Không có dữ liệu sản phẩm.</p>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Đóng</Button>
      </Modal.Footer>
    </Modal>
  );
}
