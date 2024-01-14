// Node modules.
import { useState } from "react";
// Relative modules.
import Modal from "@/components/Modal";
import Spinner from "./Spinner";

const CHAR_LIMIT = 1000;

type NoteProps = {
  onClose: () => void;
  node?: UBNode;
};

const Note = ({ onClose, node }: NoteProps) => {
  // Network states.
  const [creating, setCreating] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // State.
  const [text, setText] = useState<string>("");

  const onSubmit = async (event: any) => {
    event.preventDefault();

    // Escape early if we are already creating the note.
    if (creating) {
      return;
    }

    if (text.length > CHAR_LIMIT) {
      setError(`Notes currently only support up to ${CHAR_LIMIT} characters.`);
      return;
    }

    setCreating(true);
    setError("");

    try {
      // Make request to save note for user.
      const response = await fetch(`/api/user/nodes/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          globalId: node?.globalId,
          paperId: node?.paperId,
          paperSectionId: node?.paperSectionId,
          paperSectionParagraphId: node?.paperSectionParagraphId,
          text: text.trim(),
        }),
      });
      onClose();
    } catch (error: any) {
      console.log("Error attempting to save note:", error);
      setError(error.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      {/* <Todo /> */}
      <div className="flex flex-col p-4">
        <h2 className="text-2xl mb-2">Note</h2>
        {!node && <Spinner />}
        {node && (
          <>
            <div className="border-l-2 pl-4 border-gray-500 my-2 leading-relaxed-7">
              <p className="text-gray-500 text-sm mb-1">
                {node?.globalId?.split(":")[1]}
              </p>{" "}
              <p
                className="text-gray-400"
                dangerouslySetInnerHTML={{ __html: node?.htmlText as string }}
              />
            </div>
            <form className="flex flex-col mt-1 mb-4" onSubmit={onSubmit}>
              <textarea
                autoFocus
                className="h-80 mb-6 focus:outline-none border-0 p-0 text-lg"
                onChange={(event: any) => setText(event.target.value)}
                placeholder="Write a note..."
                rows={5}
                value={text}
              />
              <div className="flex justify-center items-center">
                {error && <p className="text-rose-500">{error}</p>}
                <button
                  className="bg-orange-600 text-white py-1 px-4 rounded-full shadow-lg hover:bg-orange-700 transition duration-300 ease-in-out w-fit"
                  disabled={creating}
                  type="submit"
                >
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </Modal>
  );
};

export default Note;
