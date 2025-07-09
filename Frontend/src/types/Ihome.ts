export namespace IHome {
    export interface Banner {
        BannerID: number;
        Title?: string | null;
        ImageURL: string;
        LinkURL?: string | null;
        Position?: string | null;
        SortOrder?: number | null;
        IsActive: boolean;
        StartDate?: string | null;
        EndDate?: string | null;
        CreatedAt?: string;
        UpdatedAt?: string;
    }
    export interface ApiProduct {
        ProductID: number;
        ProductName: string;
        ProductLevelDiscount: number;
        Price: number;
        CompareAtPrice?: number | null;
        ImageURL?: string | null;
        FinalPrice: number;
        average_rating?: number | null;
        SoldCount?: number;
        name?: string;
        slug?: string;
        description?: string;
        image_url?: string;
        tags?: string[];
        variant?: ApiVariant | null; // Sửa lại: variant có thể là null
        sold_count?: number;
    }


    export interface Category {
        CategoryID: number;
        Name: string;
        ImageURL: string | null;
        IsActive: boolean;
    };
    export interface FlashSaleProduct {
        FlashSaleID: number;
        ProductID: number;
        ProductName: string;
        Price: string | null;       // Có thể là null
        Discount: string | null;    // Có thể là null
        Quantity: number;
        ProductImage: string | null;
        SoldQuantity?: number;
        mockedSoldQuantity?: number;
    }

    export interface FlashSaleSlot {
        slot_display_time: string;
        slot_effective_start: string;
        slot_effective_end: string;
        status: string;
        flash_sales: FlashSaleProduct[];
    }

    export interface FlashSaleDateEntry {
        date: string;
        slots_on_date: FlashSaleSlot[];
    }

    export interface FlashSaleApiResponse {
        initial_requested_date_or_today: string;
        current_server_time_hcm: string;
        daily_flash_sales_slots: FlashSaleDateEntry[];
    }
    export interface ApiVariant {
        id: number;
        price: number;
        compare_at_price: number | null;
        image_url: string;
        discount_percentage: number | null;
    }
    export interface ProcessedProduct {
        ProductID: number;
        ProductName: string;
        ImageURL: string | null;
        FinalPrice: number;
        originalPrice: number | null;
        discountPercent: number;
        averageRatingValue?: number;
        reviewCount?: number;
        soldCountDisplay?: string;
        name?: string;
        slug?: string;
    }

}
