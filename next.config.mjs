/** @type {import('next').NextConfig} */
const nextConfig = {
  
  eslint: { ignoreDuringBuilds: true },
reactStrictMode: true,
  images: {
    // allow serving local uploaded files under /media
    remotePatterns: [],
  },
};

export default nextConfig;
