import type { NextConfig } from 'next';
import type { Configuration as WebpackDevMiddlewareOptions } from 'webpack-dev-middleware';

const nextConfig: NextConfig = {
  images: {
    domains: ['store.sony.com.vn', 'localhost', 'theson.vn', 'cdn.hoanghamobile.com', 'cdn2.cellphones.com.vn'],
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
