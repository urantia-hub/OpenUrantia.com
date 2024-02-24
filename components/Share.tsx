// Node modules.
import { useState } from "react";
import Link from "next/link";
// Relative modules.
import Modal from "@/components/Modal";
import Spinner from "@/components/Spinner";
import { getStandardReferenceIdFromGlobalId } from "@/utils/node";
import { renderLeadingText } from "@/utils/renderNode";

const constructShareUrl = (node: UBNode) => {
  // Replace this with actual URL construction logic
  return `${process.env.NEXT_PUBLIC_OPEN_URANTIA_HOST}/papers/${node.paperId}#${node.globalId}`;
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
  const shareText = node
    ? `"${node.text?.trim()}"\n\nUrantia ${renderLeadingText(
        node as UBNodeLeadingTextProps
      )}\n`
    : "";

  return (
    <Modal onClose={onClose}>
      <>
        <div className="flex flex-col px-3 py-2">
          <h2 className="text-2xl mb-4">Share this Quote</h2>
          {!node && <Spinner />}
          {node && (
            <>
              <div className="leading-relaxed border-l-4 border-gray-500 pl-3 pb-1 mb-4">
                <div className="flex items-center justify-between mb-2 text-gray-500 text-xs">
                  <span>
                    {renderLeadingText(node as UBNodeLeadingTextProps)}
                  </span>
                </div>
                <div
                  className="max-h-96 overflow-y-auto text-white text-base isolated-quote"
                  dangerouslySetInnerHTML={{
                    __html: node.htmlText as string,
                  }}
                />
              </div>

              <div className="flex flex-col-reverse md:flex-row justify-center mb-2">
                <button
                  className="rounded px-4 text-sm mr-2 bg-gray-600 hover:bg-gray-700"
                  onClick={onClose}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="rounded px-4 text-sm mr-2 mb-3 md:mb-0 bg-gray-600 hover:bg-gray-700"
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    setCopiedLink(true);
                  }}
                  type="button"
                >
                  {copiedLink ? "Copied!" : "Copy Link"}
                </button>
                <Link
                  className="flex items-center justify-center rounded px-4 text-sm mr-2 mb-3 md:mb-0 hover:no-underline bg-blue-600 hover:bg-blue-700 py-2"
                  href={`https://x.com/intent/tweet?text=${encodeURIComponent(
                    shareText
                  )}&url=${encodeURIComponent(shareUrl)}`}
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  Share on X (Twitter)
                </Link>
                <Link
                  className="flex items-center justify-center rounded px-4 text-sm mr-2 mb-3 md:mb-0 hover:no-underline bg-blue-600 hover:bg-blue-700 py-2"
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    shareUrl
                  )}`}
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  Share on Facebook
                </Link>
              </div>
            </>
          )}
        </div>
      </>
    </Modal>
  );
};

export default Share;
