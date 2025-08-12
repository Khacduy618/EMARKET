
export interface Review {
  id: number;
  user: string;
  avatar: string;
  rating: number;
  date: string;
  content: string;
  images: string[];
  helpful: number;
  variant: string;
  shopId?: number;
  shopReply?: {
    content: string;
    date: string;
  } | null;
}

export interface RatingStats {
  average: number
  total: number
  distribution: {
    [key: number]: number
  }
}

export type ReviewStatus = "pending" | "approved" | "rejected" | "under_review" | "hidden" | "flagged";

export interface AdminReview {
  id: number; 
  reviewerName: string;
  reviewerAvatar: string | null;
  rating: number;
  content: string;
  date: string; // Đã được format từ backend
  images: string[]; // Đã được parse từ backend
  status: ReviewStatus;
  productName: string;
  productImage: string | null;
  shopName: string;
  shopId: number;
  requestFromShop: {
    open: boolean;
    reason?: string;
    createdAt?: string;
  } | null;
}