import { NextPage } from "next";
import HeadTag from "@/components/HeadTag";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

const BlockchainArchive: NextPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-100 text-gray-700 dark:bg-neutral-800 dark:text-white">
      <HeadTag
        titlePrefix="Blockchain Archive"
        metaDescription="Preserving The Urantia Papers for future generations through blockchain technology"
      />

      <Navbar />

      <main className="mt-8 flex-grow container mx-auto px-4 my-4 max-w-3xl">
        <div className="mt-4 mb-12 text-center">
          <h1 className="text-5xl font-bold mb-8">Blockchain Archive</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Preserving truth for generations to come
          </p>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-neutral-700 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-700 dark:text-white">
              Why Archive The Urantia Papers?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Throughout history, humanity has repeatedly lost invaluable
              knowledge and wisdom. The burning of the Library of Alexandria,
              the destruction of ancient texts during wars, and the natural
              decay of physical documents have all contributed to the loss of
              our collective wisdom and history.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              When humanity receives revelatory information, we have a
              responsibility to preserve it using the best available methods of
              our time. Just as our ancestors carefully preserved spiritual
              works through oral traditions, handwritten scrolls, and eventually
              printed books, we now have the opportunity to use modern
              technology to ensure these teachings survive for future
              generations.
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-700 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-700 dark:text-white">
              Why Blockchain?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Blockchain technology offers unique advantages for long-term
              preservation:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 mb-4">
              <li>Immutability - Once stored, the content cannot be altered</li>
              <li>Decentralization - No single point of failure</li>
              <li>Permanence - Data persists as long as the network exists</li>
              <li>
                Global accessibility - Anyone can verify and access the original
                text
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-neutral-700 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-700 dark:text-white">
              Access the Archive
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We&apos;ve archived The Urantia Papers in multiple formats to
              ensure maximum compatibility and preservation:
            </p>
            <div className="space-y-4">
              <Link
                href="/blockchain-archive/urantia-papers/txt"
                className="block w-full p-4 bg-slate-50 dark:bg-neutral-600 rounded-lg hover:shadow-md transition-shadow duration-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-white font-medium">
                    Plain Text Format (TXT)
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-300">
                    →
                  </span>
                </div>
              </Link>
              <Link
                href="/blockchain-archive/urantia-papers/json"
                className="block w-full p-4 bg-slate-50 dark:bg-neutral-600 rounded-lg hover:shadow-md transition-shadow duration-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-white font-medium">
                    Structured Format (JSON)
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-300">
                    →
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlockchainArchive;
