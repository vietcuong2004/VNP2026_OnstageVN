/** @type {import('next').NextConfig} */
const apiProxyTarget = process.env.API_PROXY_TARGET ?? "http://127.0.0.1:8080";
const staticProxyTarget = process.env.STATIC_PROXY_TARGET ?? "http://127.0.0.1:9000/api-manager-kols";
const reverbProxyTarget = process.env.REVERB_PROXY_TARGET ?? "http://127.0.0.1:8081";

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
        source: "/app/:path*",
        destination: `${reverbProxyTarget}/app/:path*`,
      },
      {
        source: "/apps/:path*",
        destination: `${reverbProxyTarget}/apps/:path*`,
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        minSize: 30000, // Nâng lên 30KB để loại bỏ các file quá nhỏ
        maxSize: 250000, // Giới hạn file tối đa không vượt quá 250KB
        maxAsyncRequests: 5, // Tối đa 5 file JS tải đồng thời khi lazy load
        maxInitialRequests: 3, // Tối đa 3 file JS tải đồng thời khi load trang lần đầu
      };
    }
    return config;
  },
};

export default nextConfig;
