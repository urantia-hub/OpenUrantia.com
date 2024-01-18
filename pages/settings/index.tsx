// Node modules.
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
// Relative modules.
import DeleteUser from "@/components/DeleteUser";
import Footer from "@/components/Footer";
import HeadTag from "@/components/HeadTag";
import Navbar from "@/components/Navbar";

const Settings = () => {
  // Hooks.
  const { status } = useSession();

  // Delete user state.
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  // Email notification state.
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

      {isDeleteModalOpen && (
        <DeleteUser onClose={() => setIsDeleteModalOpen(false)} />
      )}

      <main className="mt-8 flex-grow container mx-auto px-4 my-4 max-w-3xl paper-content">
        <h1 className="text-2xl md:text-4xl text-white font-bold mb-8 text-center">
          Settings
        </h1>
        <div className="flex flex-col w-full">
          {/* Notifications */}
          {status === "authenticated" && (
            <>
              <h2 className="text-xl md:text-2xl text-white font-bold mb-4">
                Notifications
              </h2>
              <div className="flex flex-col md:flex-row justify-end border border-zinc-700 rounded-lg p-4 mb-4">
                <div className="flex flex-col w-full justify-center text-base flex-1 mb-4 md:mb-0">
                  <h3 className="text-white font-bold mb-1 mt-0">
                    Email Notifications
                  </h3>
                  <p className="text-gray-300 text-sm">
                    {emailNotificationsEnabled
                      ? "You will receive email notifications currently."
                      : "You will not receive email notifications currently."}
                  </p>
                </div>
                <div className="flex flex-col justify-center flex-1">
                  <button
                    className="border-0 text-center rounded-lg bg-zinc-700 hover:bg-zinc-700 hover:no-underline transition-colors duration-300 ease-in-out"
                    onClick={handleToggleNotifications}
                    type="button"
                  >
                    {deriveNotificationStatus()}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Danger Zone */}
          <h2 className="text-xl md:text-2xl text-white font-bold mb-4 text-red-500">
            Danger Zone
          </h2>
          <div className="bg-zinc-900 flex flex-col md:flex-row justify-end border border-red-600 rounded-lg p-4">
            <div className="flex flex-col w-full justify-center text-base flex-1 mb-4 md:mb-0">
              <h3 className="text-white font-bold mb-1 mt-0">Delete Account</h3>
              <p className="text-gray-300 text-sm">
                Once you delete your account, there is no going back. Please be
                certain.
              </p>
            </div>
            <div className="flex flex-col justify-center flex-1">
              <button
                className="border-0 text-center rounded-lg bg-zinc-800 text-red-500 hover:bg-zinc-700 hover:no-underline transition-colors duration-300 ease-in-out"
                onClick={() => setIsDeleteModalOpen(true)}
                type="button"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Settings;
