/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: '/Terms_condition', destination: '/terms', permanent: true },
      { source: '/Privacy_Policy', destination: '/privacy', permanent: true },
      { source: '/Privacy_policy', destination: '/privacy', permanent: true },
      { source: '/Refund_Policy', destination: '/refund', permanent: true },
      { source: '/Refund_policy', destination: '/refund', permanent: true },
      { source: '/Shipping_policy', destination: '/shipping', permanent: true },
      { source: '/Shipping_Policy', destination: '/shipping', permanent: true },
      { source: '/About_us', destination: '/about', permanent: true },
      { source: '/Aboutus', destination: '/about', permanent: true },
      { source: '/faq_management', destination: '/faq', permanent: true },
    ];
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Use in-memory cache in development on Windows to prevent PackFileCache ENOENT / file locking errors
      config.cache = {
        type: 'memory',
      };
    }
    return config;
  },
};

export default nextConfig;
