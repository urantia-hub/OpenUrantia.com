// Node modules.
import { useEffect, useState } from "react";
// Relative modules.
import Modal from "@/components/Modal";
import Todo from "@/components/Todo";
import Spinner from "./Spinner";

type RelatedWorksProps = {
  onClose?: () => void;
  node?: UBNode;
};

const RelatedWorks = ({ onClose, node }: RelatedWorksProps) => {
  // State.
  const [answer, setAnswer] = useState<string>("");

  // Network state.
  const [fetching, setFetching] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const fetchExplanation = async (globalId?: string) => {
    if (!globalId) {
      setError("Unable to find paragraph.");
      return;
    }

    if (fetching) {
      return;
    }

    setFetching(true);
    setError("");

    try {
      // Make request.
      console.log(`Asking AI about node ${globalId}`);
      await new Promise((resolve) => setTimeout(() => resolve(true), 1000));
      const newAnswer =
        "This is a test answer. This is a test answer. This is a test answer. This is a test answer. This is a test answer.";
      setAnswer(newAnswer);
    } catch (error: any) {
      console.log("Error fetching explanation for node", error);
      setError(error.message);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchExplanation(node?.globalId);
  }, []);

  return (
    <Modal onClose={onClose}>
      {/* <Todo /> */}
      <div className="flex flex-col p-4">
        <h2 className="text-2xl mb-2">AI Interpretation</h2>
        {!node && <Spinner />}
        {node && (
          <>
            <div className="border-l-2 pl-2 border-white font-thin my-2">
              <p className="text-gray-400 text-sm mb-1">{node?.globalId}</p>{" "}
              <p>{node?.htmlText}</p>
            </div>
            {answer ? (
              <div className="my-2">
                <span dangerouslySetInnerHTML={{ __html: answer }} />

                <div className="mt-8 flex flex-col text-center">
                  <p className="text-gray-400">Was this a helpful response?</p>
                  <div className="flex justify-center mt-4">
                    <button
                      className="bg-white text-black py-1.5 px-4 mr-2 rounded-full shadow-lg hover:bg-gray-400 transition duration-300 ease-in-out w-fit"
                      type="button"
                    >
                      Yes
                    </button>
                    <button
                      className="bg-white text-black py-1.5 px-4 rounded-full shadow-lg hover:bg-gray-400 transition duration-300 ease-in-out w-fit"
                      type="button"
                    >
                      No
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <p className="my-2 text-center">Asking for an explanation...</p>
                <Spinner style={{ margin: 0 }} />
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};

export default RelatedWorks;
