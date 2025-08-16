import type { NextConfig } from 'next';

const nextConfig = {
  images: {
    domains: ['localhost'],
    remotePatterns: [
      // Cho phép ảnh từ backend local
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8001',
        pathname: '/storage/**', // Cho phép tất cả các đường dẫn bên trong /storage
      },
      // Cho phép ảnh từ các nguồn bên ngoài khác
      { protocol: 'https', hostname: 'store.sony.com.vn' },
      { protocol: 'https', hostname: 'theson.vn' },
      { protocol: 'https', hostname: 'cdn.hoanghamobile.com' },
      { protocol: 'https', hostname: 'images.samsung.com' },
      { protocol: 'https', hostname: 'cdn2.cellphones.com.vn' },
      { protocol: 'https', hostname: 'news.khangz.com' },
      { protocol: 'https', hostname: 'cdn.tgdd.vn' },
      { protocol: 'https', hostname: 'down-vn.img.susercontent.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },
  

  webpack(config:any, { isServer }: { isServer: boolean }) {
    // Không cần config.watchOptions nếu bạn dùng Turbopack
    // nhưng nếu buộc phải dùng Webpack:
    if (!isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },

  // async redirects() {
  //   return [
  //     {
  //       source: '/seller', // Route người dùng truy cập
  //       destination: '/seller/statistics', // Route bạn muốn họ được chuyển đến
  //       permanent: true, // Đặt là true để trình duyệt và công cụ tìm kiếm biết đây là chuyển hướng vĩnh viễn
  //     },
  //   ]
  // },
};



export default nextConfig;
