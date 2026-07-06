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
    ];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        minSize: 30000, // NÃ¢ng lÃªn 30KB Ä‘á»ƒ loáº¡i bá» cÃ¡c file quÃ¡ nhá»
        maxSize: 250000, // Giá»›i háº¡n file tá»‘i Ä‘a khÃ´ng vÆ°á»£t quÃ¡ 250KB
        maxAsyncRequests: 5, // Tá»‘i Ä‘a 5 file JS táº£i Ä‘á»“ng thá»i khi lazy load
        maxInitialRequests: 3, // Tá»‘i Ä‘a 3 file JS táº£i Ä‘á»“ng thá»i khi load trang láº§n Ä‘áº§u
      };
    }
    return config;
  },
};

export default nextConfig;
