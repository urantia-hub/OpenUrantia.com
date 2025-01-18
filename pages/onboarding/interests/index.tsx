// Node modules.
import { Label, UserInterest } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
// Relative modules.
import Footer from "@/components/Footer";
import HeadTag from "@/components/HeadTag";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { deriveReadLink } from "@/utils/readPaperLink";

const OnboardingInterests = () => {
  // Hooks.
  const { status } = useSession();

  // State to hold available labels and selected labels
  const [availableLabels, setAvailableLabels] = useState<Label[]>([]);
  const [saved, setSaved] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [selectedLabels, setSelectedLabels] = useState<Set<string>>(new Set());
  const [userInterests, setUserInterests] = useState<UserInterest[]>([]);

  // Fetch available labels when the component mounts
  useEffect(() => {
    fetch("/api/labels")
      .then((res) => res.json())
      .then((data) => {
        setAvailableLabels(data);
      });
  }, []);

  useEffect(() => {
    // Fetch user data when the component mounts
    if (status === "authenticated") {
      fetch("/api/user")
        .then((res) => res.json())
        .then((data) => {
          // Context: data.userInterests[0].label.papers[0].paperId
          const userInterests = data.userInterests.map(
            (interest: UserInterest) => {
              return interest.labelId;
            }
          );
          setSelectedLabels(new Set(userInterests));
          setUserInterests(data.userInterests);
        });
    }
    if (status === "unauthenticated") {
      window.location.href = "/";
    }
  }, [status]);

  // Handle label selection
  const toggleLabel = (labelId: string) => {
    const newSelection = new Set(selectedLabels);
    if (newSelection.has(labelId)) {
      newSelection.delete(labelId);
    } else {
      newSelection.add(labelId);
    }
    setSelectedLabels(newSelection);
  };

  // Save user interests
  const saveInterests = async () => {
    if (saving) return;
    setSaving(true);
    setSaved(false);

    try {
      const response = await fetch("/api/user/interests", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ interests: Array.from(selectedLabels) }),
      });
      if (response.ok) {
        setSaved(true);
        window.location.href = deriveReadLink(status);
      } else {
        console.error("Error saving interests");
        setSaved(false);
      }
    } catch (error) {
      console.error("Error saving interests", error);
      setSaved(false);
    }

    setSaving(false);
  };

  // New styles for the animated gradient
  const selectedGradient =
    "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient-x";

  // Check if the temp interests differs from the saved interests
  const hasToggledInterests =
    Array.from(selectedLabels).join() !==
    userInterests.map((interest) => interest.labelId).join();

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 text-gray-700 dark:bg-neutral-800 dark:text-white">
      <HeadTag
        metaDescription="Personalize your journey through The Urantia Papers on UrantiaHub by setting your interests, guiding your exploration and discovery."
        titlePrefix="My Interests"
      />

      <Navbar />

      {/* Save Interests Button */}
      {hasToggledInterests && !saved && (
        <aside
          className="z-10 fixed bottom-16 left-0 right-0 p-4 text-center bg-white dark:bg-neutral-800 border-t dark:border-neutral-700"
          style={{ bottom: "4.2rem" }}
        >
          <button
            className={`w-1/8 border-0 dark:border-0 rounded py-2 px-4 dark:py-2 dark:px-4 text-base ${
              saving
                ? "bg-gray-600 dark:bg-gray-600 cursor-not-allowed"
                : "bg-blue-400 hover:bg-blue-500 dark:bg-blue-500 hover:dark:bg-blue-600"
            }`}
            onClick={saveInterests}
            disabled={saving}
            type="button"
          >
            {saved ? "Saved!" : saving ? "Saving..." : "Save and Continue"}
          </button>
        </aside>
      )}

      <main className="mt-8 flex-grow container mx-auto px-4 my-4 max-w-4xl paper-content min-h-screen">
        <h1 className="text-2xl md:text-4xl dark:text-white font-bold mb-6 text-center">
          What topics are you most interested in?
        </h1>

        <p className="text-gray-400 text-center mb-8">
          Select the topics you are most interested in to personalize your
          journey through The Urantia Papers.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {availableLabels.map((label: Label) => (
            <button
              aria-label="Select label"
              className={`border-0 dark:border-0 relative flex flex-col justify-between px-3 py-2 dark:px-3 dark:py-2 rounded shadow-lg overflow-hidden ${
                selectedLabels.has(label.id)
                  ? selectedGradient
                  : "bg-white dark:bg-neutral-700"
              } transition-all duration-300 ease-in-out cursor-pointer text-left focus:outline-none focus:dark:outline-none`}
              onClick={() => toggleLabel(label.id)}
              key={label.id}
              type="button"
            >
              <h3
                className={`m-0 p-0 text-xl font-bold dark:text-white ${
                  selectedLabels.has(label.id) ? "text-white" : "text-gray-600"
                }`}
              >
                {label.name}
              </h3>

              <p
                className={`text-sm ${
                  selectedLabels.has(label.id)
                    ? "text-white dark:text-white"
                    : "text-gray-400 dark:text-gray-400"
                }`}
              >
                {label.description}
              </p>

              {selectedLabels.has(label.id) && (
                <span
                  className="absolute top-0 right-0 mt-2 mr-2"
                  title="Selected"
                >
                  <svg
                    className="w-4 h-4 fill-current fade-in"
                    viewBox="0 0 122.881 89.842"
                  >
                    <path d="M1.232 55.541a3.746 3.746 0 0 1 5.025-5.554L40.31 80.865l76.099-79.699a3.752 3.752 0 0 1 5.438 5.173L43.223 88.683l-.005-.005a3.746 3.746 0 0 1-5.227.196L1.232 55.541z" />
                  </svg>
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="text-center">
          {!selectedLabels.size ? (
            <>
              <button
                className="border-0 dark:border-0 text-white bg-blue-400 hover:bg-blue-500 dark:bg-neutral-700 hover:dark:bg-neutral-600 py-2 px-4 dark:py-2 dark:px-4 rounded shadow-lg font-bold"
                onClick={() => {
                  sessionStorage.setItem("skippedInterestsSelection", "true");
                  window.location.href = deriveReadLink(status);
                }}
              >
                Skip for Now
              </button>
              <p className="mt-4">
                You can always update your interests later in More &gt;
                Settings.
              </p>
            </>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OnboardingInterests;
