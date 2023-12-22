// Node modules.
import React, { useState, useEffect } from "react";
import Image from "next/image";
// Relative modules.
import HeadTag from "@/components/HeadTag";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SavedNode, User } from "@prisma/client";
import Spinner from "@/components/Spinner";
import { useRouter } from "next/router";

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

  console.log("nodes", nodes);

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <HeadTag titlePrefix="Favorited Quotes" />

      <Navbar />

      <main className="mt-28 flex-grow container mx-auto px-4 my-4 max-w-3xl paper-content">
        {/* Navigation links for previous and next papers */}
        <div className="flex justify-between mt-2 mb-4">
          <h1 className="text-3xl font-bold">Favorited Quotes</h1>
          {(fetchingUser || fetchingNodes) && <Spinner />}

          {nodes.length === 0 && !fetchingNodes && (
            <div className="mb-12">
              {nodes.map((node: UBNode & SavedNode) => renderNode(node))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Quotes;
