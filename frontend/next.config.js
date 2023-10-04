/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8080/api/:path*", // Replace this with your Spring backend URL
      },
    ];
  },
};

module.exports = nextConfig;
