// Node modules.
import { useState } from "react";
// Relative modules.
import Modal from "@/components/Modal";
import Spinner from "./Spinner";
import { renderLeadingText } from "@/utils/renderNode";

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
      setError(
        `Notes currently only support up to ${CHAR_LIMIT} characters, but you entered ${text.length} characters.`
      );
      return;
    }

    if (text.trim().length === 0) {
      setError("Note cannot be empty.");
      return;
    }

    setCreating(true);
    setError("");

    try {
      // Make request to save note for user.
      await fetch(`/api/user/nodes/notes`, {
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
      <div className="flex flex-col px-3 py-2">
        <h2 className="text-2xl mb-4">
          Create a <span className="text-orange-600">Note</span>
        </h2>
        {!node && <Spinner />}
        {node && (
          <>
            {/* Leading text */}
            <div className="leading-relaxed border-l-4 border-gray-500 pl-3 mb-4 pb-1">
              <div className="flex items-center justify-between mb-2 text-gray-500 text-xs">
                <span>{renderLeadingText(node as UBNodeLeadingTextProps)}</span>
              </div>
              <div
                className="max-h-96 overflow-y-auto text-gray-500 text-xs isolated-quote"
                dangerouslySetInnerHTML={{
                  __html: node.htmlText as string,
                }}
              />
            </div>

            {/* Note form */}
            <form className="flex flex-col px-2 mb-2" onSubmit={onSubmit}>
              <textarea
                autoFocus
                className="focus:outline-none border-0 bg-zinc-900 rounded py-2 px-3 mb-4"
                onChange={(event: any) => setText(event.target.value)}
                placeholder="Type your note here..."
                value={text}
              />
              <div className="flex justify-center items-center">
                {error && <p className="text-rose-500">{error}</p>}
                <button
                  className="rounded px-4 text-sm mr-2 bg-gray-600 hover:bg-gray-700"
                  onClick={onClose}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className={`rounded px-4 text-sm ${
                    creating || text.trim().length === 0
                      ? "text-gray-400 bg-gray-600 cursor-not-allowed"
                      : "bg-orange-600 hover:bg-orange-700"
                  }`}
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
