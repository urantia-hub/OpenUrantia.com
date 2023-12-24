// Node modules.
import { useState } from "react";
import Link from "next/link";
// Relative modules.
import Modal from "@/components/Modal";
import Spinner from "@/components/Spinner";

const constructShareUrl = (node: UBNode) => {
  // Replace this with actual URL construction logic
  return `${process.env.NEXT_PUBLIC_OPEN_URANTIA_API_HOST}/papers/${node.paperId}#${node.globalId}`;
};

type ShareProps = {
  onClose?: () => void;
  node?: UBNode;
};

const Share = ({ onClose, node }: ShareProps) => {
  // State.
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

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
                    navigator.clipboard.writeText(shareUrl);
                    setCopiedLink(true);
                  }}
                  type="button"
                >
                  {copiedLink ? "Copied!" : "Copy Link"}
                </button>
              </div>
            </>
          )}
        </div>
      </>
    </Modal>
  );
};

export default Share;
