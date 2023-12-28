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
  const shareText = node ? `${node.text}\n` : "";

  return (
    <Modal onClose={onClose}>
      <>
        <div className="flex flex-col p-4">
          <h2 className="text-2xl mb-2">Where to?</h2>
          {!node && <Spinner />}
          {node && (
            <>
              <div className="border-l-2 pl-4 border-gray-500 my-2 py-1 leading-relaxed-7">
                <p className="text-gray-500 text-sm mb-1">
                  {node?.globalId?.split(":")[1]}
                </p>{" "}
                <p
                  className="text-gray-400"
                  dangerouslySetInnerHTML={{ __html: node?.htmlText as string }}
                />
              </div>
              <div className="flex justify-center my-3">
                <Link
                  className="bg-white text-black py-1.5 px-4 mr-4 shadow-lg hover:bg-gray-400 transition duration-300 ease-in-out rounded-full"
                  href={`https://x.com/intent/tweet?text=${encodeURIComponent(
                    shareText
                  )}&url=${encodeURIComponent(shareUrl)}`}
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  Share on X (Twitter)
                </Link>
                <Link
                  className="bg-white text-black py-1.5 px-4 mr-4 shadow-lg hover:bg-gray-400 transition duration-300 ease-in-out rounded-full"
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    shareUrl
                  )}`}
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  Share on Facebook
                </Link>
                <button
                  className="bg-white text-black py-1.5 px-4 shadow-lg hover:bg-gray-400 transition duration-300 ease-in-out rounded-full"
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
