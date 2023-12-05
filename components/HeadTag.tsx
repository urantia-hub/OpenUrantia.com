import Head from "next/head";

type HeadTagProps = {
  metaDescription?: string;
  titlePrefix?: string;
};

const HeadTag = ({ metaDescription, titlePrefix }: HeadTagProps) => {
  return (
    <Head>
      <title>{titlePrefix ? `${titlePrefix} | ` : ""}OpenUrantia</title>
      <link rel="icon" href="/logo.png" />
      <meta
        name="description"
        content={
          metaDescription ||
          "A free and open source version of The Urantia Book."
        }
      />
    </Head>
  );
};

export default HeadTag;
