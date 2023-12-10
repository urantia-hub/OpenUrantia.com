// Node modules.
import { useState } from "react";
import Link from "next/link";
// Relative modules.
import Modal from "@/components/Modal";
import Spinner from "@/components/Spinner";

const constructShareUrl = (node: UBNode) => {
  // Replace this with actual URL construction logic
  return `https://openurantia.com/papers/${node.paperId}#${node.globalId}`;
};

type ShareProps = {
  onClose?: () => void;
  node?: UBNode;
};

const Share = ({ onClose, node }: ShareProps) => {
  // State.
  const [copied, setCopied] = useState<boolean>(false);

  // Create links.
  const shareUrl = node ? constructShareUrl(node) : "";
  const shareText = node ? `Check out this content:\n\n${node.text}` : "";

  return (
    <Modal onClose={onClose}>
      <>
        {/* <Todo /> */}
        <div className="flex flex-col p-4">
          <h2 className="text-2xl mb-2">Where to?</h2>
          {!node && <Spinner />}
          {node && (
            <>
              <div className="border-l-2 pl-2 border-white font-thin my-2">
                <p className="text-gray-400 text-sm mb-1">{node?.globalId}</p>{" "}
                <p>{node?.htmlText}</p>
              </div>
              <div className="flex justify-center mt-4 mb-2">
                <Link
                  className="bg-white text-black py-1.5 px-4 mr-4 shadow-lg hover:bg-gray-400 transition duration-300 ease-in-out"
                  href={`https://x.com/intent/tweet?text=${encodeURIComponent(
                    shareText
                  )}&url=${encodeURIComponent(shareUrl)}`}
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  Share on X
                </Link>
                <Link
                  className="bg-white text-black py-1.5 px-4 mr-4 shadow-lg hover:bg-gray-400 transition duration-300 ease-in-out"
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    shareUrl
                  )}`}
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  Share on Facebook
                </Link>
                <button
                  className="bg-white text-black py-1.5 px-4 shadow-lg hover:bg-gray-400 transition duration-300 ease-in-out"
                  onClick={() => {
                    navigator.clipboard.writeText(node.text as string);
                    setCopied(true);
                  }}
                  type="button"
                >
                  {copied ? "Copied!" : "Copy Link"}
                </button>
              </div>
            </>
          )}
        </div>
      </>
    </Modal>
  );
};

export async function getStaticProps() {
  // Fetch data from your API
  const res = await fetch(
    `${process.env.URANTIA_DEV_API_HOST}/api/v1/urantia-book/toc`
  );
  const jsonData = await res.json();
  const partsData = jsonData.data.results;

  return {
    props: {
      partsData,
    },
  };
}

export default Share;
