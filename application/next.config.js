const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      // NextJS <Image> component needs to whitelist domains for src={}
      "lh3.googleusercontent.com",
      "pbs.twimg.com",
      "images.unsplash.com",
      "logos-world.net",
      "avatars.githubusercontent.com", // GitHub avatars
      "github.com", // GitHub assets
    ],
  },
};

module.exports = nextConfig;
