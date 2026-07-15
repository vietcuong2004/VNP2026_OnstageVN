/** @type {import('next').NextConfig} */
const apiProxyTarget = process.env.API_PROXY_TARGET ?? "http://127.0.0.1:8080";
const staticProxyTarget = process.env.STATIC_PROXY_TARGET ?? "http://127.0.0.1:9000/api-manager-kols";

const nextConfig = {
  devIndicators: {
    buildActivity: false,
    appIsrStatus: false,
  },
  async rewrites() {
    return [
      {
        source: "/api/broadcasting/auth",
        destination: `${apiProxyTarget}/broadcasting/auth`,
      },
      {
        source: "/api/:path*",
        destination: `${apiProxyTarget}/api/:path*`,
      },
      {
        source: "/static/:path*",
        destination: `${staticProxyTarget}/:path*`,
      },
      {
        source: "/Talent_Image/:path*",
        destination: `${apiProxyTarget}/Talent_Image/:path*`,
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        minSize: 30000,
        maxSize: 250000,
        maxAsyncRequests: 5,
        maxInitialRequests: 3,
      };
    }
    return config;
  },
};

export default nextConfig;
