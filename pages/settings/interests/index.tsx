// Node modules.
import { Label, UserInterest } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
// Relative modules.
import Footer from "@/components/Footer";
import HeadTag from "@/components/HeadTag";
import Navbar from "@/components/Navbar";

const SettingsInterests = () => {
  // Hooks.
  const { status } = useSession();

  // State to hold available labels and selected labels
  const [availableLabels, setAvailableLabels] = useState<Label[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<Set<string>>(new Set());

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
    const response = await fetch("/api/user/interests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ interests: Array.from(selectedLabels) }),
    });
    if (response.ok) {
      // Redirect or show a success message
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-800 text-white">
      <HeadTag titlePrefix="My Interests" />

      <Navbar />

      <main className="mt-8 flex-grow container mx-auto px-4 my-4 max-w-3xl paper-content">
        <h1 className="text-2xl md:text-4xl text-white font-bold mb-8 text-center">
          What topics are you most interested in?
        </h1>
        <div className="flex flex-col w-full">
          {availableLabels.map((label) => (
            <div
              key={label.id}
              className="flex flex-row justify-between items-center py-2"
            >
              <span className="text-lg">{label.name}</span>
              <input
                type="checkbox"
                checked={selectedLabels.has(label.id)}
                onChange={() => toggleLabel(label.id)}
              />
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SettingsInterests;
