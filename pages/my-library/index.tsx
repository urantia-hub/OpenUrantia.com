// Node modules.
import Link from "next/link";
import React, { useState, useEffect } from "react";
import moment from "moment";
import { Note, Bookmark, User } from "@prisma/client";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
// Relative modules.
import Footer from "@/components/Footer";
import HeadTag from "@/components/HeadTag";
import Navbar from "@/components/Navbar";
import Spinner from "@/components/Spinner";
import { renderLeadingText } from "@/utils/renderNode";

type Activity = UBNode &
  Bookmark &
  Note & { createdAt: string; noteText?: string };

const MyLibrary = () => {
  // Session.
  const { status } = useSession();

  // Router.
  const router = useRouter();

  // State.
  const [userData, setUserData] = useState<User | null>(null);
  const [nodes, setNodes] = useState<Activity[]>([]);
  const [fetchingUser, setFetchingUser] = useState(true);
  const [fetchingNodes, setFetchingNodes] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "note" | "bookmark">(
    "all"
  );
  const [sortBy, setSortBy] = useState<"updatedAt" | "globalId">("updatedAt");
  const [paperFilter, setPaperFilter] = useState<number | "all">("all");

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/user");
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setFetchingUser(false);
      }
    };

    if (status === "authenticated") {
      void fetchUserData();
      return;
    }
    if (status !== "loading") {
      window.location.href = "/";
      return;
    }
  }, [status]);

  useEffect(() => {
    if (status === "authenticated") {
      void fetchActivityData();
    }
  }, [filterType, sortBy, paperFilter, status]);

  const fetchActivityData = async () => {
    try {
      const queryParamsObj: any = {
        filterType,
        sortBy,
      };
      if (paperFilter !== "all") {
        queryParamsObj.paperId = paperFilter;
      }
      const queryParams = new URLSearchParams(queryParamsObj).toString();

      const response = await fetch(`/api/user/activity?${queryParams}`);
      const data = await response.json();

      setNodes(data);
    } catch (error) {
      console.error(error);
    } finally {
      setFetchingNodes(false);
    }
  };

  const renderNode = (node: Activity, index: number) => {
    switch (node.type) {
      case "note": {
        return (
          <Link
            className="mb-6 text-left hover:no-underline note"
            href={`/papers/${node.paperId}#${node.globalId}`}
            id={node.createdAt}
            key={index}
          >
            <div className="leading-relaxed border-l-4 border-gray-500 pl-3 mb-1 pb-1 hover:border-orange-600 transition duration-300 ease-in-out">
              <div className="flex items-center justify-between mb-1 text-gray-500 text-xs">
                <span>{renderLeadingText(node as UBNodeLeadingTextProps)}</span>
                <div className="labels flex flex-row items-center mb-2">
                  <span className="text-xs text-gray-500">
                    {moment(node.createdAt).fromNow()}
                  </span>
                  <span className="text-xs bg-orange-600 text-white font-bold py-1 px-2 rounded-full ml-2">
                    Note
                  </span>
                </div>
              </div>
              <div
                className="max-h-96 overflow-y-auto text-gray-500 text-xs"
                dangerouslySetInnerHTML={{
                  __html: node.htmlText as string,
                }}
              />
              <div className="note-text text-white pt-2 text-base">
                {node.noteText}
              </div>
            </div>
          </Link>
        );
      }
      case "bookmark": {
        return (
          <Link
            className="mb-6 text-left hover:no-underline bookmark"
            href={`/papers/${node.paperId}#${node.globalId}`}
            id={node.createdAt}
            key={index}
          >
            <div className="leading-relaxed border-l-4 border-gray-500 pl-3 mb-1 pb-1 hover:border-emerald-600 transition duration-300 ease-in-out">
              <div className="flex items-center justify-between mb-1 text-gray-500 text-xs">
                <span>{renderLeadingText(node as UBNodeLeadingTextProps)}</span>
                <div className="labels flex flex-row items-center mb-2">
                  <span className="text-xs text-gray-500">
                    {moment(node.createdAt).fromNow()}
                  </span>
                  <span className="text-xs bg-emerald-600 text-white font-bold py-1 px-2 rounded-full ml-2">
                    Bookmark
                  </span>
                </div>
              </div>
              <div
                className="max-h-96 overflow-y-auto text-white text-base"
                dangerouslySetInnerHTML={{
                  __html: node.htmlText as string,
                }}
              />
            </div>
          </Link>
        );
      }
      default: {
        console.error(`Unknown node type: ${node.type}`);
        return null;
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-800 text-white">
      <HeadTag
        metaDescription="Access your personal library on OpenUrantia, where you can view your bookmarks and comments from The Urantia Papers."
        titlePrefix="My Library"
      />

      <Navbar />

      <main className="mt-8 flex-grow container mx-auto px-4 my-4 max-w-3xl paper-content">
        {/* Navigation links for previous and next papers */}
        <div className="flex flex-col items-center mt-2 mb-4">
          <h1 className="text-3xl font-bold mb-8">My Library</h1>

          <div className="flex flex-col md:flex-row justify-between w-full mb-8">
            <div className="flex flex-col md:items-center md:flex-row">
              {/* Filters icon */}
              <svg
                className="w-6 h-6 text-gray-400 md:mr-1 mb-2 md:mb-0 hidden md:block"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
              <button
                className={`${
                  filterType === "all" ? "bg-zinc-600" : "bg-zinc-900"
                } border-0 text-center rounded-lg hover:no-underline transition-colors duration-300 ease-in-out px-4 mb-2 md:mb-0 mx-1 text-sm`}
                onClick={() => setFilterType("all")}
              >
                All
              </button>
              <button
                className={`${
                  filterType === "note" ? "bg-zinc-600" : "bg-zinc-900"
                } border-0 text-center rounded-lg hover:no-underline transition-colors duration-300 ease-in-out px-4 mb-2 md:mb-0 mx-1 text-sm`}
                onClick={() => setFilterType("note")}
              >
                Notes
              </button>
              <button
                className={`${
                  filterType === "bookmark" ? "bg-zinc-600" : "bg-zinc-900"
                } border-0 text-center rounded-lg hover:no-underline transition-colors duration-300 ease-in-out px-4 mb-2 md:mb-0 mx-1 text-sm`}
                onClick={() => setFilterType("bookmark")}
              >
                Bookmarks
              </button>
              <select
                className="bg-zinc-900 border-0 text-center rounded-lg hover:no-underline transition-colors duration-300 ease-in-out px-4 mb-2 md:mb-0 mx-1 text-sm select-style"
                onChange={(event) =>
                  setPaperFilter(
                    event.target.value === "all"
                      ? "all"
                      : parseInt(event.target.value)
                  )
                }
              >
                <option value="all">All Papers</option>
                {Array.from({ length: 197 }, (_, index) => (
                  <option key={index} value={index}>
                    {index === 0 ? "Foreword" : `Paper ${index}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col md:flex-row md:flex-end">
              <select
                className="bg-zinc-900 border-0 text-center rounded-lg hover:no-underline transition-colors duration-300 ease-in-out px-4 mx-1 text-sm select-style"
                onChange={(event) =>
                  setSortBy(event.target.value as "updatedAt" | "globalId")
                }
              >
                <option value="updatedAt">Most Recent</option>
                <option value="globalId">Sequentially</option>
              </select>
            </div>
          </div>

          {/* Loading */}
          {(fetchingUser || fetchingNodes) && <Spinner />}

          {/* Activity nodes */}
          {nodes.length && !fetchingNodes ? (
            <div className="flex flex-col">
              {nodes?.map((node, index) => renderNode(node, index))}
            </div>
          ) : null}

          {/* No activity nodes */}
          {!nodes.length && !fetchingNodes ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-gray-400 mb-8">
                No {filterType === "all" ? "activitie" : filterType}s found
              </p>
              <button
                className="bg-white text-black font-bold py-3 px-6 rounded-full shadow-lg hover:bg-blue-100 transition duration-300 ease-in-out"
                onClick={() => router.push("/papers")}
              >
                Find a paper to read
              </button>
            </div>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyLibrary;
