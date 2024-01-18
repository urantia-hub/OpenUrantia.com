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
      <div className="flex flex-col p-4">
        <h2 className="text-2xl mb-6">Are you sure?</h2>
        <p className="text-gray-400 mb-6">
          This action is irreversible. Your reading progress will be fully reset
          and your last known position in the papers will be lost. Type{" "}
          <code className="text-white text-sm">RESET</code> below to confirm.
        </p>

        <input
          className="rounded-lg p-2 mb-6 text-sm"
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="RESET"
          type="text"
          value={confirmText}
        />

        <div className="flex flex-row justify-end">
          <button
            className="border-0 text-center w-full p-2 rounded-lg bg-red-900 hover:bg-red-950 hover:no-underline transition-colors duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-900"
            disabled={confirmText !== "RESET" || isResetting}
            onClick={handleReset}
            type="button"
          >
            {isResetting ? "Resetting..." : "Reset Progress"}
          </button>

          <button
            className="border-0 text-center w-full p-2 rounded-lg bg-neutral-900 hover:bg-neutral-950 hover:no-underline transition-colors duration-300 ease-in-out ml-4"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ResetProgress;
