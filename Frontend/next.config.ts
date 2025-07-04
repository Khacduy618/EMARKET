import type { NextConfig } from 'next';
import type { Configuration as WebpackDevMiddlewareOptions } from 'webpack-dev-middleware';

const nextConfig: NextConfig = {
  images: {
    domains: ['store.sony.com.vn', 'localhost', 'theson.vn', 'cdn.hoanghamobile.com','images.samsung.com',  'cdn2.cellphones.com.vn','news.khangz.com', 'cdn.tgdd.vn','down-vn.img.susercontent.com', 'upload.wikimedia.org', 'picsum.photos'],
    remotePatterns: [
      {
        protocol: 'http', // hoặc 'https' nếu bạn dùng https
        hostname: 'localhost', // hoặc domain production của bạn, ví dụ 'api.yourdomain.com'
        port: '8001',
        pathname: '/**', // cho phép tất cả các đường dẫn ảnh
      },
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
