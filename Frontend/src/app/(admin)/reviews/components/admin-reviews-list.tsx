"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import axios, { AxiosError } from "axios";
import { AdminReviewCard, type AdminReview } from "./ReviewCard";
import { FilterControls } from "./FilterControls";
import { StatsHeader, type StatsData } from "./StatsHeader";
import { Loader2, MessageSquare, CheckCircle } from "lucide-react";
import Image from "next/image";

// --- INTERFACES & UTILITY FUNCTIONS ---
interface ShopInfo {
  ShopID: number | null;
  ShopName: string;
  LogoURL: string | null;
}
interface GroupedReviewData {
  shop_info: ShopInfo;
  reviews: AdminReview[];
}

const getAuthToken = (): string | null =>
  typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

const getAuthConfig = (params?: URLSearchParams) => {
  const token = getAuthToken();
  const headers: { [key: string]: string } = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return { headers, params };
};

export const getFullImageUrl = (path: string | null | undefined): string => {
  if (!path) return "/placeholder.png";
  if (path.startsWith("http")) return path;
  const baseUrl = "http://localhost:8001";
  return `${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
};

const Toast = ({
  message,
  type,
  onDismiss,
}: {
  message: string;
  type: "success" | "error";
  onDismiss: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);
  return (
    <div
      className={`fixed top-5 right-5 z-[100] flex items-center p-4 rounded-lg shadow-lg text-white ${
        type === "success" ? "bg-green-500" : "bg-red-600"
      }`}
    >
      <CheckCircle className="w-5 h-5 mr-3" />
      <span>{message}</span>
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function AdminReviewsList() {
  const searchParams = useSearchParams();
  const [groupedReviews, setGroupedReviews] = useState<GroupedReviewData[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const laravelApiBaseUrl = "http://localhost:8001/api";

  const fetchData = useCallback(
    async (showLoadingSpinner = true) => {
      if (showLoadingSpinner) setIsLoading(true);
      setError(null);

      const params = new URLSearchParams(searchParams.toString());
      try {
        const [reviewsRes, statsRes] = await Promise.all([
          axios.get(
            `${laravelApiBaseUrl}/admin/reviews`,
            getAuthConfig(params)
          ),
          axios.get(
            `${laravelApiBaseUrl}/admin/reviews/stats`,
            getAuthConfig()
          ),
        ]);
        if (reviewsRes.data.success) {
          setGroupedReviews(reviewsRes.data.data);
        } else {
          throw new Error(reviewsRes.data.message || "Lỗi khi lấy dữ liệu.");
        }
        setStats(statsRes.data);
      } catch (err) {
        const axiosError = err as AxiosError;
        const errorMessage =
          (axiosError.response?.data as any)?.message ||
          "Đã xảy ra lỗi không xác định khi tải dữ liệu.";
        setError(errorMessage);
      } finally {
        if (showLoadingSpinner) setIsLoading(false);
      }
    },
    [searchParams, laravelApiBaseUrl]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAction = async (
    action: "approve" | "reject" | "reply" | "delete",
    reviewId: number,
    payload?: object
  ) => {
    const previousReviews = JSON.parse(JSON.stringify(groupedReviews));

    const newGroupedReviews = groupedReviews.map((group) => ({
      ...group,
      reviews: group.reviews
        .map((review) => {
          if (review.ReviewID !== reviewId) return review;
          switch (action) {
            case "approve":
              return { ...review, IsApproved: true };
            case "reject":
              return { ...review, IsApproved: false };
            case "reply":
              return { ...review, AdminReply: (payload as any).replyText };
            case "delete":
              return null;
            default:
              return review;
          }
        })
        .filter(Boolean) as AdminReview[],
    }));
    setGroupedReviews(newGroupedReviews);

    try {
      const baseUrl = `${laravelApiBaseUrl}/admin/reviews/${reviewId}`;
      const url = action === "delete" ? baseUrl : `${baseUrl}/${action}`;

      await axios({
        method: action === "delete" ? "DELETE" : "POST",
        url,
        data: payload,
        ...getAuthConfig(),
      });

      setToast({
        message: `Hành động '${action}' thành công!`,
        type: "success",
      });
      axios
        .get(`${laravelApiBaseUrl}/admin/reviews/stats`, getAuthConfig())
        .then((res) => setStats(res.data));
    } catch (err) {
      console.error(`Lỗi khi thực hiện hành động ${action}:`, err);
      const axiosError = err as AxiosError;
      const errorMessage =
        (axiosError.response?.data as any)?.message ||
        `Hành động '${action}' thất bại.`;
      setToast({ message: errorMessage, type: "error" });
      setGroupedReviews(previousReviews);
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}

      <div className="flex justify-between items-start mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Quản lý Reviews
          </h1>
          <p className="text-gray-600 mt-1">
            Quản lý và kiểm duyệt các đánh giá sản phẩm
          </p>
        </div>
      </div>

      <StatsHeader stats={stats} />
      <FilterControls />

      <div className="mt-6">
        {isLoading ? (
          <div className="text-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
            <p className="mt-2">Đang tải...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="font-semibold text-red-600">{error}</p>
          </div>
        ) : groupedReviews.some((g) => g.reviews.length > 0) ? (
          <div className="space-y-8">
            {groupedReviews.map(
              (group) =>
                group.reviews.length > 0 && (
                  <div
                    key={group.shop_info.ShopID || "shop-deleted"}
                    className="bg-white rounded-xl shadow-md border"
                  >
                    <div className="p-4 border-b flex items-center space-x-3 bg-gray-50 rounded-t-xl">
                      <Image
                        src={getFullImageUrl(group.shop_info.LogoURL)}
                        alt={group.shop_info.ShopName || "Shop Logo"}
                        width={40}
                        height={40}
                        className="rounded-full object-cover border"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.png";
                        }}
                      />
                      <h2 className="text-lg font-bold text-gray-800">
                        {group.shop_info.ShopName}
                      </h2>
                    </div>
                    <div className="p-4 space-y-4">
                      {group.reviews.map((review) => (
                        <AdminReviewCard
                          key={review.ReviewID}
                          review={review}
                          onApprove={(id) => handleAction("approve", id)}
                          onReject={(id) => handleAction("reject", id)}
                          onDelete={(id) => handleAction("delete", id)}
                          onReply={(id, text) =>
                            handleAction("reply", id, { replyText: text })
                          }
                        />
                      ))}
                    </div>
                  </div>
                )
            )}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-lg border">
            <MessageSquare className="h-12 w-12 mx-auto text-gray-300" />
            <p className="mt-4 font-medium text-gray-700">
              Không tìm thấy review nào khớp với bộ lọc.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
