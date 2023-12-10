// Node modules.
import { useState } from "react";
// Relative modules.
import Modal from "@/components/Modal";
import Todo from "@/components/Todo";
import Spinner from "./Spinner";

const CHAR_LIMIT = 5000;

type CommentProps = {
  onClose: () => void;
  node?: UBNode;
};

const Comment = ({ onClose, node }: CommentProps) => {
  // Network states.
  const [creating, setCreating] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // State.
  const [text, setText] = useState<string>("");

  const onSubmit = async () => {
    // Escape early if we are already creating the comment.
    if (creating) {
      return;
    }

    if (text.length > CHAR_LIMIT) {
      setError(
        `Comments currently only support up to ${CHAR_LIMIT} characters.`
      );
      return;
    }

    setCreating(true);
    setError("");

    try {
      // Make request.
      console.log(`Saving comment for node ${node?.globalId} for user`);
      await new Promise((resolve) => setTimeout(() => resolve(true), 1000));
      onClose();
    } catch (error: any) {
      console.log("Error attempting to save comment:", error);
      setError(error.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <Todo />
      <div className="flex flex-col p-4">
        <h2 className="text-2xl mb-2">Make a note</h2>
        {!node && <Spinner />}
        {node && (
          <form className="flex flex-col my-4" onSubmit={onSubmit}>
            <textarea
              autoFocus
              className="h-80 mb-6 focus:outline-none"
              onChange={(event: any) => setText(event.target.value)}
              value={text}
            />
            <div className="flex justify-center items-center">
              {error && <p className="text-red-500">{error}</p>}
              <button
                className="bg-white text-black py-1.5 px-4 rounded-full shadow-lg hover:bg-gray-400 transition duration-300 ease-in-out w-fit"
                disabled={creating}
                type="submit"
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default Comment;
