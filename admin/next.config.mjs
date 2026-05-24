/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/invitation.html',
      },
    ];
  },
};

export default nextConfig;
