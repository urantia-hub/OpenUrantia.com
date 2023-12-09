// Node modules.
import React, { useState, useEffect } from "react";
// Relative modules.
import HeadTag from "@/components/HeadTag";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { User } from "@prisma/client";

const Profile = () => {
  // State to store user data
  const [userData, setUserData] = useState<User | null>(null);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      // Replace with your API endpoint
      const response = await fetch("/api/user");
      const data = await response.json();
      console.log("data", data);
      setUserData(data);
    };

    fetchUserData();
  }, []);

  // Function to handle form submission
  const handleSubmit = async (event: any) => {
    event.preventDefault();
    // Implement the logic to update user data
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <HeadTag titlePrefix="User Profile" />

      <Header />

      <main className="flex-grow container mx-auto px-4 py-10">
        <section className="text-center space-y-6">
          <h1 className="text-3xl font-bold">User Profile</h1>

          {userData ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  defaultValue={userData.name || ""}
                  className="mt-1 block w-full"
                  // Additional input styling here
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  defaultValue={userData.email || ""}
                  className="mt-1 block w-full"
                  // Additional input styling here
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
            <p>Loading...</p>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
