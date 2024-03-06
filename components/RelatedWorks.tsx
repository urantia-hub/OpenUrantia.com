// Node modules.
import Link from "next/link";
// Relative modules.
import Modal from "@/components/Modal";
import Todo from "@/components/Todo";
import Spinner from "./Spinner";

type RelatedWorksProps = {
  onClose?: () => void;
  node?: UBNode;
};

const RelatedWorks = ({ onClose, node }: RelatedWorksProps) => {
  return (
    <Modal onClose={onClose}>
      <>
        {/* <Todo /> */}
        <div className="flex flex-col p-4">
          <h2 className="text-2xl mb-2">Related works</h2>
          {!node && <Spinner />}
          {node && (
            <>
              <div className="border-l-2 pl-2 border-white font-thin my-2">
                <p className="text-gray-400 text-sm mb-1">{node?.globalId}</p>{" "}
                <p>{node?.htmlText}</p>
              </div>
              <ul className="flex flex-col list-disc pl-3.5 my-2">
                <li>
                  <Link href="/papers">
                    Plato: <em>Some work</em>
                  </Link>
                </li>
                <li>
                  <Link href="/papers">
                    Bible: <em>Another work</em>
                  </Link>
                </li>
                <li>
                  <Link href="/papers">
                    Immanuel Kant: <em>And another work</em>
                  </Link>
                </li>
              </ul>
            </>
          )}
        </div>
      </>
    </Modal>
  );
};

export default RelatedWorks;
