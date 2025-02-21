// Node modules.
import { XIcon } from "lucide-react";
import { useEffect } from "react";

type ModalProps = {
  children: React.ReactNode;
  onClose?: () => void;
  showNavigation?: boolean;
};

const Modal = ({ children, onClose }: ModalProps): JSX.Element => {
  // Close the modal when the user presses the escape key.
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (onClose) onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  useEffect(() => {
    // Prevent scrolling on background content.
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <aside className="fixed z-20 flex items-center justify-center top-0 left-0 right-0 bottom-0 p-4 h-full w-full">
      <div
        className="h-full w-full absolute bg-slate-200/50 dark:bg-zinc-900/50 backdrop-filter backdrop-blur-sm mix-blend-normal"
        onClick={onClose}
      />
      <div className="relative flex flex-col rounded max-h-full max-w-3xl w-full bg-white dark:bg-zinc-800 shadow-lg">
        {children}
        {onClose && (
          <button
            aria-label="Close modal"
            className="absolute top-4 right-4 dark:top-4 dark:right-4 text-lg bg-transparent border-0 dark:border-0 p-0 dark:p-0 m-0 focus:outline-none focus:dark:outline-none text-gray-400 dark:text-gray-400 hover:text-gray-600 hover:dark:text-white transition duration-300 ease-in-out"
            onClick={onClose}
          >
            <XIcon className="w-6 h-6" />
          </button>
        )}
      </div>
    </aside>
  );
};

export default Modal;
