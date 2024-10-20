// next.config.mjs
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'www.gravatar.com',
        },
        {
          protocol: 'https',
          hostname: 'mvnsmwxwjklawrlkksyl.supabase.co',
          pathname: '/storage/v1/object/public/stickers/**',
        },
      ],
    },
  };
  
  export default nextConfig;
