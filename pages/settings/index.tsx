// Node modules.
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
// Relative modules.
import Footer from "@/components/Footer";
import HeadTag from "@/components/HeadTag";
import Navbar from "@/components/Navbar";

const Settings = () => {
  // Hooks.
  const { status } = useSession();

  // State.
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] =
    useState<boolean>(false);

  useEffect(() => {
    // Fetch user data when the component mounts
    if (status === "authenticated") {
      fetch("/api/user")
        .then((res) => res.json())
        .then((data) => {
          setEmailNotificationsEnabled(data.emailNotificationsEnabled);
        });
    }
    if (status === "unauthenticated") {
      window.location.href = "/";
    }
  }, [status]);

  const handleToggleNotifications = async () => {
    setIsUpdating(true);

    const updatedStatus = !emailNotificationsEnabled;

    // Update user settings in the backend
    await fetch("/api/user", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ emailNotificationsEnabled: updatedStatus }),
    });

    setEmailNotificationsEnabled(updatedStatus);
    setIsUpdating(false);
  };

  const deriveNotificationStatus = () => {
    if (isUpdating) {
      return "...";
    }

    if (emailNotificationsEnabled) {
      return "Enabled";
    }

    return "Disabled";
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-800 text-white">
      <HeadTag titlePrefix="Settings" />

      <Navbar />

      <main className="mt-8 flex-grow container mx-auto px-4 my-4 max-w-3xl paper-content">
        <h1 className="text-2xl md:text-4xl text-white font-bold mb-8 text-center">
          Settings
        </h1>
        <div className="flex flex-col w-full">
          {status === "authenticated" && (
            <button
              className="border-0 text-center text-lg w-full p-3 rounded-lg bg-zinc-900 hover:bg-zinc-950 hover:no-underline transition-colors duration-300 ease-in-out mb-4"
              onClick={handleToggleNotifications}
              type="button"
            >
              Email Notifications Are {deriveNotificationStatus()}
            </button>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Settings;
