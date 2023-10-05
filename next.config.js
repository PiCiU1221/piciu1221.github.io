/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "server",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://firesignal.onrender.com/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
