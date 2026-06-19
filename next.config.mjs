/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: {
    buildActivity: false,
    appIsrStatus: false,
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
