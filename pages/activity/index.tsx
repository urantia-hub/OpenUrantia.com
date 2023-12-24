// Node modules.
import Link from "next/link";
import React, { useState, useEffect } from "react";
import moment from "moment";
import { useRouter } from "next/router";
// Relative modules.
import Footer from "@/components/Footer";
import HeadTag from "@/components/HeadTag";
import Navbar from "@/components/Navbar";
import Spinner from "@/components/Spinner";
import { SavedNode, User } from "@prisma/client";
import { renderLeadingText } from "@/utils/renderNode";

const Quotes = () => {
  // State.
  const [userData, setUserData] = useState<User | null>(null);
  const [nodes, setNodes] = useState<(UBNode & SavedNode)[]>([]);
  const [fetchingUser, setFetchingUser] = useState(true);
  const [fetchingNodes, setFetchingNodes] = useState(true);

  const router = useRouter();

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

    const fetchNodesData = async () => {
      try {
        const response = await fetch("/api/user/nodes");
        const data = await response.json();
        setNodes(data);
      } catch (error) {
        console.error(error);
      } finally {
        setFetchingNodes(false);
      }
    };

    void fetchUserData();
    void fetchNodesData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <HeadTag titlePrefix="Favorited Quotes" />

      <Navbar />

      <main className="mt-28 flex-grow container mx-auto px-4 my-4 max-w-3xl paper-content">
        {/* Navigation links for previous and next papers */}
        <div className="flex flex-col items-center mt-2 mb-4">
          <h1 className="text-3xl font-bold mb-8">Favorite Quotes</h1>

          {/* Loading */}
          {(fetchingUser || fetchingNodes) && <Spinner />}

          {nodes.length && !fetchingNodes ? (
            <div className="flex flex-col max-h-[calc(100vh-200px)] overflow-y-auto">
              {nodes?.map((node) => (
                <Link
                  className="mb-6 text-left hover:no-underline"
                  key={node.globalId}
                  href={`/papers/${node.paperId}#${node.globalId}`}
                >
                  <div className="leading-relaxed">
                    <div className="flex flex-col block mb-1 text-gray-400 text-xs">
                      <span>
                        {renderLeadingText(node as UBNodeLeadingTextProps)}
                      </span>
                      <span title={moment(node.createdAt).format("lll")}>
                        Saved {moment(node.createdAt).fromNow()}
                      </span>
                    </div>
                    <div
                      className="leading-tight max-h-96 overflow-y-auto"
                      dangerouslySetInnerHTML={{
                        __html: node.htmlText as string,
                      }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-gray-400 mb-8">
                You haven&apos;t favorited any quotes yet.
              </p>
              <button
                className="bg-white text-black font-bold py-3 px-6 rounded-full shadow-lg hover:bg-blue-100 transition duration-300 ease-in-out"
                onClick={() => router.push("/read")}
              >
                Find a paper to read
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Quotes;
