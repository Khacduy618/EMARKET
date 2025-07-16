import type { NextConfig } from 'next';
import type { Configuration as WebpackDevMiddlewareOptions } from 'webpack-dev-middleware';

const nextConfig = {
  images: {
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
  webpackDevMiddleware: (config: WebpackDevMiddlewareOptions) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    return config;
  },
};

export default nextConfig;
