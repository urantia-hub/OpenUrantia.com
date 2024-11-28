// Node modules.
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
// Relative modules.
import { renderLeadingText } from "@/utils/renderNode";
import HeadTag from "@/components/HeadTag";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Spinner from "@/components/Spinner";
import { paperIdToUrl } from "@/utils/paperFormatters";

const Search = () => {
  // Router.
  const router = useRouter();

  // State.
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [isWaiting, setIsWaiting] = useState<boolean>(false);

  // On mount, set the query and search if there is a query.
  useEffect(() => {
    // Query params.
    const queryParams = new URLSearchParams(router.asPath.split(/\?/)[1]);
    const q = queryParams.get("q");
    if (q) {
      setQuery(q);
      search(q);
    }
  }, []);

  // Debounce function to delay the API call
  useEffect(() => {
    if (!query) {
      setResults([]);
      router.push(`/search`, undefined, {
        shallow: true,
      });
      return;
    }

    setIsWaiting(true);

    const delayDebounceFn = setTimeout(() => {
      if (query) {
        search(query);
      }
    }, 500); // 500 ms delay

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const search = async (searchQuery: string) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/urantia-book/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: searchQuery,
        }),
      });
      const data = await response.json();

      // Update the results.
      setResults(data.data.results);
      setHasSearched(true);

      // Update the query param in the URL.
      if (router.query.q !== searchQuery) {
        router.push(`/search?q=${encodeURIComponent(searchQuery)}`, undefined, {
          shallow: true,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      setIsWaiting(false);
    }
  };

  const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value.trimStart());
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && query) {
      search(query);
    }
  };

  const deriveSearchStatus = () => {
    if (!query) {
      return "";
    }

    if (!hasSearched) {
      return "";
    }

    if (isLoading) {
      return "Searching...";
    }

    if (results.length >= 1) {
      return `${results.length} result${results.length > 1 ? "s" : ""}`;
    }

    if (isWaiting) {
      return "";
    }

    return "Nothing found, try changing your search slightly";
  };

  const onClearSearch = () => {
    setQuery("");
    document.getElementById("search")?.focus();
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 text-gray-700 dark:bg-neutral-800 dark:text-white">
      <HeadTag
        metaDescription="Utilize UrantiaHub's search feature to find specific teachings, papers, or topics within The Urantia Papers, aiding your study and exploration."
        titlePrefix="Search"
      />

      <Navbar />

      <main className="mt-8 flex-grow container mx-auto px-4 my-4 max-w-3xl paper-content">
        <h1 className="text-2xl md:text-4xl dark:text-white font-bold mb-8 text-center">
          Search the Urantia Papers
        </h1>
        <div className="relative flex items-center w-full mb-8 pb-2">
          <input
            autoFocus
            className="w-full bg-white dark:bg-zinc-900 border-0 dark:border-0 text-gray-600 dark:text-white rounded focus:outline-none px-4 focus:shadow-lg transition duration-300 ease-in-out"
            id="search"
            onChange={handleSearchInput}
            onKeyDown={handleKeyPress}
            placeholder="Search..."
            type="text"
            value={query}
          />
          {query.includes(" ") && results.length > 1 && (
            <p className="text-gray-400 dark:text-gray-600 text-xs ml-2 absolute right-0 -bottom-3">
              Use double quotes (&quot;Urantia Papers&quot;) to search for exact
              phrases
            </p>
          )}
          <p className="text-gray-400 dark:text-gray-600 text-xs ml-2 absolute -left-2 -bottom-3">
            {deriveSearchStatus()}
          </p>
          {query && (
            <button
              aria-label="Clear search"
              className="absolute top-0.5 dark:-top-0.5 right-4 text-gray-400 dark:text-gray-400 text-xl border-0 dark:border-0 bg-transparent dark:bg-transparent focus:outline-none p-1 hover:text-gray-500 hover:dark:text-white transition-colors duration-200"
              onClick={onClearSearch}
              type="button"
            >
              &times;
            </button>
          )}
        </div>

        {isLoading && !results.length && (
          <div className="flex justify-center">
            <Spinner />
          </div>
        )}

        {/* Results */}
        <div className="flex flex-col">
          {results?.map((result) => (
            <Link
              aria-label="View paragraph in context"
              className="mb-6 text-left hover:no-underline isolated-quote"
              key={result.globalId}
              href={`/papers/${paperIdToUrl(`${result.paperId}`)}#${
                result.globalId
              }?q=${encodeURIComponent(query)}`}
            >
              <div className="leading-relaxed">
                <div className="flex flex-col block mb-1 text-gray-400 text-xs">
                  <span>{renderLeadingText(result)}</span>
                </div>
                <div
                  className="leading-tight max-h-96 overflow-y-auto text-gray-600 dark:text-white"
                  dangerouslySetInnerHTML={{
                    __html: result._highlightResult?.htmlText?.value as string,
                  }}
                />
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Search;
