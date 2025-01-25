const ToggleSwitch = ({ enabled, loading, onClick, disabled = false }: any) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    className={`
      relative inline-flex h-7 w-12 items-center rounded-full border-none
      transition-colors duration-200 ease-in-out focus:outline-none
      ${
        enabled
          ? "bg-blue-400 dark:bg-blue-500"
          : "bg-gray-200 dark:bg-zinc-600"
      }
      ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
    `}
  >
    <span
      className={`
        ${enabled ? "translate-x-4" : "-translate-x-1"}
        inline-block h-5 w-5 transform rounded-full bg-white shadow-md
        transition duration-200 ease-in-out
      `}
    />
  </button>
);

export default ToggleSwitch;
