// Node modules.
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import moment from "moment";
// Relative modules.
import Footer from "@/components/Footer";
import HeadTag from "@/components/HeadTag";
import Navbar from "@/components/Navbar";
import Spinner from "@/components/Spinner";
import { toast } from "sonner";
import Link from "next/link";
import { paperIdToUrl } from "@/utils/paperFormatters";

interface CuratedQuote {
  id: string;
  globalId: string;
  paperId: string;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
  paragraphNode: {
    htmlText: string;
    standardReferenceId: string;
    paperTitle: string;
    partId: string;
    sectionTitle: string | null;
    text: string;
  };
  sentCount: number;
  totalUsers: number;
}

const CuratedQuotesAdmin = () => {
  // Hooks.
  const session = useSession();
  const [quotes, setQuotes] = useState<CuratedQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [standardReferenceId, setStandardReferenceId] = useState("");

  useEffect(() => {
    // Fetch user data if authenticated.
    if (session.status === "authenticated") {
      fetch("/api/user")
        .then((res) => res.json())
        .then((data) => {
          if (data.isAdmin) {
            fetchQuotes();
          } else {
            window.location.href = "/settings";
          }
        });
    }
    if (session.status === "unauthenticated") {
      window.location.href = "/";
    }
  }, [session.status]);

  const fetchQuotes = async () => {
    try {
      const response = await fetch("/api/admin/curated-quotes");
      const data = await response.json();
      setQuotes(data.data);
    } catch (error) {
      console.error("Error fetching quotes:", error);
      toast.error("Failed to fetch curated quotes");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!standardReferenceId.trim()) return;

    try {
      const response = await fetch("/api/admin/curated-quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ standardReferenceId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create quote");
      }

      toast.success("Quote created successfully");
      setStandardReferenceId("");
      fetchQuotes();
    } catch (error: any) {
      console.error("Error creating quote:", error);
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-100 text-gray-700 dark:bg-neutral-800 dark:text-white">
        <HeadTag titlePrefix="Admin - Curated Quotes" />
        <Navbar />
        <main className="mt-8 flex-grow container mx-auto px-4 my-4 max-w-3xl">
          <div className="flex justify-center items-center h-64">
            <Spinner />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 text-gray-700 dark:bg-neutral-800 dark:text-white">
      <HeadTag titlePrefix="Admin - Curated Quotes" />
      <Navbar />

      <main className="mt-8 flex-grow container mx-auto px-4 my-4 max-w-3xl paper-content">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-4xl dark:text-white font-bold">
            Manage Passages to be Sent
          </h1>
        </div>

        {/* Create new quote form */}
        <div className="mb-8 p-4 bg-white dark:bg-neutral-700 dark:border-zinc-700 rounded-lg">
          <h2 className="text-xl font-bold mb-4 dark:text-white">
            Add Passage to Queue
          </h2>
          <form onSubmit={handleCreateQuote} className="flex gap-4">
            <input
              type="text"
              value={standardReferenceId}
              onChange={(e) => setStandardReferenceId(e.target.value)}
              placeholder="Enter standard reference ID (e.g. 1:1.1)"
              className="flex-1 p-2 rounded border-none text-gray-600 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              className="px-4 py-2 bg-blue-500 border-none text-white rounded hover:bg-blue-600 transition-colors"
              type="submit"
            >
              Add
            </button>
          </form>
        </div>

        {/* Quotes list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quotes.map((quote) => {
            const cleanHtml = quote.paragraphNode?.htmlText?.replace(
              /\sclass="[^"]*"/g,
              ""
            );

            return (
              <div
                key={quote.id}
                className="relative flex flex-col items-start text-left px-6 pt-5 pb-10 bg-white dark:bg-neutral-700 rounded fade-in"
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      quote.sentAt
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    }`}
                  >
                    {quote.sentAt
                      ? `Sent ${moment(quote.sentAt).fromNow()} to ${
                          quote.sentCount
                        } / ${quote.totalUsers} users`
                      : "Not sent"}
                  </span>
                </div>

                {/* Paper Info */}
                <div className="flex flex-col w-full mb-2">
                  <div className="text-xs text-gray-400 flex items-center justify-between w-full">
                    {quote.paperId === "0" ? (
                      "Foreword"
                    ) : (
                      <>
                        <span>Paper {quote.paperId}</span>
                        <span>Part {quote.paragraphNode.partId}</span>
                      </>
                    )}
                  </div>
                  <h3 className="mt-1 text-sm font-bold leading-5 text-gray-600 dark:text-white">
                    {quote.paragraphNode.paperTitle}{" "}
                    <span className="text-xs text-gray-400 font-normal">
                      ({quote.paragraphNode.standardReferenceId})
                    </span>
                  </h3>
                  {quote.paragraphNode.sectionTitle && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {quote.paragraphNode.sectionTitle}
                    </p>
                  )}
                </div>

                {/* Quote Text */}
                <div className="flex-grow w-full overflow-hidden">
                  <Link
                    href={`/papers/${paperIdToUrl(quote.paperId)}#${
                      quote.globalId
                    }`}
                    className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors hover:no-underline"
                  >
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <div
                        className="line-clamp-5"
                        dangerouslySetInnerHTML={{ __html: cleanHtml }}
                      />
                      <span className="text-sm text-blue-400 absolute bottom-3 right-3">
                        Read more
                      </span>
                    </div>
                  </Link>
                </div>

                {/* Metadata */}
                <div className="absolute bottom-3 left-6 text-xs text-gray-400">
                  Created {moment(quote.createdAt).fromNow()}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CuratedQuotesAdmin;
