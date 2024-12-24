const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // assetPrefix: "https://wize.co.in",
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.alias.canvas = false
    config.resolve.alias.encoding = false
    return config
  },
};

export default nextConfig;