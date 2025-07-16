// (MỚI) Định nghĩa cấu trúc dữ liệu cho một Cửa hàng
interface Shop {
  id: string;
  name: string;
  avatarUrl: string;
}

// Định nghĩa cấu trúc dữ liệu cho một sản phẩm trong đơn hàng
interface ProductInOrder {
  productId: string;
  name: string;
  quantity: number;
  price: number; // Giá mỗi sản phẩm
  imageUrl: string;
}

// (CẬP NHẬT) Thêm 'shop' và thông tin khách hàng vào interface Order
export interface Order {
  id: string; // Mã đơn hàng
  shop: Shop; // Đơn hàng này thuộc về shop nào
  products: ProductInOrder[];
  totalAmount: number;
  status: 'Hoàn thành' | 'Đang giao' | 'Đã hủy' | 'Chờ xác nhận';
  customerName: string;
  customerAddress: string | null;
  customerPhone: string | null;
  orderDate: string; // Dùng định dạng ISO 8601 để dễ xử lý
  shippingProvider: string | null;
  trackingNumber: string | null;
}

// --- DỮ LIỆU GIẢ LẬP ---

// Tạo danh sách các cửa hàng
const mockShops: Shop[] = [
  { id: 'SHOP01', name: 'V-Style Fashion', avatarUrl: 'https://picsum.photos/seed/SHOP01/40/40' },
  { id: 'SHOP02', name: 'TechZone Gadgets', avatarUrl: 'https://picsum.photos/seed/SHOP02/40/40' },
  { id: 'SHOP03', name: 'Home Sweet Home Decor', avatarUrl: 'https://picsum.photos/seed/SHOP03/40/40' },
];

// Hàm để lấy dữ liệu giả lập
export async function getMockAdminOrders(): Promise<Order[]> {
  await new Promise(resolve => setTimeout(resolve, 500));

  const mockOrders: Order[] = [
    {
      id: 'EMKT-240723-A1B2',
      shop: mockShops[0], // Đơn hàng từ shop V-Style Fashion
      products: [
        { productId: 'P001', name: 'Áo thun thể thao nam cao cấp', quantity: 2, price: 199000, imageUrl: 'https://vn-test-11.slatic.net/p/bdf399fc2af8bd84900588d187ff50c9.jpg' },
        { productId: 'P002', name: 'Quần short kaki lưng thun', quantity: 1, price: 250000, imageUrl: 'https://bizweb.dktcdn.net/thumb/1024x1024/100/109/683/products/dsc03122.jpg?v=1685898840010' },
      ],
      totalAmount: 648000,
      status: 'Đang giao',
      customerName: 'Nguyễn Văn An',
      customerAddress: '12 Võ Văn Tần, Phường 6, Quận 3, TP.HCM',
      customerPhone: '0909090909',
      orderDate: '2024-07-23T10:30:00Z',
      shippingProvider: 'Giao Hàng Nhanh',
      trackingNumber: 'SGHN123456789',
    },
    {
      id: 'EMKT-240722-C3D4',
      shop: mockShops[1], // Đơn hàng từ shop TechZone Gadgets
      products: [
        { productId: 'P003', name: 'Tai nghe Bluetooth không dây TWS-Pro', quantity: 1, price: 350000, imageUrl: 'https://muamuaonline.com/upload/deals/storage/images/Tai%20Bluetooth%20TWS%20Pro%206%20Nhi%E1%BB%81u%20M%C3%A0u%208.jpg' },
      ],
      totalAmount: 350000,
      status: 'Hoàn thành',
      customerName: 'Trần Thị Bình',
      customerAddress: '123 Đường Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',
      customerPhone: '0908 123 456',
      orderDate: '2024-07-22T18:45:00Z',
      shippingProvider: 'J&T Express',
      trackingNumber: 'SJT123456789',
    },
    // --- DỮ LIỆU MỚI: CHỜ XÁC NHẬN ---
    {
      id: 'EMKT-240725-G7H8',
      shop: mockShops[0], // Đơn hàng từ shop V-Style Fashion
      products: [
        { productId: 'P005', name: 'Váy hoa nhí vintage cổ V', quantity: 1, price: 450000, imageUrl: 'https://down-vn.slatic.net/p/d935414f691d17d8787834a0a5522e84.jpg' },
      ],
      totalAmount: 450000,
      status: 'Chờ xác nhận',
      customerName: 'Phạm Thị Dung',
      customerAddress: '456 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
      customerPhone: '0912345678',
      orderDate: '2024-07-25T08:00:00Z',
      shippingProvider: null,
      trackingNumber: null,
    },
    {
      id: 'EMKT-240724-I9J0',
      shop: mockShops[2], // Đơn hàng từ shop Home Sweet Home Decor
      products: [
        { productId: 'P006', name: 'Bộ ga giường cotton Tencel', quantity: 1, price: 799000, imageUrl: 'https://product.hstatic.net/1000305118/product/giuong-ngu-go-oc-cho-alphabed-1_master.jpg' },
        { productId: 'P007', name: 'Đèn ngủ để bàn cảm ứng', quantity: 2, price: 150000, imageUrl: 'https://cdn.shopify.com/s/files/1/0557/7808/7849/files/den-ngu-thong-minh-cam-ung-doi-mau-yee-night-light-1.jpg?v=1687491753' },
      ],
      totalAmount: 1099000,
      status: 'Chờ xác nhận',
      customerName: 'Hoàng Văn Nam',
      customerAddress: 'Số 10, Ngõ 25, Phan Đình Phùng, Ba Đình, Hà Nội',
      customerPhone: '0988888999',
      orderDate: '2024-07-24T14:20:00Z',
      shippingProvider: null,
      trackingNumber: null,
    },
    // --- KẾT THÚC DỮ LIỆU MỚI ---
    {
      id: 'EMKT-240721-E5F6',
      shop: mockShops[1], // Đơn hàng từ shop TechZone Gadgets
      products: [
        { productId: 'P004', name: 'Sạc dự phòng 20000mAh hỗ trợ sạc nhanh', quantity: 1, price: 450000, imageUrl: 'https://www.droidshop.vn/wp-content/uploads/2023/07/Sac-du-phong-65W-JSAUX-cho-Steam-Deck-va-may-choi-game.jpg' },
      ],
      totalAmount: 450000,
      status: 'Đã hủy',
      customerName: 'Lê Minh Cường',
      customerAddress: null,
      customerPhone: null,
      orderDate: '2024-07-21T09:12:00Z',
      shippingProvider: null,
      trackingNumber: null,
    },
     {
      id: 'EMKT-240721-E5F7', // Sửa ID bị trùng lặp
      shop: mockShops[1], // Đơn hàng từ shop TechZone Gadgets
      products: [
        { productId: 'P004', name: 'Sạc dự phòng 20000mAh hỗ trợ sạc nhanh', quantity: 1, price: 450000, imageUrl: 'https://www.droidshop.vn/wp-content/uploads/2023/07/Sac-du-phong-65W-JSAUX-cho-Steam-Deck-va-may-choi-game.jpg' },
      ],
      totalAmount: 450000,
      status: 'Đã hủy',
      customerName: 'Lê Minh Cường',
      customerAddress: null,
      customerPhone: null,
      orderDate: '2024-07-21T09:12:00Z',
      shippingProvider: null,
      trackingNumber: null,
    },
    {
      id: 'EMKT-240720-XYZ9',
      shop: mockShops[2], // Đơn hàng từ shop Home Sweet Home Decor
      products: [
        { productId: 'P008', name: 'Máy ảnh Sony ZV-E10', quantity: 1, price: 950000, imageUrl: 'https://cdn.vjshop.vn/may-anh/mirrorless/sony/sony-zv-e10/lens-16-50mm-f35-56/sony-zv-e10-lens-16-50mm-f35-56-black-1-500x500.jpg' },
      ],
      totalAmount: 950000,
      status: 'Hoàn thành',
      customerName: 'Vũ Thị Lan',
      customerAddress: '55 Nguyễn Trãi, Thanh Xuân, Hà Nội',
      customerPhone: '0987654321',
      orderDate: '2024-07-20T15:00:00Z',
      shippingProvider: 'Viettel Post',
      trackingNumber: 'SVT987654321',
    },
     {
      id: 'EMKT-240720-XYZ10',
      shop: mockShops[2], // Đơn hàng từ shop Home Sweet Home Decor
      products: [
        { productId: 'P008', name: 'Máy ảnh Sony ZV-E10', quantity: 1, price: 950000, imageUrl: 'https://cdn.vjshop.vn/may-anh/mirrorless/sony/sony-zv-e10/lens-16-50mm-f35-56/sony-zv-e10-lens-16-50mm-f35-56-black-1-500x500.jpg' },
      ],
      totalAmount: 950000,
      status: 'Hoàn thành',
      customerName: 'Vũ Thị Lan',
      customerAddress: '55 Nguyễn Trãi, Thanh Xuân, Hà Nội',
      customerPhone: '0987654321',
      orderDate: '2024-07-20T15:00:00Z',
      shippingProvider: 'Viettel Post',
      trackingNumber: 'SVT987654321',
    }, {
      id: 'EMKT-240720-XYZ11',
      shop: mockShops[2], // Đơn hàng từ shop Home Sweet Home Decor
      products: [
        { productId: 'P008', name: 'Máy ảnh Sony ZV-E10', quantity: 1, price: 950000, imageUrl: 'https://cdn.vjshop.vn/may-anh/mirrorless/sony/sony-zv-e10/lens-16-50mm-f35-56/sony-zv-e10-lens-16-50mm-f35-56-black-1-500x500.jpg' },
      ],
      totalAmount: 950000,
      status: 'Hoàn thành',
      customerName: 'Vũ Thị Lan',
      customerAddress: '55 Nguyễn Trãi, Thanh Xuân, Hà Nội',
      customerPhone: '0987654321',
      orderDate: '2024-07-20T15:00:00Z',
      shippingProvider: 'Viettel Post',
      trackingNumber: 'SVT987654321',
    }, {
      id: 'EMKT-240720-XYZ12',
      shop: mockShops[2], // Đơn hàng từ shop Home Sweet Home Decor
      products: [
        { productId: 'P008', name: 'Máy ảnh Sony ZV-E10', quantity: 1, price: 950000, imageUrl: 'https://cdn.vjshop.vn/may-anh/mirrorless/sony/sony-zv-e10/lens-16-50mm-f35-56/sony-zv-e10-lens-16-50mm-f35-56-black-1-500x500.jpg' },
      ],
      totalAmount: 950000,
      status: 'Hoàn thành',
      customerName: 'Vũ Thị Lan',
      customerAddress: '55 Nguyễn Trãi, Thanh Xuân, Hà Nội',
      customerPhone: '0987654321',
      orderDate: '2024-07-20T15:00:00Z',
      shippingProvider: 'Viettel Post',
      trackingNumber: 'SVT987654321',
    }, {
      id: 'EMKT-240720-XYZ13',
      shop: mockShops[2], // Đơn hàng từ shop Home Sweet Home Decor
      products: [
        { productId: 'P008', name: 'Máy ảnh Sony ZV-E10', quantity: 1, price: 950000, imageUrl: 'https://cdn.vjshop.vn/may-anh/mirrorless/sony/sony-zv-e10/lens-16-50mm-f35-56/sony-zv-e10-lens-16-50mm-f35-56-black-1-500x500.jpg' },
      ],
      totalAmount: 950000,
      status: 'Hoàn thành',
      customerName: 'Vũ Thị Lan',
      customerAddress: '55 Nguyễn Trãi, Thanh Xuân, Hà Nội',
      customerPhone: '0987654321',
      orderDate: '2024-07-20T15:00:00Z',
      shippingProvider: 'Viettel Post',
      trackingNumber: 'SVT987654321',
    }, {
      id: 'EMKT-240720-XYZ14',
      shop: mockShops[2], // Đơn hàng từ shop Home Sweet Home Decor
      products: [
        { productId: 'P008', name: 'Máy ảnh Sony ZV-E10', quantity: 1, price: 950000, imageUrl: 'https://cdn.vjshop.vn/may-anh/mirrorless/sony/sony-zv-e10/lens-16-50mm-f35-56/sony-zv-e10-lens-16-50mm-f35-56-black-1-500x500.jpg' },
      ],
      totalAmount: 950000,
      status: 'Hoàn thành',
      customerName: 'Vũ Thị Lan',
      customerAddress: '55 Nguyễn Trãi, Thanh Xuân, Hà Nội',
      customerPhone: '0987654321',
      orderDate: '2024-07-20T15:00:00Z',
      shippingProvider: 'Viettel Post',
      trackingNumber: 'SVT987654321',
    }, {
      id: 'EMKT-240720-XYZ15',
      shop: mockShops[2], // Đơn hàng từ shop Home Sweet Home Decor
      products: [
        { productId: 'P008', name: 'Laptop Gaming MSI Titan 18 HX A2XWJG-035VN', quantity: 1, price: 950000, imageUrl: 'https://product.hstatic.net/1000233206/product/msi_titan_18_hx_ai_a2xwjg-035vn_9a3294faa3e64154afb92ca646dced28_grande.png' },
      ],
      totalAmount: 950000,
      status: 'Hoàn thành',
      customerName: 'Vũ Thị Lan',
      customerAddress: '55 Nguyễn Trãi, Thanh Xuân, Hà Nội',
      customerPhone: '0987654321',
      orderDate: '2024-07-20T15:00:00Z',
      shippingProvider: 'Viettel Post',
      trackingNumber: 'SVT987654321',
    },
  ];
  
  return mockOrders;
}

// Hàm lấy một đơn hàng theo ID vẫn hoạt động
export async function getMockAdminOrderById(id: string): Promise<Order | undefined> {
  const allOrders = await getMockAdminOrders();
  return allOrders.find(order => order.id === id);
}