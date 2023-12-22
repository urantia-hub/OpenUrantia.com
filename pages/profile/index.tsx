// Node modules.
import React, { useState, useEffect } from "react";
import Image from "next/image";
// Relative modules.
import HeadTag from "@/components/HeadTag";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { User } from "@prisma/client";
import Spinner from "@/components/Spinner";
import { useRouter } from "next/router";

const Profile = () => {
  // State to store user data
  const [userData, setUserData] = useState<User | null>(null);
  const router = useRouter();

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      const response = await fetch("/api/user");
      const user = await response.json();
      if (!user) {
        router.replace("/");
        return;
      }
      setUserData(user);
    };

    void fetchUserData();
  }, []);

  // Function to handle form submission
  const handleSubmit = async (event: any) => {
    event.preventDefault();
    // Implement the logic to update user data
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <HeadTag titlePrefix="Settings" />

      <Navbar />

      <main className="mt-28 flex-grow container mx-auto px-4 py-10">
        <section className="text-center space-y-6">
          <h1 className="text-3xl font-bold">Settings</h1>

          {userData?.image && (
            <Image
              alt="profile"
              height={50}
              src={userData.image as string}
              width={50}
            />
          )}

          {userData ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium">
                  Name
                </label>
                <input
                  className="mt-1 block w-full"
                  defaultValue={userData.name || ""}
                  id="name"
                  name="name"
                  type="text"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium">
                  Email
                </label>
                <input
                  className="mt-1 block w-full"
                  defaultValue={userData.email || ""}
                  id="email"
                  name="email"
                  type="email"
                />
              </div>
              {/* Add more fields as needed */}
              <button
                type="submit"
                className="bg-white text-black font-bold py-3 px-6 rounded-full shadow-lg hover:bg-gray-400 transition duration-300 ease-in-out"
              >
                Update Profile
              </button>
            </form>
          ) : (
            <Spinner />
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
