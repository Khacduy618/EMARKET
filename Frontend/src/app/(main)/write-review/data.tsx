// Định nghĩa cấu trúc dữ liệu cho sản phẩm cần đánh giá
export interface ProductForReview {
  id: string;
  name: string;
  imageUrl: string;
  shopName: string;
}

// Hàm giả lập lấy thông tin sản phẩm từ backend
export async function getMockProductForReview(productId: string): Promise<ProductForReview | null> {
    // Trong thực tế, bạn sẽ gọi API ở đây, ví dụ: fetch(`/api/products/${productId}`)
    // Dưới đây là dữ liệu giả lập
    if (productId === 'P001') {
        return {
            id: 'P001',
            name: 'Áo thun thể thao nam cao cấp, co giãn 4 chiều, thấm hút mồ hôi',
            imageUrl: 'https://vn-test-11.slatic.net/p/bdf399fc2af8bd84900588d187ff50c9.jpg',
            shopName: 'V-Style Fashion'
        };
    }
    if (productId === 'P001') {
        return {
            id: 'P001',
            name: 'Áo thun thể thao nam cao cấp, co giãn 4 chiều, thấm hút mồ hôi',
            imageUrl: 'https://vn-test-11.slatic.net/p/bdf399fc2af8bd84900588d187ff50c9.jpg',
            shopName: 'V-Style Fashion'
        };
    }if (productId === 'P001') {
        return {
            id: 'P001',
            name: 'Áo thun thể thao nam cao cấp, co giãn 4 chiều, thấm hút mồ hôi',
            imageUrl: 'https://vn-test-11.slatic.net/p/bdf399fc2af8bd84900588d187ff50c9.jpg',
            shopName: 'V-Style Fashion'
        };
    }if (productId === 'P001') {
        return {
            id: 'P001',
            name: 'Áo thun thể thao nam cao cấp, co giãn 4 chiều, thấm hút mồ hôi',
            imageUrl: 'https://vn-test-11.slatic.net/p/bdf399fc2af8bd84900588d187ff50c9.jpg',
            shopName: 'V-Style Fashion'
        };
    }if (productId === 'P001') {
        return {
            id: 'P001',
            name: 'Áo thun thể thao nam cao cấp, co giãn 4 chiều, thấm hút mồ hôi',
            imageUrl: 'https://vn-test-11.slatic.net/p/bdf399fc2af8bd84900588d187ff50c9.jpg',
            shopName: 'V-Style Fashion'
        };
    }if (productId === 'P001') {
        return {
            id: 'P001',
            name: 'Áo thun thể thao nam cao cấp, co giãn 4 chiều, thấm hút mồ hôi',
            imageUrl: 'https://vn-test-11.slatic.net/p/bdf399fc2af8bd84900588d187ff50c9.jpg',
            shopName: 'V-Style Fashion'
        };
    }if (productId === 'P001') {
        return {
            id: 'P001',
            name: 'Áo thun thể thao nam cao cấp, co giãn 4 chiều, thấm hút mồ hôi',
            imageUrl: 'https://vn-test-11.slatic.net/p/bdf399fc2af8bd84900588d187ff50c9.jpg',
            shopName: 'V-Style Fashion'
        };
    }
    // Trả về null nếu không tìm thấy sản phẩm
    return null;
}