// Node modules.
import { useState } from "react";
// Relative modules.
import Modal from "@/components/Modal";

type ShareProps = {
  onClose?: () => void;
  node?: UBNode;
};

const ResetProgress = ({ onClose }: ShareProps) => {
  // State.
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [confirmText, setConfirmText] = useState<string>("");

  // Handlers.
  const handleReset = async () => {
    if (confirmText !== "RESET") {
      return;
    }

    if (isResetting) {
      return;
    }

    setIsResetting(true);

    await fetch("/api/user/nodes/progress", {
      method: "DELETE",
    });

    setIsResetting(false);
    onClose?.();
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col px-4 py-3">
        <h2 className="text-2xl mb-2">Are you sure?</h2>
        <p className="text-gray-400 mb-4">
          This action is irreversible. Your reading progress will be fully reset
          and your last known position in the papers will be lost. Type{" "}
          <code className="text-gray-600 dark:text-white font-bold dark:font-base dark:text-sm">
            RESET
          </code>{" "}
          below to confirm.
        </p>

        <input
          autoFocus
          className="text-sm focus:outline-none focus:dark:outline-none border-0 dark:border-0 bg-slate-200 text-gray-600 dark:bg-zinc-900 dark:text-white rounded py-2 px-3 dark:py-2 dark:px-3 mb-4"
          onChange={(event) => setConfirmText(event.target.value)}
          placeholder="Type RESET to confirm"
          type="text"
          value={confirmText}
        />

        <div className="flex justify-center items-center">
          <button
            className="mb-2 md:mb-0 mr-0 md:mr-2 py-2 px-3 border-0 dark:py-2 dark:px-3 dark:border-0 text-center rounded bg-slate-200 hover:bg-slate-300 dark:bg-zinc-700 hover:dark:bg-zinc-700 hover:no-underline transition-colors duration-300 ease-in-out"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className={`mb-2 md:mb-0 mr-0 md:mr-2 py-2 px-3 border-0 dark:py-2 dark:px-3 dark:border-0 text-center rounded dark:bg-zinc-700 hover:dark:bg-zinc-700 hover:no-underline transition-colors duration-300 ease-in-out ${
              confirmText !== "RESET" || isResetting
                ? "bg-red-200 hover:bg-red-200 dark:bg-red-950 hover:dark:bg-red-950 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600 dark:bg-red-800 hover:dark:bg-red-900"
            }`}
            disabled={confirmText !== "RESET" || isResetting}
            onClick={handleReset}
            type="button"
          >
            {isResetting ? "Resetting..." : "Reset Progress"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ResetProgress;
