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
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.alias.canvas = false
    config.resolve.alias.encoding = false
    net : false
    if(!isServer){
      config.resolve.alias['pdfjs-dist']='pdfjs-dist/webpack';
    }
    return config
  },
  reactStrictMode: true,
  distDir: 'build',
  output: 'standalone',
};

export default nextConfig;