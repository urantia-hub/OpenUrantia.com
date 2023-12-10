// Node modules.
import Image from "next/image";
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

  return (
    <aside className="modal">
      <div className="background" onClick={onClose} />
      <div className="content border border-zinc-800">
        {children}
        {onClose && (
          <button
            className="absolute top-2 right-2 bg-transparent border-none p-0 m-0 focus:outline-none text-gray-400 text-sm hover:text-white transition duration-300 ease-in-out"
            onClick={onClose}
          >
            ⓧ
          </button>
        )}
      </div>
    </aside>
  );
};

export default Modal;
