// pages/timelines/index.tsx

import Link from "next/link";
import timelines from "@/data/timelines";

const TimelinesPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">
          Timelines
        </h1>
        <div className="grid gap-6 lg:grid-cols-2">
          {Object.entries(timelines).map(([key, timeline]) => (
            <div
              key={key}
              className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg"
            >
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-xl leading-6 font-medium text-gray-900 dark:text-white">
                  {timeline.title}
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-300">
                  {timeline.description}
                </p>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-4 sm:px-6">
                <Link
                  href={`/timelines/${key}`}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                >
                  View Timeline &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimelinesPage;
