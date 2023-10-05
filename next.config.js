/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://firesignal.onrender.com/api/:path*",
      },
    ];
  },
  trailingSlash: true,
  output: "export",
};

module.exports = nextConfig;
