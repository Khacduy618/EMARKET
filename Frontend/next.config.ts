import type { NextConfig } from 'next';
import type { Configuration as WebpackDevMiddlewareOptions } from 'webpack-dev-middleware';

const nextConfig: NextConfig = {
  webpackDevMiddleware: (config: WebpackDevMiddlewareOptions) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    return config;
  },
  
};

export default nextConfig;
