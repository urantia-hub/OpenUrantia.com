import Head from "next/head";

const DEFAULT_META_DESCRIPTION =
  "Explore the Urantia Papers through a modern digital platform. Discover profound insights about science, spirituality, and human history. Join our community of truth-seekers for an enhanced reading experience with study tools and collaborative features.";

type HeadTagProps = {
  metaDescription?: string;
  titlePrefix?: string;
};

const HeadTag = ({ metaDescription, titlePrefix }: HeadTagProps) => {
  return (
    <Head>
      <title>
        {titlePrefix ? `${titlePrefix} | UrantiaHub` : "UrantiaHub"}
      </title>

      {/* Favicon */}
      <link rel="icon" href="/logo-symbol.ico" />

      {/* Web App Manifest */}
      <link rel="manifest" href="/manifest.json" />

      {/* Meta Tags */}
      <meta name="application-name" content="UrantiaHub" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="UrantiaHub" />
      <meta
        name="description"
        content={metaDescription || DEFAULT_META_DESCRIPTION}
      />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="msapplication-config" content="/browserconfig.xml" />
      <meta name="msapplication-TileColor" content="#e2e8f0" />
      <meta name="msapplication-tap-highlight" content="no" />
      <meta name="theme-color" content="#e2e8f0" />

      {/* Social Media Meta Tags */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:url" content="https://www.urantiahub.com" />
      <meta name="twitter:title" content="UrantiaHub" />
      <meta
        name="twitter:description"
        content={metaDescription || DEFAULT_META_DESCRIPTION}
      />
      <meta
        name="twitter:image"
        content="https://www.urantiahub.com/sharing.png"
      />
      <meta name="twitter:creator" content="@urantiahub" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content="UrantiaHub" />
      <meta
        property="og:description"
        content={metaDescription || DEFAULT_META_DESCRIPTION}
      />
      <meta property="og:site_name" content="UrantiaHub" />
      <meta property="og:url" content="https://www.urantiahub.com" />
      <meta
        property="og:image"
        content="https://www.urantiahub.com/sharing.png"
      />

      {/* Viewport Meta Tag */}
      <meta
        name="viewport"
        content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover"
      />
    </Head>
  );
};

export default HeadTag;
