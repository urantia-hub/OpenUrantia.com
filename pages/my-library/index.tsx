// Node modules.
import Link from "next/link";
import React, { useState, useEffect } from "react";
import moment from "moment";
import { NodeComment, SavedNode, User } from "@prisma/client";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
// Relative modules.
import Footer from "@/components/Footer";
import HeadTag from "@/components/HeadTag";
import Navbar from "@/components/Navbar";
import Spinner from "@/components/Spinner";
import { renderLeadingText } from "@/utils/renderNode";

type Activity = UBNode &
  SavedNode &
  NodeComment & { createdAt: string; commentText?: string };

const MyLibrary = () => {
  // Session.
  const { data: session } = useSession();

  // Router.
  const router = useRouter();

  // State.
  const [userData, setUserData] = useState<User | null>(null);
  const [nodes, setNodes] = useState<Activity[]>([]);
  const [fetchingUser, setFetchingUser] = useState(true);
  const [fetchingNodes, setFetchingNodes] = useState(true);

  // Redirect to homepage if not logged in.
  useEffect(() => {
    if (!session) {
      window.location.href = "/";
    }
  }, [session]);

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

    const fetchActivityData = async () => {
      try {
        const response = await fetch("/api/user/activity");
        const data = await response.json();
        setNodes(data);
      } catch (error) {
        console.error(error);
      } finally {
        setFetchingNodes(false);
      }
    };

    void fetchUserData();
    void fetchActivityData();
  }, []);

  const renderNode = (node: Activity) => {
    switch (node.type) {
      case "nodeComment": {
        return (
          <Link
            className="mb-6 text-left hover:no-underline"
            href={`/papers/${node.paperId}#${node.globalId}`}
            id={node.createdAt}
            key={node.globalId}
          >
            <div className="leading-relaxed border-l-4 border-gray-500 pl-3 mb-1 pb-1 hover:border-orange-600 transition duration-300 ease-in-out">
              <div className="flex items-center justify-between mb-1 text-gray-500 text-xs">
                <span>{renderLeadingText(node as UBNodeLeadingTextProps)}</span>
                <div className="labels flex flex-row items-center mb-2">
                  <span className="text-xs text-gray-500">
                    {moment(node.createdAt).fromNow()}
                  </span>
                  <span className="text-xs bg-orange-600 text-white font-bold py-1 px-2 rounded-full ml-2">
                    Comment
                  </span>
                </div>
              </div>
              <div
                className="max-h-96 overflow-y-auto text-gray-500 text-sm"
                dangerouslySetInnerHTML={{
                  __html: node.htmlText as string,
                }}
              />
              <div className="comment-text text-white pt-2">
                {node.commentText}
              </div>
            </div>
          </Link>
        );
      }
      case "savedNode": {
        return (
          <Link
            className="mb-6 text-left hover:no-underline"
            href={`/papers/${node.paperId}#${node.globalId}`}
            id={node.createdAt}
            key={node.globalId}
          >
            <div className="leading-relaxed border-l-4 border-gray-500 pl-3 mb-1 pb-1 hover:border-emerald-600 transition duration-300 ease-in-out">
              <div className="flex items-center justify-between mb-1 text-gray-500 text-xs">
                <span>{renderLeadingText(node as UBNodeLeadingTextProps)}</span>
                <div className="labels flex flex-row items-center mb-2">
                  <span className="text-xs text-gray-500">
                    {moment(node.createdAt).fromNow()}
                  </span>
                  <span className="text-xs bg-emerald-600 text-white font-bold py-1 px-2 rounded-full ml-2">
                    Saved Quote
                  </span>
                </div>
              </div>
              <div
                className="max-h-96 overflow-y-auto text-white text-sm"
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
      <HeadTag titlePrefix="My Library" />

      <Navbar />

      <main className="mt-8 flex-grow container mx-auto px-4 my-4 max-w-3xl paper-content">
        {/* Navigation links for previous and next papers */}
        <div className="flex flex-col items-center mt-2 mb-4">
          <h1 className="text-3xl font-bold mb-8">My Library</h1>
          {/* Loading */}
          {(fetchingUser || fetchingNodes) && <Spinner />}

          {/* Activity nodes */}
          {nodes.length && !fetchingNodes ? (
            <div className="flex flex-col">
              {nodes?.map((node) => renderNode(node))}
            </div>
          ) : null}

          {/* No activity nodes */}
          {!nodes.length && !fetchingNodes ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-gray-400 mb-8">
                You haven&apos;t favorited any quotes yet.
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
