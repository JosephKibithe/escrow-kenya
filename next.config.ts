import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Scripts: self + Reown/WalletConnect CDN
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.reown.com https://*.walletconnect.com https://*.walletconnect.org",
              // Styles
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Fonts
              "font-src 'self' https://fonts.gstatic.com",
              // Images: allow data URIs and all HTTPS (NFT avatars etc.)
              "img-src 'self' data: blob: https:",
              // Iframes: Reown embedded wallet auth iframes
              "frame-src 'self' https://*.reown.com https://*.walletconnect.com https://*.walletconnect.org https://*.magic.link https://verify.walletconnect.org https://secure.walletconnect.org",
              // Connections: API calls, WebSocket relay, Reown auth
              "connect-src 'self' wss://*.walletconnect.org wss://*.walletconnect.com https://*.walletconnect.com https://*.walletconnect.org https://*.reown.com https://api.coingecko.com https://rpc.walletconnect.com https://relay.walletconnect.com https://*.magic.link wss://*.magic.link",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
