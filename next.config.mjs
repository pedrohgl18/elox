/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Define apenas features reconhecidas para evitar warnings no console do navegador
          {
            key: 'Permissions-Policy',
            value: [
              'accelerometer=()',
              'autoplay=()',
              'camera=()',
              'display-capture=()',
              'encrypted-media=()',
              'fullscreen=(self)',
              'geolocation=()',
              'gyroscope=()',
              'microphone=()',
              'midi=()',
              'payment=()'
            ].join(', '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
