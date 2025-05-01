// Next.js configuration to increase API and server action body size limits for large image uploads

/** @type {import('next').NextConfig} */
const nextConfig = {
  api: {
    bodyParser: {
      sizeLimit: '20mb', // Increase as needed for your images
    },
  },
  serverActions: {
    bodySizeLimit: '20mb', // For app directory/server actions (Next.js 14+)
  },
};

module.exports = nextConfig;
