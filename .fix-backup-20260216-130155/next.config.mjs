/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // allow serving local uploaded files under /media
    remotePatterns: [],
  },
};

export default nextConfig;
