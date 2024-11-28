/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa");
const { withSentryConfig } = require("@sentry/nextjs");

const nextConfig = {
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },

  // Add redirects configuration
  async redirects() {
    return [
      {
        source: "/blockchain-archive/urantia-papers/json",
        destination:
          "https://3ujo66t434cz5na2kozifk52b3mvweqts2k5ievkggxdcjkoqpja.arweave.net/3RLvenzfBZ60GlOygqu6DtlbEhOWldQSqjGuMSVOg9I",
        permanent: true,
      },
    ];
  },
};

// Apply PWA configuration
// const withPWAConfig = withPWA({
//   dest: "public",
//   register: true,
//   skipWaiting: true,
// })(nextConfig);

// Apply Sentry configuration
module.exports = withSentryConfig(
  nextConfig,
  {
    silent: true,
    org: "openurantia",
    project: "javascript-nextjs",
  },
  {
    widenClientFileUpload: true,
    transpileClientSDK: true,
    tunnelRoute: "/monitoring",
    hideSourceMaps: true,
    disableLogger: true,
    automaticVercelMonitors: true,
  }
);
