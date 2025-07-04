import { useState, useEffect } from "react";
import { X, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";

import Spinner from "./Spinner";

interface AskAIProps {
  selectedText?: string;
  isModalOpen: boolean;
  onClose?: () => void;
  node?: UBNode;
  nodes: UBNode[];
}

const loadingMessages = [
  "Reviewing the text...",
  "Making comparisons...",
  "Getting more context...",
  "Analyzing patterns...",
  "Considering interpretations...",
];

const AskAI = ({
  selectedText,
  isModalOpen,
  onClose,
  node,
  nodes,
}: AskAIProps) => {
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
  const [messageOpacity, setMessageOpacity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const getPrecedingContext = (currentNode: UBNode, allNodes: UBNode[]) => {
    // Find the index of the current node
    const currentIndex = allNodes.findIndex(
      (n) => n.globalId === currentNode.globalId
    );
    if (currentIndex === -1) return [];

    // Walk backwards until we hit a section or paper node
    let sectionStartIndex = currentIndex;
    while (
      sectionStartIndex > 0 &&
      allNodes[sectionStartIndex].type !== "section" &&
      allNodes[sectionStartIndex].type !== "paper"
    ) {
      sectionStartIndex--;
    }

    // Return all paragraphs between the section start and current node
    return allNodes
      .slice(sectionStartIndex, currentIndex)
      .filter((n) => n.type === "paragraph")
      .map((n) => n.text);
  };

  const getStructuralContext = (allNodes: UBNode[]) => {
    const paperNode = allNodes.find((n) => n.type === "paper");
    const sectionNodes = allNodes.filter((n) => n.type === "section");

    return {
      paperTitle: paperNode?.paperTitle || "Unknown",
      paperId: paperNode?.paperId || "Unknown",
      sections: sectionNodes.map((n) => n.sectionTitle).filter(Boolean),
    };
  };

  useEffect(() => {
    const fetchExplanation = async () => {
      if (isModalOpen && selectedText && node) {
        setLoading(true);
        setResponse("");
        setError(null);

        const precedingParagraphs = getPrecedingContext(node, nodes);
        const { paperTitle, paperId, sections } = getStructuralContext(nodes);

        const prompt = `Please explain this passage from the Urantia Papers:

"${selectedText}"

Context:
Paper ${paperId}: ${paperTitle}

Section Structure:
${sections.map((section, i) => `${i + 1}. ${section}`).join("\n")}

Preceding Paragraphs:
${precedingParagraphs.map((p, i) => `[${i + 1}] ${p}`).join("\n\n")}`;

        try {
          const res = await fetch("/api/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messages: [{ role: "user", content: prompt }],
              globalId: node.globalId,
              paperId: node.paperId,
            }),
          });

          const data = await res.json();
          if (data.text) {
            setResponse(data.text);
          } else {
            throw new Error("No text in response");
          }
        } catch (error) {
          console.error("Error fetching explanation:", error);
          setError(
            "We're having trouble reaching our servers. Please try again later."
          );
        } finally {
          setLoading(false);
        }
      }
    };

    fetchExplanation();
  }, [isModalOpen, selectedText, node, nodes]);

  useEffect(() => {
    let messageIndex = 0;
    let intervalId: NodeJS.Timeout;
    let fadeTimeoutId: NodeJS.Timeout;

    if (loading) {
      intervalId = setInterval(() => {
        setMessageOpacity(0);

        fadeTimeoutId = setTimeout(() => {
          messageIndex = (messageIndex + 1) % loadingMessages.length;
          setLoadingMessage(loadingMessages[messageIndex]);
          setMessageOpacity(1);
        }, 300);
      }, 4000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (fadeTimeoutId) clearTimeout(fadeTimeoutId);
    };
  }, [loading]);

  // Add escape key handler
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && onClose) {
        onClose();
      }
    };

    if (isModalOpen) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isModalOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  const copyToClipboard = async () => {
    if (response) {
      try {
        await navigator.clipboard.writeText(response);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy text: ", err);
      }
    }
  };

  if (!node || !selectedText || !isModalOpen) return null;

  const currentSection =
    nodes.find(
      (n) =>
        n.type === "section" &&
        nodes.indexOf(n) <= nodes.indexOf(node) &&
        nodes.indexOf(n) ===
          Math.max(
            ...nodes
              .filter(
                (s) =>
                  s.type === "section" &&
                  nodes.indexOf(s) <= nodes.indexOf(node)
              )
              .map((s) => nodes.indexOf(s))
          )
    )?.sectionTitle || "Introduction";

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white dark:bg-neutral-800 rounded-lg w-full max-w-3xl overflow-hidden shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-neutral-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Explanation
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {currentSection}
            </p>
          </div>
          <button
            onClick={onClose}
            className="bg-transparent border-none m-0 p-0 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto max-h-[calc(100vh-110px)] md:max-h-[calc(100vh-180px)]">
          {/* Selected Text */}
          <div className="p-4 bg-slate-100 dark:bg-neutral-900 rounded-lg mb-4">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
              Text to Explain:
            </p>
            <p className="text-sm text-gray-900 dark:text-white">
              &quot;{selectedText}&quot;
            </p>
          </div>

          {/* AI Response */}
          <div className="space-y-4 pb-4 px-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center">
                <Spinner className="m-0" />
                <p
                  className="m-0 text-gray-600 dark:text-gray-400 transition-opacity duration-300"
                  style={{ opacity: messageOpacity }}
                >
                  {loadingMessage}
                </p>
              </div>
            ) : error ? (
              <p className="text-sm mt-6 text-red-600 dark:text-red-400 text-center">
                {error}
              </p>
            ) : response ? (
              <div>
                <div className="flex flex-col items-center mb-2">
                  <ReactMarkdown className="text-sm whitespace-pre-wrap text-gray-900 dark:text-white">
                    {response}
                  </ReactMarkdown>
                  <div>
                    <button
                      onClick={copyToClipboard}
                      className="mt-4 flex items-center text-center justify-center py-2 px-3 border-0 dark:py-2 dark:px-3 dark:border-0 text-center rounded bg-blue-400 hover:bg-blue-500 dark:bg-blue-500 hover:dark:bg-blue-600 hover:no-underline transition-colors duration-300 ease-in-out"
                      title="Copy to clipboard"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AskAI;
