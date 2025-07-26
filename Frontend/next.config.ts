import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: [
      'store.sony.com.vn',
      'localhost',
      'theson.vn',
      'cdn.hoanghamobile.com',
      'images.samsung.com',
      'cdn2.cellphones.com.vn',
      'news.khangz.com',
      'cdn.tgdd.vn',
      'down-vn.img.susercontent.com',
      'upload.wikimedia.org',
      'picsum.photos'
    ],
  },

  webpack(config, { isServer }) {
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
