"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Printer, X } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";
import { getAuthToken } from "@/services/api";

interface OrderActionsProps {
    status: string;
    orderId: string; // Thêm orderId để gọi API
}

export default function OrderActions({ status, orderId }: OrderActionsProps) {
    const handleConfirmOrder = async () => {
        if (!orderId) {
            Swal.fire({
                icon: "error",
                title: "Lỗi!",
                text: "Không tìm thấy ID đơn hàng.",
                confirmButtonText: "OK",
            });
            return;
        }
        const result = await Swal.fire({
            title: "Xác nhận?",
            text: "Bạn có chắc chắn muốn xác nhận và chuẩn bị đơn hàng này?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Hủy",
        });
        if (result.isConfirmed) {
            try {
                const token = getAuthToken();
                if (!token) throw new Error("Authentication token not found.");

                await axios.put(
                    `http://localhost/api/seller/orders/${orderId}/confirm`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                Swal.fire({
                    icon: "success",
                    title: "Thành công!",
                    text: "Đơn hàng đã được xác nhận và đang chuẩn bị.",
                    confirmButtonText: "OK",
                });
                // Có thể làm mới trạng thái ở đây nếu cần
            } catch (err: any) {
                Swal.fire({
                    icon: "error",
                    title: "Lỗi!",
                    text: err.response?.data?.message || "Không thể xác nhận đơn hàng.",
                    confirmButtonText: "OK",
                });
            }
        }
    };

    const handlePrintShipping = async () => {
        if (!orderId) {
            Swal.fire({
                icon: "error",
                title: "Lỗi!",
                text: "Không tìm thấy ID đơn hàng.",
                confirmButtonText: "OK",
            });
            return;
        }
        const result = await Swal.fire({
            title: "Xác nhận?",
            text: "Bạn có chắc chắn muốn in phiếu giao hàng này?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Hủy",
        });
        if (result.isConfirmed) {
            try {
                const token = getAuthToken();
                if (!token) throw new Error("Authentication token not found.");

                const response = await axios.put(
                    `http://localhost/api/seller/orders/${orderId}/print`,
                    {},
                    { headers: { 'Authorization': `Bearer ${token}` }, responseType: "blob" } // Giả định trả về file PDF
                );
                // Tạo URL cho file và mở trong tab mới
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", `shipping_label_${orderId}.pdf`); // Tên file tải về
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                Swal.fire({
                    icon: "success",
                    title: "Thành công!",
                    text: "Phiếu giao hàng đã được in.",
                    confirmButtonText: "OK",
                });
            } catch (err: any) {
                Swal.fire({
                    icon: "error",
                    title: "Lỗi!",
                    text: err.response?.data?.message || "Không thể in phiếu giao hàng.",
                    confirmButtonText: "OK",
                });
            }
        }
    };

    const handleCancelOrder = async () => {
        if (!orderId) {
            Swal.fire({
                icon: "error",
                title: "Lỗi!",
                text: "Không tìm thấy ID đơn hàng.",
                confirmButtonText: "OK",
            });
            return;
        }
        const result = await Swal.fire({
            title: "Xác nhận?",
            text: "Bạn có chắc chắn muốn hủy đơn hàng này?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Hủy",
        });
        if (result.isConfirmed) {
            try {
                const token = getAuthToken();
                if (!token) throw new Error("Authentication token not found.");

                await axios.put(
                    `http://localhost/api/seller/orders/${orderId}/cancel`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                Swal.fire({
                    icon: "success",
                    title: "Thành công!",
                    text: "Đơn hàng đã được hủy.",
                    confirmButtonText: "OK",
                });
                // Có thể làm mới trạng thái ở đây nếu cần
            } catch (err: any) {
                Swal.fire({
                    icon: "error",
                    title: "Lỗi!",
                    text: err.response?.data?.message || "Không thể hủy đơn hàng.",
                    confirmButtonText: "OK",
                });
            }
        }
    };

    const canConfirm = status === "Pending";
    const canCancel = ["Pending", "Processing"].includes(status);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-gray-600" />
                    Thao Tác
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {canConfirm && (
                        <Button onClick={handleConfirmOrder} className="w-full bg-orange-500 hover:bg-orange-600">
                            Xác Nhận & Chuẩn Bị Hàng
                        </Button>
                    )}
                    <Button onClick={handlePrintShipping} variant="outline" className="w-full bg-transparent">
                        <Printer className="mr-2 h-4 w-4" />
                        In Phiếu Giao
                    </Button>
                    {canCancel && (
                        <Button
                            onClick={handleCancelOrder}
                            variant="outline"
                            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                        >
                            <X className="mr-2 h-4 w-4" />
                            Hủy Đơn Hàng
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}