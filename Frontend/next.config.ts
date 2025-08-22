import type { NextConfig } from 'next';

const nextConfig = {
  eslint: {
        ignoreDuringBuilds: true, // Ignore ESLint errors during build
    },
    typescript: {
        ignoreBuildErrors: true, // Ignore TypeScript errors during build
    },
  images: {
    domains: ['localhost'],
    remotePatterns: [
      // Cho phép ảnh từ backend local (Laravel)
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '80', // Đảm bảo port khớp với server Laravel
        pathname: '/storage/**', // Cho phép tất cả các đường dẫn bên trong /storage
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '80', // Thêm port 8000 cho 127.0.0.1 nếu cần
        pathname: '/storage/**',
      },
      // Cho phép ảnh từ các nguồn bên ngoài khác
    
      { protocol: 'https', hostname: 'store.sony.com.vn' },
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
      //webhook img url ; 
    ],
  },
  

  webpack(config: any, { isServer }: { isServer: boolean }) {
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


};



export default nextConfig;
