/** @type {import('next').NextConfig} */
const publicApiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8080/api";
const apiProxyTarget = process.env.API_PROXY_TARGET
  ?? (publicApiUrl.startsWith("http") ? publicApiUrl.replace(/\/api$/, "") : "http://127.0.0.1:8080");
const staticProxyTarget = process.env.STATIC_PROXY_TARGET
  ?? (publicApiUrl.startsWith("http") ? `${apiProxyTarget}/api-manager-kols` : "http://127.0.0.1:9000/api-manager-kols");

const nextConfig = {
  devIndicators: {
    buildActivity: false,
    appIsrStatus: false,
  },
  experimental: {
    proxyClientMaxBodySize: "100mb",
  },
  async redirects() {
    return [
      {
        source: "/talent/portfolio",
        destination: "/talent/profile",
        permanent: true,
      },
    ];
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
      {
        source: "/storage/:path*",
        destination: `${apiProxyTarget}/storage/:path*`,
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
