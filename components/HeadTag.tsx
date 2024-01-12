import Head from "next/head";

type HeadTagProps = {
  metaDescription?: string;
  titlePrefix?: string;
};

const HeadTag = ({ metaDescription, titlePrefix }: HeadTagProps) => {
  return (
    <Head>
      <title>
        {titlePrefix ? `${titlePrefix} | OpenUrantia` : "OpenUrantia"}
      </title>

      {/* Favicon */}
      <link rel="icon" href="/logo-black-circular.png" />

      {/* Apple Touch Icons */}
      <link rel="apple-touch-icon" sizes="180x180" href="/ios/180.png" />
      <link rel="apple-touch-icon" sizes="152x152" href="/ios/152.png" />
      <link rel="apple-touch-icon" sizes="167x167" href="/ios/167.png" />
      <link rel="apple-touch-icon" sizes="120x120" href="/ios/120.png" />

      {/* Android Icons */}
      <link
        rel="icon"
        type="image/png"
        sizes="192x192"
        href="/android/android-launchericon-192-192.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="512x512"
        href="/android/android-launchericon-512-512.png"
      />

      {/* Microsoft Tiles */}
      <meta
        name="msapplication-square150x150logo"
        content="/windows11/Square150x150Logo.scale-100.png"
      />
      <meta
        name="msapplication-wide310x150logo"
        content="/windows11/Wide310x150Logo.scale-100.png"
      />
      <meta
        name="msapplication-largeTileImage"
        content="/windows11/LargeTile.scale-100.png"
      />
      <meta
        name="msapplication-TileImage"
        content="/windows11/StoreLogo.scale-100.png"
      />

      {/* Web App Manifest */}
      <link rel="manifest" href="/manifest.json" />

      {/* Safari Pinned Tab Icon */}
      <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />

      {/* Meta Tags */}
      <meta name="application-name" content="OpenUrantia" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="OpenUrantia" />
      <meta
        name="description"
        content={
          metaDescription ||
          "An open source version of The Urantia Papers for generations to come."
        }
      />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="msapplication-config" content="/browserconfig.xml" />
      <meta name="msapplication-TileColor" content="#ffffff" />
      <meta name="msapplication-tap-highlight" content="no" />
      <meta name="theme-color" content="#262626" />

      {/* Social Media Meta Tags */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:url" content="https://www.openurantia.com" />
      <meta name="twitter:title" content="OpenUrantia" />
      <meta
        name="twitter:description"
        content="An open source version of The Urantia Papers for generations to come."
      />
      <meta
        name="twitter:image"
        content="https://www.openurantia.com/android/android-launchericon-192-192.png"
      />
      <meta name="twitter:creator" content="@DavidWShadow" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content="OpenUrantia" />
      <meta
        property="og:description"
        content="An open source version of The Urantia Papers for generations to come."
      />
      <meta property="og:site_name" content="OpenUrantia" />
      <meta property="og:url" content="https://www.openurantia.com" />
      <meta
        property="og:image"
        content="https://www.openurantia.com/ios/120.png"
      />

      {/* Viewport Meta Tag */}
      <meta
        name="viewport"
        content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover"
      />
    </Head>
  );
};

export default HeadTag;
