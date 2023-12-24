// Node modules.
import Link from "next/link";
import { useState, useEffect } from "react";
// Relative modules.
import { renderLeadingText } from "@/utils/renderNode";

interface SearchProps {
  onClose: () => void;
}

const Search = ({ onClose }: SearchProps) => {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [isWaiting, setIsWaiting] = useState<boolean>(false);

  // Debounce function to delay the API call
  useEffect(() => {
    setIsWaiting(true);

    const delayDebounceFn = setTimeout(() => {
      if (query) {
        search(query);
      } else {
        setResults([]);
      }
    }, 500); // 500 ms delay

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

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
      setResults(data.data.results);
      setHasSearched(true);
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

  return (
    <div className="fixed inset-0 flex flex-col items-center z-50 bg-black/95">
      {/* X button to close modal */}
      <button
        className="absolute top-4 right-8 text-white text-2xl font-bold border-0 bg-transparent focus:outline-none p-0"
        onClick={onClose}
        type="button"
      >
        x
      </button>

      {/* Search field + results */}
      <div className="flex flex-col items-center w-full h-full max-w-3xl px-8 py-6">
        <h1 className="text-4xl text-white font-bold mb-8 text-center">
          Search the Urantia Book
        </h1>
        <div className="relative flex items-center w-full mb-8 pb-2">
          <input
            autoFocus
            className="w-full bg-transparent border-b border-white/50 text-white text-xl focus:outline-none px-4"
            id="search"
            onChange={handleSearchInput}
            onKeyDown={handleKeyPress}
            placeholder="Search..."
            type="text"
            value={query}
          />
          {query.includes(" ") && results.length > 1 && (
            <p className="text-gray-600 text-xs ml-2 absolute right-0 -bottom-3">
              Use double quotes (&quot;Urantia Book&quot;) to search for exact
              phrases
            </p>
          )}
          <p className="text-gray-600 text-xs ml-2 absolute -left-2 -bottom-3">
            {deriveSearchStatus()}
          </p>
          {query && (
            <button
              className="absolute top-2 right-2 font-bold text-white text-2xl border-0 bg-transparent focus:outline-none p-1 text-sm"
              onClick={() => {
                setQuery("");
                document.getElementById("search")?.focus();
              }}
              type="button"
            >
              x
            </button>
          )}
        </div>

        {/* Results */}
        <div className="flex flex-col max-h-[calc(100vh-200px)] overflow-y-auto">
          {results?.map((result) => (
            <Link
              className="mb-6 text-left hover:no-underline"
              key={result.globalId}
              href={`/papers/${result.paperId}#${
                result.globalId
              }?q=${encodeURIComponent(query)}`}
              onClick={onClose}
            >
              <div className="leading-relaxed">
                <div className="flex flex-col block mb-1 text-gray-400 text-xs">
                  <span>{renderLeadingText(result)}</span>
                </div>
                <div
                  className="leading-tight max-h-96 overflow-y-auto"
                  dangerouslySetInnerHTML={{
                    __html: result._highlightResult.htmlText.value as string,
                  }}
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Search;
