"use client"


import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import axios from "axios"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import Swal from "sweetalert2"
import Link from "next/link"
import { API_URL, WEB_URL } from "@/lib/config"
import { getStorageImageUrl } from "@/services/api"


// --- COMPONENT TÁI SỬ DỤNG ---
// Bạn có thể tách các component này ra file riêng để quản lý tốt hơn
// Ví dụ: /components/ui/InfoBlock.tsx
const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex justify-between items-start text-sm">
        <p className="text-muted-foreground">{label}:</p>
        <p className="font-medium text-right text-foreground">{value}</p>
    </div>
);


const InfoBlock = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="glass rounded-2xl p-6 shadow-3d border border-white/20">
        <h3 className="text-lg font-bold text-foreground mb-4">{title}</h3>
        <div className="space-y-3">{children}</div>
    </div>
);




// --- CÁC COMPONENT GIAO DIỆN NHỎ ---
const LoadingSpinner = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-amber-50 flex justify-center items-center">
        <div className="glass rounded-2xl p-8 shadow-3d">
            <div className="animate-spin w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
    </div>
);


const ErrorMessage = ({ message }: { message: string }) => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-amber-50 flex justify-center items-center">
        <div className="glass rounded-2xl p-8 shadow-3d border-destructive/20 max-w-md">
            <div className="text-6xl mb-4 text-center">⚠️</div>
            <h3 className="font-bold text-destructive text-center mb-2">Đã xảy ra lỗi</h3>
            <p className="text-center text-muted-foreground">{message}</p>
        </div>
    </div>
);


const StatusBadge = ({ status }: { status: string }) => {
    const statusMap: { [key: string]: { text: string; style: string } } = {
        PendingSellerApproval: { text: "Chờ xác nhận", style: "bg-yellow-100 text-yellow-800" },
        SellerApproved_WaitForReturn: { text: "Chờ người mua gửi hàng", style: "bg-blue-100 text-blue-800" },
        Approved_WaitForAdmin: { text: "Chờ Admin hoàn tiền", style: "bg-cyan-100 text-cyan-800" },
        SellerRejected: { text: "Đã từ chối", style: "bg-red-100 text-red-800" },
        Approved_ProcessingVnpayRefund: { text: "Đang xử lý hoàn tiền", style: "bg-indigo-100 text-indigo-800" },
        Approved_WaitForBankTransfer: { text: "Chờ chuyển khoản (cũ)", style: "bg-purple-100 text-purple-800" },
        Refunded: { text: "Đã hoàn tiền", style: "bg-green-100 text-green-800" },
        RefundProcessingFailed: { text: "Hoàn tiền thất bại", style: "bg-pink-100 text-pink-800" },
        Closed: { text: "Đã đóng", style: "bg-green-100 text-green-800" },
        BuyerCancelled: { text: "Người mua đã hủy", style: "bg-gray-100 text-gray-800" },
    };
    const currentStatus = statusMap[status] || { text: status, style: "bg-gray-100 text-gray-800" };
    return (
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${currentStatus.style}`}>
            {currentStatus.text}
        </span>
    );
};


// Hàm helper để parse JSON an toàn
const safeJsonParse = (jsonString: any) => {
    if (typeof jsonString !== "string") return jsonString;
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.warn("Không thể parse JSON, trả về chuỗi gốc:", jsonString);
        return jsonString;
    }
};


// COMPONENT KHỐI HÀNH ĐỘNG
const ActionBlock = ({ status, handlers }: { status: string; handlers: any }) => {
    const renderButtons = () => {
        switch (status) {
            case "PendingSellerApproval":
                return (
                    <div className="flex space-x-3">
                        <button
                            onClick={() => handlers.handleRespondRequest("approve")}
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-xl hover:shadow-3d transform hover:scale-105 transition-all duration-300 font-semibold flex items-center justify-center gap-2"
                        >
                            ✅ Chấp nhận
                        </button>
                        <button
                            onClick={() => handlers.handleRespondRequest("reject")}
                            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 rounded-xl hover:shadow-3d transform hover:scale-105 transition-all duration-300 font-semibold flex items-center justify-center gap-2"
                        >
                            ❌ Từ chối
                        </button>
                    </div>
                );
            case "SellerApproved_WaitForReturn":
                return (
                    <>
                        <p className="text-sm text-center text-muted-foreground mb-4">Vui lòng xác nhận sau khi bạn đã nhận và kiểm tra hàng trả về từ người mua.</p>
                        <button
                            onClick={handlers.handleConfirmReceipt}
                            className="w-full bg-gradient-to-r from-blue-500 to-sky-500 text-white px-4 py-3 rounded-xl hover:shadow-3d transform hover:scale-105 transition-all duration-300 font-semibold flex items-center justify-center gap-2"
                        >
                            📦 Xác nhận đã nhận hàng
                        </button>
                    </>
                );
            default:
                return (
                    <div className="glass rounded-xl p-4 text-center border border-white/10">
                        <p className="text-muted-foreground flex items-center justify-center gap-2">
                            ✅ Yêu cầu đã được xử lý hoặc không cần hành động từ bạn.
                        </p>
                    </div>
                );
        }
    };


    return (
        <div className="glass rounded-2xl p-6 shadow-3d border border-white/20">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">⚡ Hành động</h3>
            {renderButtons()}
        </div>
    );
};


// COMPONENT CHÍNH
export default function ReturnRequestDetailPage() {
    const params = useParams();
    const returnRequestId = params.id as string;
    const [requestData, setRequestData] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    // --- CÁC HÀM XỬ LÝ API ---
    const handleSuccessfulAction = (response: any) => {
        const updatedData = response.data.data;
        // Parse lại các trường JSON nếu cần
        if (typeof updatedData.EvidenceURLs === 'string') {
            updatedData.EvidenceURLs = safeJsonParse(updatedData.EvidenceURLs);
        }
        if (typeof updatedData.BuyerShippingInfoForReturn === 'string') {
            updatedData.BuyerShippingInfoForReturn = safeJsonParse(updatedData.BuyerShippingInfoForReturn);
        }
        setRequestData(updatedData);


        Swal.fire({
            icon: "success",
            title: "Thành công!",
            text: response.data.message,
        });
    };


    const handleError = (err: any) => {
        Swal.fire({
            icon: "error",
            title: "Thao tác thất bại!",
            text: err.response?.data?.message || "Đã có lỗi xảy ra, vui lòng thử lại.",
        });
    };


    const performApiAction = async (url: string, payload: object = {}) => {
        Swal.fire({
            title: "Đang xử lý...",
            text: "Vui lòng chờ trong giây lát.",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });


        try {
            const response = await axios.post(url, payload, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            });
            handleSuccessfulAction(response);
        } catch (err) {
            handleError(err);
        }
    };


    // --- CÁC HÀM XỬ LÝ HÀNH ĐỘNG CỤ THỂ ---
    const handleRespondRequest = async (action: "approve" | "reject") => {
        const swalOptions = {
            title: action === "approve" ? "Ghi chú cho người mua (Tùy chọn)" : "Nhập lý do từ chối",
            input: "textarea" as const,
            inputPlaceholder: action === "approve" ? "Bạn có muốn gửi thêm ghi chú không?..." : "Vui lòng nêu rõ lý do từ chối...",
            showCancelButton: true,
            confirmButtonText: action === "approve" ? "Xác nhận chấp thuận" : "Xác nhận từ chối",
            cancelButtonText: "Hủy",
            inputValidator: (value: string) => {
                if (action === "reject" && !value) {
                    return "Bạn cần phải nhập lý do từ chối!";
                }
            },
        };


        const result = await Swal.fire(swalOptions);
        if (!result.isConfirmed) return;


        const sellerNote = result.value || (action === "approve" ? "Yêu cầu được chấp thuận." : "Yêu cầu bị từ chối.");
        const url = `${API_URL}/seller/return-requests/${returnRequestId}/respond`;
        performApiAction(url, { action, seller_note: sellerNote });
    };


    const handleConfirmReceipt = async () => {
        const result = await Swal.fire({
            title: 'Xác nhận đã nhận hàng?',
            text: "Hành động này xác nhận bạn đã nhận và kiểm tra hàng hóa trả về. Yêu cầu sẽ chuyển sang bước hoàn tiền.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Đúng, tôi đã nhận được',
            cancelButtonText: 'Chưa'
        });


        if (!result.isConfirmed) return;


        const url = `${API_URL}/seller/return-requests/${returnRequestId}/confirm-receipt`;
        performApiAction(url);
    };


    // --- FETCH DỮ LIỆU BAN ĐẦU ---
    useEffect(() => {
        if (returnRequestId) {
            const fetchReturnRequestDetails = async () => {
                setLoading(true);
                setError(null);
                try {
                    const response = await axios.get(`${API_URL}/seller/return-requests/${returnRequestId}`, {
                        headers: { 'Content-Type': 'application/json' },
                        withCredentials: true,
                    });
                    const data = response.data;
                    // Parse các trường JSON
                    if (typeof data.EvidenceURLs === 'string') {
                        data.EvidenceURLs = safeJsonParse(data.EvidenceURLs);
                    }
                    if (typeof data.BuyerShippingInfoForReturn === 'string') {
                        data.BuyerShippingInfoForReturn = safeJsonParse(data.BuyerShippingInfoForReturn);
                    }
                    setRequestData(data);
                } catch (err: any) {
                    setError(err.response?.data?.message || "Không thể tải dữ liệu yêu cầu trả hàng.");
                } finally {
                    setLoading(false);
                }
            };
            fetchReturnRequestDetails();
        }
    }, [returnRequestId]);


    // --- RENDER GIAO DIỆN ---
    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;
    if (!requestData) return <ErrorMessage message="Không tìm thấy dữ liệu cho yêu cầu này." />;


    const {
        order_buyer,
        order_item,
        user,
        ReasonDescription,
        EvidenceURLs,
        BuyerShippingInfoForReturn,
        RequestedAt,
        Status,
        RequestType,
        RefundBankName,
        RefundAccountNumber,
        RefundAccountHolderName
    } = requestData;


    const variant = order_item?.variant;
    const product = variant?.product;
    const shippingAddress = order_buyer?.shipping_address;


    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount || 0);


    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Các element trang trí */}
            <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-xl animate-float"></div>
            <div className="absolute top-40 right-20 w-24 h-24 bg-secondary/10 rounded-full blur-xl animate-float" style={{ animationDelay: "2s" }}></div>
            <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-primary/5 rounded-full blur-2xl animate-float" style={{ animationDelay: "4s" }}></div>


            <div className="max-w-7xl mx-auto p-6 relative z-10">
                <div className="glass rounded-2xl p-6 mb-8 shadow-3d border border-white/20">
                    <div className="flex justify-between items-start flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-black from-primary to-secondary bg-clip-text mb-2">
                                🔍 Chi tiết Yêu cầu Trả hàng #{requestData.ReturnRequestID}
                            </h1>
                            <p className="text-muted-foreground flex items-center gap-2">
                                📅 Ngày yêu cầu: {format(new Date(RequestedAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                            </p>
                        </div>
                        <StatusBadge status={Status} />
                    </div>
                </div>


                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <InfoBlock title="Thông tin Sản phẩm Trả hàng">
                            <div className="flex items-start space-x-4 p-4 glass rounded-xl">
                                <img
                                    src={variant?.ImageURL ? getStorageImageUrl(variant.ImageURL) : "/diverse-products-still-life.png"}
                                    alt={product?.Name || "Sản phẩm không có tên"}
                                    className="w-24 h-24 object-cover rounded-xl border-2 border-white/20 shadow-3d"
                                />
                                <div className="flex-1">
                                    <p className="font-bold text-foreground text-lg mb-2">{product?.Name || "Sản phẩm không xác định"}</p>
                                    <div className="space-y-1 text-sm">
                                        <p className="text-muted-foreground">🏷️ SKU: <span className="font-medium">{variant?.SKU || "N/A"}</span></p>
                                        <p className="text-muted-foreground">📦 Số lượng trả: <span className="font-medium">{order_item?.Quantity || 0}</span></p>
                                        <p className="text-xl font-bold text-primary mt-3">💰 {formatCurrency(requestData.RefundAmount)}</p>
                                    </div>
                                </div>
                            </div>
                        </InfoBlock>


                        <InfoBlock title="Lý do và Bằng chứng">
                            <InfoRow label="🔄 Loại yêu cầu" value={RequestType === "Return" ? "Trả hàng & Hoàn tiền" : "Hoàn tiền"} />
                            <div className="mt-4">
                                <p className="text-sm text-muted-foreground mb-2">💬 Mô tả của người mua:</p>
                                <div className="glass rounded-xl p-4 border border-white/10">
                                    <p className="text-sm text-foreground whitespace-pre-wrap">{ReasonDescription}</p>
                                </div>
                            </div>
                            {EvidenceURLs && Array.isArray(EvidenceURLs) && EvidenceURLs.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-sm text-muted-foreground mb-3">📸 Hình ảnh/Video bằng chứng:</p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {EvidenceURLs.map((url: string, index: number) => (
                                             <a
                                                key={index}
                                                href={`${WEB_URL}${url.replace(/\\/g, "")}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <img
                                                    src={`${WEB_URL}${url.replace(/\\/g, "")}`}
                                                    alt={`Bằng chứng ${index + 1}`}
                                                    className="w-full h-24 object-cover rounded-xl border-2 border-white/20 shadow-3d hover:shadow-3d-hover transform hover:scale-105 transition-all duration-300"
                                                />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </InfoBlock>
                    </div>


                    <div className="space-y-6">
                        <InfoBlock title="Thông tin Người mua & Đơn hàng">
                            <InfoRow label="👤 Tên khách hàng" value={user?.FullName} />
                            <InfoRow label="📞 Số điện thoại"  value={shippingAddress.PhoneNumber} />
                            <InfoRow
                                label="📋 Mã đơn hàng gốc"
                                value={
                                    order_buyer ? (
                                        <Link href={`/seller/orders/${order_buyer.OrderID}`} className="text-primary hover:text-secondary transition-colors duration-300 font-medium">
                                            {order_buyer.OrderCode}
                                        </Link>
                                    ) : ("N/A")
                                }
                            />
                            {shippingAddress && (
                                <>
                                    <div className="border-t border-white/10 my-3"></div>
                                    <p className="text-sm font-semibold text-muted-foreground mb-2">Địa chỉ giao hàng gốc:</p>
                                    <InfoRow label="👤 Người nhận" value={shippingAddress.FullName} />
                                    <InfoRow label="📞 SĐT nhận hàng" value={shippingAddress.PhoneNumber} />
                                    <div className="mt-3">
                                        <p className="text-sm text-muted-foreground mb-2">🏠 Địa chỉ chi tiết:</p>
                                        <div className="glass rounded-xl p-3 border border-white/10">
                                            <p className="text-sm text-foreground">
                                                {`${shippingAddress.Street}, ${shippingAddress.Ward}, ${shippingAddress.District}, ${shippingAddress.City}`}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </InfoBlock>


                        {BuyerShippingInfoForReturn && typeof BuyerShippingInfoForReturn === "object" && (
                            <InfoBlock title="Địa chỉ người mua gửi trả hàng">
                                <InfoRow label="👤 Người gửi" value={BuyerShippingInfoForReturn.full_name} />
                                <InfoRow label="📞 Số điện thoại" value={BuyerShippingInfoForReturn.phone_number} />
                                <div className="mt-3">
                                    <p className="text-sm text-muted-foreground mb-2">🏠 Địa chỉ chi tiết:</p>
                                    <div className="glass rounded-xl p-3 border border-white/10">
                                        <p className="text-sm text-foreground">{BuyerShippingInfoForReturn.address_line}</p>
                                    </div>
                                </div>
                            </InfoBlock>
                        )}


                        {(requestData.RequestType === 'Refund' || requestData.Status !== 'PendingSellerApproval') && (
                            <InfoBlock title="Thông tin Hoàn tiền">
                                {requestData.RefundMethod === 'BankTransfer' || requestData.Status === 'RefundProcessingFailed' ? (
                                    <>
                                        <InfoRow label="💳 Phương thức" value="Chuyển khoản Ngân hàng" />
                                        <div className="border-t border-white/10 my-3"></div>
                                        <InfoRow label="🏦 Ngân hàng" value={RefundBankName || 'Chưa cập nhật'} />
                                        <InfoRow label="📝 Số tài khoản" value={RefundAccountNumber || 'Chưa cập nhật'} />
                                        <InfoRow label="👤 Chủ tài khoản" value={RefundAccountHolderName || 'Chưa cập nhật'} />
                                        <p className="text-xs text-muted-foreground mt-3">Admin sẽ thực hiện chuyển khoản tới thông tin này.</p>
                                    </>
                                ) : (
                                    <>
                                        <InfoRow label="💳 Phương thức" value="VNPAY" />
                                        <div className="border-t border-white/10 my-3"></div>
                                        <p className="text-sm text-muted-foreground">Tiền sẽ được hoàn tự động qua cổng VNPAY.</p>
                                    </>
                                )}
                            </InfoBlock>
                        )}


                        <ActionBlock
                            status={Status}
                            handlers={{
                                handleRespondRequest,
                                handleConfirmReceipt,
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}


