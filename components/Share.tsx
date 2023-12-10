// Node modules.
import Link from "next/link";
// Relative modules.
import Modal from "@/components/Modal";
import Todo from "@/components/Todo";
import Spinner from "./Spinner";

type ShareProps = {
  onClose?: () => void;
  node?: UBNode;
};

const Share = ({ onClose, node }: ShareProps) => {
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
              <div className="flex justify-between mt-4 mb-2">
                <Link
                  className="bg-white text-black py-1.5 px-4 shadow-lg hover:bg-gray-400 transition duration-300 ease-in-out"
                  href="https://www.x.com"
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  Share on X
                </Link>
                <Link
                  className="bg-white text-black py-1.5 px-4 shadow-lg hover:bg-gray-400 transition duration-300 ease-in-out"
                  href="https://www.facebook.com"
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  Share on Facebook
                </Link>
                <Link
                  className="bg-white text-black py-1.5 px-4 shadow-lg hover:bg-gray-400 transition duration-300 ease-in-out"
                  href="https://www.instagram.com"
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  Share on Instagram
                </Link>
                <Link
                  className="bg-white text-black py-1.5 px-4 shadow-lg hover:bg-gray-400 transition duration-300 ease-in-out"
                  href="https://www.whatsapp.com"
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  Share on WhatsApp
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
