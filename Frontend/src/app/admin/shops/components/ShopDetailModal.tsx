'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { API_BASE_URL, getAuthToken } from '@/services/api';

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
        const authToken = getAuthToken();
        const res = await fetch(API_BASE_URL + `/admin/shops/${shopId}`, {
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include',
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
    <Dialog open={show} onOpenChange={onHide}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thông tin chi tiết shop</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <p className="text-center py-8">Đang tải dữ liệu...</p>
          ) : shop ? (
            <div className="space-y-4">
              {/* Cover Image */}
              <div className="relative w-full h-48 rounded-lg overflow-hidden">
                <Image
                  src={shop.CoverImageURL || "/placeholder.svg?height=200&width=400&query=shop cover image"}
                  alt="Cover"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Shop Info Header */}
              <div className="flex items-center space-x-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden">
                  <Image
                    src={shop.LogoURL || "/placeholder.svg?height=64&width=64&query=shop logo"}
                    alt="Logo"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{shop.ShopName}</h3>
                  <p className="text-sm text-muted-foreground">
                    Đại diện: {shop.RepresentativeName}
                  </p>
                </div>
              </div>

              {/* Shop Details */}
              <div className="space-y-3">
                <div>
                  <span className="font-medium">Mô tả:</span>
                  <p className="text-muted-foreground mt-1">
                    {shop.Description || '(Không có mô tả)'}
                  </p>
                </div>

                <div>
                  <span className="font-medium">SĐT:</span>
                  <span className="ml-2">{shop.ShopPhone}</span>
                </div>

                <div>
                  <span className="font-medium">Địa chỉ:</span>
                  <p className="text-muted-foreground mt-1">
                    {shop.AddressStreet}, {shop.AddressWard}, {shop.AddressDistrict}, {shop.AddressCity}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Level:</span>
                    <span className="ml-2">{shop.Level}</span>
                  </div>

                  <div>
                    <span className="font-medium">Trạng thái:</span>
                    <span className="ml-2">{shop.Status}</span>
                  </div>
                </div>

                <div>
                  <span className="font-medium">Ngày đăng ký:</span>
                  <span className="ml-2">
                    {new Date(shop.CreatedAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">Không có dữ liệu</p>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="secondary" onClick={onHide}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}