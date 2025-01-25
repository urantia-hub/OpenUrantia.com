// Node modules.
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
// Relative modules.
import DeleteUser from "@/components/DeleteUser";
import Footer from "@/components/Footer";
import HeadTag from "@/components/HeadTag";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ResetProgress from "@/components/ResetProgress";
import Spinner from "@/components/Spinner";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import ToggleSwitch from "@/components/ToggleSwitch";

const Settings = () => {
  // Hooks.
  const session = useSession();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Delete user state.
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  // Reset progress state.
  const [isResetProgressModalOpen, setIsResetProgressModalOpen] =
    useState<boolean>(false);

  // Email notification states
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] =
    useState<boolean>(false);
  const [emailDailyQuoteEnabled, setEmailDailyQuoteEnabled] =
    useState<boolean>(false);
  const [emailContinueReadingEnabled, setEmailContinueReadingEnabled] =
    useState<boolean>(false);
  const [emailChangelogEnabled, setEmailChangelogEnabled] =
    useState<boolean>(false);

  // Theme state.
  const [theme, setTheme] = useState<"system" | "dark" | "light">("system");

  useEffect(() => {
    // Fetch user data if authenticated.
    if (session.status === "authenticated") {
      fetch("/api/user")
        .then((res) => res.json())
        .then((data) => {
          setEmailNotificationsEnabled(data.emailNotificationsEnabled);
          setEmailDailyQuoteEnabled(data.emailDailyQuoteEnabled);
          setEmailContinueReadingEnabled(data.emailContinueReadingEnabled);
          setEmailChangelogEnabled(data.emailChangelogEnabled);
          setTheme(data.theme);
          setIsAdmin(data.isAdmin || false);
        });
    }
    if (session.status === "unauthenticated") {
      window.location.href = "/";
    }
  }, [session.status]);

  const handleToggleNotifications = async (field: string) => {
    setIsUpdating(true);

    const updates: any = {};
    switch (field) {
      case "all":
        const newStatus = !emailNotificationsEnabled;
        updates.emailNotificationsEnabled = newStatus;
        updates.emailDailyQuoteEnabled = newStatus;
        updates.emailContinueReadingEnabled = newStatus;
        updates.emailChangelogEnabled = newStatus;
        break;
      case "dailyQuote":
        updates.emailDailyQuoteEnabled = !emailDailyQuoteEnabled;
        break;
      case "continueReading":
        updates.emailContinueReadingEnabled = !emailContinueReadingEnabled;
        break;
      case "changelog":
        updates.emailChangelogEnabled = !emailChangelogEnabled;
        break;
    }

    // Update user settings in the backend
    await fetch("/api/user", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    // Update local state
    if (updates.emailNotificationsEnabled !== undefined)
      setEmailNotificationsEnabled(updates.emailNotificationsEnabled);
    if (updates.emailDailyQuoteEnabled !== undefined)
      setEmailDailyQuoteEnabled(updates.emailDailyQuoteEnabled);
    if (updates.emailContinueReadingEnabled !== undefined)
      setEmailContinueReadingEnabled(updates.emailContinueReadingEnabled);
    if (updates.emailChangelogEnabled !== undefined)
      setEmailChangelogEnabled(updates.emailChangelogEnabled);

    setIsUpdating(false);
  };

  const deriveNotificationStatus = () => {
    if (session.status !== "authenticated") {
      return "...";
    }

    if (isUpdating) {
      return "...";
    }

    if (emailNotificationsEnabled) {
      return "Enabled";
    }

    return "Disabled";
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 text-gray-700 dark:bg-neutral-800 dark:text-white">
      <HeadTag
        metaDescription="Customize your UrantiaHub experience in Settings, tailoring the platform to suit your reading preferences and accessibility needs."
        titlePrefix="Settings"
      />

      <Navbar />

      {isDeleteModalOpen && (
        <DeleteUser onClose={() => setIsDeleteModalOpen(false)} />
      )}

      {isResetProgressModalOpen && (
        <ResetProgress onClose={() => setIsResetProgressModalOpen(false)} />
      )}

      <main className="mt-8 flex-grow container mx-auto px-4 my-4 max-w-3xl paper-content min-h-screen">
        <h1 className="text-2xl md:text-4xl dark:text-white font-bold mb-8 text-center">
          Settings
        </h1>

        <div className="flex flex-col w-full">
          {/* Loading */}
          {session.status === "loading" && (
            <div className="flex flex-col items-center justify-center mb-8">
              <p className="dark:text-white mb-4">Loading...</p>
              <Spinner style={{ margin: 0 }} />
            </div>
          )}

          {/* Authenticated */}
          {session.status === "authenticated" && (
            <>
              {/* Logged in user */}
              <p className="text-right text-gray-400 dark:text-gray-500 text-xs">
                Logged in as {session?.data?.user?.email}
              </p>

              {/* Personal */}
              <h2 className="text-xl md:text-2xl dark:text-white font-bold mb-4">
                Personal
              </h2>

              {/* Theme */}
              <div className="flex flex-col md:flex-row justify-end border border-gray-300 dark:border-zinc-700 rounded-lg p-4 mb-4">
                <div className="flex flex-col w-full justify-center text-base flex-1 mb-4 md:mb-0">
                  <h3 className="dark:text-white font-bold mb-1 mt-0">
                    Light / Dark Mode
                  </h3>
                  <p className="text-gray-500 dark:text-gray-300 text-sm">
                    Select the theme that suits your reading preferences.
                  </p>
                </div>
                <div className="flex flex-col justify-center flex-1">
                  <ThemeSwitcher className="border-0 dark:border-0 text-center rounded bg-white hover:bg-white text-gray-400 dark:bg-zinc-700 hover:dark:bg-zinc-700 hover:no-underline transition-colors duration-300 ease-in-out cursor-pointer" />
                </div>
              </div>

              {/* Email Notifications */}
              <div className="flex flex-col border border-gray-300 dark:border-zinc-700 rounded-lg p-6 mb-4">
                <div className="flex flex-col space-y-6">
                  {/* Main heading */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Email Notifications
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Manage your email preferences
                    </p>
                  </div>

                  {/* All notifications */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base text-gray-900 dark:text-white">
                        All notifications
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Control all email notifications
                      </p>
                    </div>
                    <ToggleSwitch
                      enabled={emailNotificationsEnabled}
                      loading={isUpdating}
                      onClick={() => handleToggleNotifications("all")}
                    />
                  </div>

                  {/* Daily Quotes */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base text-gray-900 dark:text-white">
                        Daily Quotes
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Receive daily inspirational quotes
                      </p>
                    </div>
                    <ToggleSwitch
                      enabled={emailDailyQuoteEnabled}
                      loading={isUpdating}
                      onClick={() => handleToggleNotifications("dailyQuote")}
                      disabled={!emailNotificationsEnabled}
                    />
                  </div>

                  {/* Continue Reading */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base text-gray-900 dark:text-white">
                        Continue Reading
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Get reminders to continue your reading
                      </p>
                    </div>
                    <ToggleSwitch
                      enabled={emailContinueReadingEnabled}
                      loading={isUpdating}
                      onClick={() =>
                        handleToggleNotifications("continueReading")
                      }
                      disabled={!emailNotificationsEnabled}
                    />
                  </div>

                  {/* Feature Updates */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base text-gray-900 dark:text-white">
                        Feature Updates
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Stay informed about new features
                      </p>
                    </div>
                    <ToggleSwitch
                      enabled={emailChangelogEnabled}
                      loading={isUpdating}
                      onClick={() => handleToggleNotifications("changelog")}
                      disabled={!emailNotificationsEnabled}
                    />
                  </div>
                </div>
              </div>

              {/* Interests */}
              <div className="flex flex-col md:flex-row justify-end border border-gray-300 dark:border-zinc-700 rounded-lg p-4 mb-4">
                <div className="flex flex-col w-full justify-center text-base flex-1 mb-4 md:mb-0">
                  <h3 className="dark:text-white font-bold mb-1 mt-0">
                    Your Interests
                  </h3>
                  <p className="text-gray-500 dark:text-gray-300 text-sm">
                    Update interests to get relevant recommendations.
                  </p>
                </div>
                <div className="flex flex-col justify-center flex-1">
                  <Link
                    className="border-0 dark:border-0 text-center rounded bg-white hover:bg-white text-gray-400 dark:text-white dark:bg-zinc-700 hover:dark:bg-zinc-700 hover:no-underline transition-colors duration-300 ease-in-out py-2 px-4"
                    href="/settings/interests"
                  >
                    Update Interests
                  </Link>
                </div>
              </div>

              {/* Danger Zone */}
              <h2 className="text-xl md:text-2xl dark:text-white font-bold mb-4 text-red-500">
                Danger Zone
              </h2>
              <div className="dark:bg-zinc-900 flex flex-col border border-red-600 dark:border-red-600 rounded-lg p-4 mb-4">
                {/* Reset Progress */}
                <div className="flex flex-col md:flex-row justify-end mb-6 md:mb-5">
                  <div className="flex flex-col w-full justify-center text-base flex-1 mb-4 md:mb-0">
                    <h3 className="dark:text-white font-bold mb-1 mt-0">
                      Reset Progress
                    </h3>
                    <p className="text-gray-500 dark:text-gray-300 text-sm">
                      Reset your reading progress and start over from the
                      beginning.
                    </p>
                  </div>
                  <div className="flex flex-col justify-center flex-1">
                    <button
                      className="border-0 dark:border-0 text-center rounded bg-red-500 text-white hover:bg-red-600 dark:bg-zinc-800 dark:text-red-500 hover:dark:bg-zinc-700 hover:no-underline transition-colors duration-300 ease-in-out"
                      onClick={() => setIsResetProgressModalOpen(true)}
                      type="button"
                    >
                      Reset Progress
                    </button>
                  </div>
                </div>

                <hr className="border-t border-gray-300 dark:border-zinc-600" />

                {/* Delete Account */}
                <div className="flex flex-col md:flex-row justify-end mt-4">
                  <div className="flex flex-col w-full justify-center text-base flex-1 mb-4 md:mb-0">
                    <h3 className="dark:text-white font-bold mb-1 mt-0">
                      Delete Account
                    </h3>
                    <p className="text-gray-500 dark:text-gray-300 text-sm">
                      Once you delete your account, there is no going back.
                      Please be certain.
                    </p>
                  </div>
                  <div className="flex flex-col justify-center flex-1">
                    <button
                      className="border-0 dark:border-0 text-center rounded bg-red-500 text-white hover:bg-red-600 dark:bg-zinc-800 dark:text-red-500 hover:dark:bg-zinc-700 hover:no-underline transition-colors duration-300 ease-in-out"
                      onClick={() => setIsDeleteModalOpen(true)}
                      type="button"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>

              {/* Add this before the Danger Zone section */}
              {isAdmin && (
                <>
                  <h2 className="text-xl md:text-2xl dark:text-white font-bold mb-4">
                    Admin
                  </h2>
                  <div className="flex flex-col md:flex-row justify-end border border-gray-300 dark:border-zinc-700 rounded-lg p-4 mb-4">
                    <div className="flex flex-col w-full justify-center text-base flex-1 mb-4 md:mb-0">
                      <h3 className="dark:text-white font-bold mb-1 mt-0">
                        Daily Quote Emails
                      </h3>
                      <p className="text-gray-500 dark:text-gray-300 text-sm">
                        Manage curated quotes for daily email campaigns.
                      </p>
                    </div>
                    <div className="flex flex-col justify-center flex-1">
                      <Link
                        className="border-0 dark:border-0 text-center rounded bg-white hover:bg-white text-gray-400 dark:text-white dark:bg-zinc-700 hover:dark:bg-zinc-700 hover:no-underline transition-colors duration-300 ease-in-out py-2 px-4"
                        href="/admin/curated-quotes"
                      >
                        Manage
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Settings;
