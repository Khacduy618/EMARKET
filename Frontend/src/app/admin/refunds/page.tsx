"use client";

import React, { useState, useEffect } from "react";
import axios, { type AxiosError } from "axios";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Filter, RefreshCw, Users, Clock, CheckCircle, XCircle, AlertCircle, Eye, DollarSign } from "lucide-react";

//=========== TYPE DEFINITIONS ===========
interface RefundRequestSummary {
    ReturnRequestID: number;
    RequestCode: string;
    Status: string;
    RequestedAt: string;
    user: { FullName: string };
    shop: { ShopName: string };
    RefundAmount: string;
}
interface PaginatedResponse {
    data: RefundRequestSummary[];
    total: number;
}
//========================================

//=========== HELPER FUNCTIONS ===========
const formatCurrency = (amount: string | number): string => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(amount));
const formatDateTime = (dateTimeString: string): string => new Date(dateTimeString).toLocaleString("vi-VN");

const getStatusVariant = (status: string): "default" | "destructive" | "secondary" | "outline" => {
    switch (status) {
        case "Approved_WaitForAdmin": return "default";
        case "SellerRejected": return "destructive";
        default: return "secondary";
    }
};

const getStatusText = (status: string): string => {
    const statusMap: { [key: string]: string } = {
        'Approved_WaitForAdmin': 'Chờ Hoàn Tiền',
        'PendingSellerApproval': 'Chờ Seller Duyệt',
        'SellerRejected': 'Seller Từ Chối'
    };
    return statusMap[status] || status;
};
//========================================

//=========== REUSABLE COMPONENTS ===========
const RefundCard: React.FC<{ request: RefundRequestSummary }> = ({ request }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 shadow-sm bg-card">
        <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <CardTitle className="text-lg font-semibold text-foreground">
                        Yêu cầu: <span className="text-primary">{request.RequestCode}</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{formatDateTime(request.RequestedAt)}</p>
                </div>
                <Badge variant={getStatusVariant(request.Status)}>{getStatusText(request.Status)}</Badge>
            </div>
        </CardHeader>
        <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Người mua</p>
                    <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6"><AvatarFallback className="text-xs">{request.user.FullName.charAt(0)}</AvatarFallback></Avatar>
                        <p className="font-medium text-sm">{request.user.FullName}</p>
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Cửa hàng</p>
                    <p className="font-medium text-sm">{request.shop.ShopName}</p>
                </div>
                <div className="space-y-1 text-right">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Số tiền hoàn</p>
                    <p className="text-xl font-bold text-destructive">{formatCurrency(request.RefundAmount)}</p>
                </div>
            </div>
            <div className="flex justify-end">
                <Link href={`/admin/refunds/${request.ReturnRequestID}`}>
                    <Button asChild variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors bg-transparent">
                        <a><Eye className="w-4 h-4 mr-2" /> Xem chi tiết & Xử lý</a>
                    </Button>
                </Link>
            </div>
        </CardContent>
    </Card>
);

const StatsCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <Card className="border-0 shadow-sm"><CardContent className="p-6">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <p className="text-2xl font-bold text-foreground">{value}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg text-primary">{icon}</div>
        </div>
    </CardContent></Card>
);
//========================================

//=========== MAIN PAGE COMPONENT ===========
export default function AdminRefundListPage() {
    const [requests, setRequests] = useState<RefundRequestSummary[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRefundRequests = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const apiClient = axios.create({
                baseURL: "http://localhost:8001",
                headers: { "X-Requested-With": "XMLHttpRequest", Accept: "application/json" },
                withCredentials: true,
            });
            await apiClient.get("/sanctum/csrf-cookie");
            const response = await apiClient.get<PaginatedResponse>("/api/admin/return-requests/pending-refunds");
            setRequests(response.data.data);
            setTotal(response.data.total);
        } catch (err) {
            const error = err as AxiosError;
            if (error.response?.status === 401) {
                setError("Phiên đăng nhập không hợp lệ hoặc đã hết hạn.");
            } else {
                setError(error.message || "Không thể tải dữ liệu.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRefundRequests();
    }, []);

    if (isLoading) {
        return <div className="min-h-screen bg-background flex items-center justify-center"><RefreshCw className="w-8 h-8 animate-spin text-primary" /></div>;
    }

    if (error) {
        return <div className="min-h-screen bg-background flex items-center justify-center"><Card className="p-6 text-center text-destructive">{error}</Card></div>;
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="bg-card border-b">
                <div className="max-w-7xl mx-auto px-6 py-6"><div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Quản lý Hoàn tiền</h1>
                        <p className="text-muted-foreground mt-1">Theo dõi và xử lý các yêu cầu cần hoàn tiền</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2" />Lọc</Button>
                        <Button onClick={fetchRefundRequests} size="sm"><RefreshCw className="w-4 h-4 mr-2" />Làm mới</Button>
                    </div>
                </div></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <StatsCard title="Tổng yêu cầu chờ" value={total.toString()} icon={<Users className="w-6 h-6" />} />
                    {/* Các thẻ stats khác có thể thêm sau */}
                </div>

                <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Yêu cầu hoàn tiền ({total})</h2>
                    {total > 0 ? (
                        <div className="space-y-4">
                            {requests.map((request) => <RefundCard key={request.ReturnRequestID} request={request} />)}
                        </div>
                    ) : (
                        <Card className="text-center py-12"><CardContent>
                            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">Không có yêu cầu nào đang chờ xử lý.</p>
                        </CardContent></Card>
                    )}
                </div>
            </div>
        </div>
    );
}