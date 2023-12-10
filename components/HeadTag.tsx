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
      <link rel="icon" href="/logo.png" />
      <meta
        name="description"
        content={
          metaDescription ||
          "An open source version of The Urantia Book for generations to come."
        }
      />
    </Head>
  );
};

export default HeadTag;
