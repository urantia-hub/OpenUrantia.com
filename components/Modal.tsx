// Node modules.
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
    <aside className="modal">
      <div className="background" onClick={onClose} />
      <div className="content border border-zinc-800 rounded-md">
        {children}
        {onClose && (
          <button
            className="absolute top-4 right-4 text-lg bg-transparent border-none p-0 m-0 focus:outline-none text-gray-400 hover:text-white transition duration-300 ease-in-out"
            onClick={onClose}
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 122.878 122.88">
              <path d="M1.426 8.313a4.87 4.87 0 0 1 6.886-6.886l53.127 53.127 53.127-53.127a4.87 4.87 0 1 1 6.887 6.886L68.324 61.439l53.128 53.128a4.87 4.87 0 0 1-6.887 6.886L61.438 68.326 8.312 121.453a4.868 4.868 0 1 1-6.886-6.886l53.127-53.128L1.426 8.313z" />
            </svg>
          </button>
        )}
      </div>
    </aside>
  );
};

export default Modal;
