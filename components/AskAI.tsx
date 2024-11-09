import { useState, useEffect } from "react";
import { useCompletion } from "ai/react";
import { X } from "lucide-react";
import Spinner from "./Spinner";

interface AskAIProps {
  selectedText?: string;
  isModalOpen: boolean;
  onClose?: () => void;
  node?: UBNode;
  nodes: UBNode[];
}

const AskAI = ({
  selectedText,
  isModalOpen,
  onClose,
  node,
  nodes,
}: AskAIProps) => {
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const getPrecedingContext = (currentNode: UBNode, allNodes: UBNode[]) => {
    const currentIndex = allNodes.findIndex(
      (n) => n.globalId === currentNode.globalId
    );
    if (currentIndex === -1) return [];

    let sectionStartIndex = currentIndex;
    while (
      sectionStartIndex > 0 &&
      allNodes[sectionStartIndex].type !== "section" &&
      allNodes[sectionStartIndex].type !== "paper"
    ) {
      sectionStartIndex--;
    }

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
            }),
          });

          const data = await res.json();
          if (data.text) {
            setResponse(data.text);
          } else {
            console.error("No text in response:", data);
          }
        } catch (error) {
          console.error("Error fetching explanation:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchExplanation();
  }, [isModalOpen, selectedText, node, nodes]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
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
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-120px)]">
          {/* Selected Text */}
          <div className="p-4 bg-slate-100 dark:bg-neutral-900 rounded-lg mb-4">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
              Text to Explain:
            </p>
            <p className="text-sm text-gray-900 dark:text-white">
              &quot;{selectedText}&quot;
            </p>
          </div>

          {/* AI Response */}
          <div className="space-y-4 pb-4 px-2">
            {loading ? (
              <Spinner />
            ) : response ? (
              <p className="whitespace-pre-wrap text-gray-900 dark:text-white">
                {response}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AskAI;
