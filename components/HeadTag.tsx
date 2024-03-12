import Head from "next/head";

const DEFAULT_META_DESCRIPTION =
  "An open source version of The Urantia Papers for generations to come.";

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
      <link rel="icon" href="/logo-symbol.ico" />

      {/* Web App Manifest */}
      <link rel="manifest" href="/manifest.json" />

      {/* Meta Tags */}
      <meta name="application-name" content="OpenUrantia" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="OpenUrantia" />
      <meta
        name="description"
        content={metaDescription || DEFAULT_META_DESCRIPTION}
      />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="msapplication-config" content="/browserconfig.xml" />
      <meta name="msapplication-TileColor" content="#ffffff" />
      <meta name="msapplication-tap-highlight" content="no" />
      <meta name="theme-color" content="#ffffff" />

      {/* Social Media Meta Tags */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:url" content="https://www.openurantia.com" />
      <meta name="twitter:title" content="OpenUrantia" />
      <meta
        name="twitter:description"
        content={metaDescription || DEFAULT_META_DESCRIPTION}
      />
      <meta
        name="twitter:image"
        content="https://www.openurantia.com/background_small.png"
      />
      <meta name="twitter:creator" content="@OpenUrantia" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content="OpenUrantia" />
      <meta
        property="og:description"
        content={metaDescription || DEFAULT_META_DESCRIPTION}
      />
      <meta property="og:site_name" content="OpenUrantia" />
      <meta property="og:url" content="https://www.openurantia.com" />
      <meta
        property="og:image"
        content="https://www.openurantia.com/background_small.png"
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
