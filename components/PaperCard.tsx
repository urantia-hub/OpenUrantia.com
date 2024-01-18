// Node modules.
import Link from "next/link";
// Relative modules.
import { paperLabelsLookup } from "@/utils/paperLabels";

const PaperCard = ({
  nextGlobalId,
  paperId,
  paperTitle,
  progress,
}: {
  nextGlobalId?: string;
  paperId: string;
  paperTitle: string;
  progress: number;
}) => {
  const isCompleted = progress === 100;
  const isNotStarted = progress === 0;

  // Classes for progress bar color and completion
  const progressClasses = isNotStarted
    ? "bg-zinc-600"
    : isCompleted
    ? "bg-gradient-to-r from-purple-400 via-pink-500 to-red-500"
    : "bg-blue-400";

  return (
    <Link
      className="flex flex-col justify-between px-4 py-2 mb-2 bg-neutral-700 rounded hover:bg-neutral-600 transition-colors hover:no-underline"
      href={`/papers/${paperId}${
        progress > 0 && progress < 100 && !nextGlobalId?.endsWith("0.1")
          ? `#${nextGlobalId}`
          : ""
      }`}
    >
      <div className="flex flex-col">
        <span className="text-xs text-gray-400">Paper {paperId}</span>
        <h3 className="mt-1 text-lg font-bold mb-1">{paperTitle}</h3>
        <div className="flex flex-col">
          <div className="bg-zinc-600 rounded-full h-2.5 w-full relative mb-1">
            <div
              className={`absolute h-2.5 rounded-full ${progressClasses}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          {progress < 100 && (
            <div className="text-blue-400 text-xs">
              Continue Reading{" "}
              {progress < 100 ? ` (${progress.toFixed(0)}%)` : ""}
            </div>
          )}
          {isCompleted && (
            <div className="text-green-400 text-xs">Completed (100%)</div>
          )}
        </div>
      </div>
      <span
        className="mt-1 text-xs text-gray-400 truncate w-full"
        title={paperLabelsLookup[paperId as keyof typeof paperLabelsLookup]
          .sort()
          .join(" | ")}
      >
        {paperLabelsLookup[paperId as keyof typeof paperLabelsLookup]
          .sort()
          .join(" | ")}
      </span>
    </Link>
  );
};

export default PaperCard;
