// Node modules.
import { useState } from "react";
// Relative modules.
import Modal from "@/components/Modal";
import { signOut } from "next-auth/react";

type ShareProps = {
  onClose?: () => void;
  node?: UBNode;
};

const DeleteUser = ({ onClose }: ShareProps) => {
  // State.
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [confirmText, setConfirmText] = useState<string>("");

  // Handlers.
  const handleDelete = async () => {
    if (confirmText !== "DELETE") {
      return;
    }

    if (isDeleting) {
      return;
    }

    setIsDeleting(true);

    // Delete user in the backend.
    await fetch("/api/user", {
      method: "DELETE",
    });

    // Sign out.
    await signOut({ callbackUrl: "/" });
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col px-4 py-3">
        <h2 className="text-2xl mb-2">Are you sure?</h2>
        <p className="text-gray-400 mb-4">
          This action is irreversible. Your account will be deleted immediately
          and all of your progress will be lost. Type{" "}
          <code className="text-gray-600 dark:text-white font-bold dark:font-base dark:text-sm">
            DELETE
          </code>{" "}
          below to confirm.
        </p>

        <input
          autoFocus
          className="text-sm focus:outline-none focus:dark:outline-none border-0 dark:border-0 bg-slate-200 text-gray-600 dark:bg-zinc-900 dark:text-white rounded py-2 px-3 dark:py-2 dark:px-3 mb-4"
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="Type DELETE to confirm"
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
              confirmText !== "DELETE" || isDeleting
                ? "bg-red-200 hover:bg-red-200 dark:bg-red-950 hover:dark:bg-red-950 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600 dark:bg-red-800 hover:dark:bg-red-900"
            }`}
            disabled={confirmText !== "DELETE" || isDeleting}
            onClick={handleDelete}
            type="button"
          >
            {isDeleting ? "Deleting..." : "Delete Account"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteUser;
