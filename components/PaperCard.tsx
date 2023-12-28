// Node modules.
import Link from "next/link";
import { forwardRef } from "react";

const PaperCard = forwardRef<
  HTMLDivElement,
  {
    firstUnreadGlobalId?: string;
    isNextRead: boolean;
    paperId: string;
    paperTitle: string;
    progress: number;
  }
>(({ firstUnreadGlobalId, isNextRead, paperId, paperTitle, progress }, ref) => {
  const isCompleted = progress === 100;
  const isNotStarted = progress === 0;

  // Classes for progress bar color and completion
  const progressClasses = isNotStarted
    ? "bg-zinc-600"
    : isCompleted
    ? "bg-gradient-to-r from-purple-400 via-pink-500 to-red-500"
    : "bg-blue-400";
  const completedClasses = isCompleted
    ? "bg-gradient-to-r from-purple-400 via-pink-500 to-red-500"
    : "bg-zinc-700";

  // Classes for next read card
  const nextReadClasses = isNextRead ? "border-4 border-blue-400" : "";

  return (
    <div
      className={`p-4 w-full md:w-1/2 lg:w-1/3 xl:w-1/4`}
      ref={isNextRead ? ref : null}
    >
      <Link
        className={`flex flex-col items-center bg-zinc-900 p-4 rounded-lg space-y-3 h-full shadow-md ${nextReadClasses} hover:no-underline`}
        href={`/papers/${paperId}${
          progress > 0 ? `#${firstUnreadGlobalId}` : ""
        }`}
      >
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white ${completedClasses}`}
        >
          {paperId}
        </div>
        <h2 className="text-white text-sm">
          {paperTitle}
          {progress < 100 ? ` (${progress.toFixed(0)}%)` : ""}
        </h2>
        <div className="w-full bg-zinc-700 rounded-full h-2.5 dark:bg-zinc-700 relative">
          <div
            className={`absolute h-2.5 rounded-full ${progressClasses}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        {isNextRead && (
          <div className="text-blue-400 text-xs">Continue Reading</div>
        )}
        {isCompleted && <div className="text-green-400 text-xs">Completed</div>}
      </Link>
    </div>
  );
});

// Set a displayName on the forwardRef component.
PaperCard.displayName = "PaperCard";

export default PaperCard;
