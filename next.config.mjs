/** @type {import('next').NextConfig} */
const nextConfig = {
  // eslint: {
  //   // This allows production builds to successfully complete even if
  //   // your project has ESLint errors.
  //   ignoreDuringBuilds: true,
  //   dirs: ['.', '!artifacts'],
  // },
  // typescript: {
  //   // This allows production builds to successfully complete even if
  //   // your project has TypeScript errors.
  //   ignoreBuildErrors: true,
  //   dirs: ['.', '!artifacts'],
  // },
  output: 'standalone',
};

export default nextConfig;
