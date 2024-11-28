// Node modules.
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
// Relative modules.
import Footer from "@/components/Footer";
import HeadTag from "@/components/HeadTag";
import HomepageNavbar from "@/components/HomepageNavbar";
import { deriveReadLink } from "@/utils/readPaperLink";
import ParticleBackground from "@/components/ParticleBackground";

const HomePage = () => {
  // Hooks.
  const { status } = useSession();

  // State.
  const [lastVisitedNode, setLastVisitedNode] =
    useState<LastVisitedNode | null>(null);
  const [showDownButton, setShowDownButton] = useState<boolean>(true);

  const fetchLastVisitedNode = async () => {
    try {
      const response = await fetch(`/api/user/nodes/last-visited`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setLastVisitedNode(data);
      localStorage.setItem("lastVisitedNode", JSON.stringify(data));
    } catch (error) {
      console.error(`Unable to fetch last visited node`, error);

      // Fallback to local storage.
      console.warn(`Falling back to local storage for last visited node`);
      const lastVisitedNode: LastVisitedNode = localStorage.getItem(
        "lastVisitedNode"
      )
        ? JSON.parse(localStorage.getItem("lastVisitedNode") as string)
        : null;
      setLastVisitedNode(lastVisitedNode);
    }
  };

  const onAuthenticated = async () => {
    await fetchLastVisitedNode();
    const response = await fetch(`/api/user/interests`);
    const data = await response.json();

    // Redirect to interests selection if user has no interests.
    if (
      data?.userInterests?.length === 0 &&
      !sessionStorage.getItem("redirectedToInterests") &&
      !sessionStorage.getItem("skippedInterestsSelection")
    ) {
      sessionStorage.setItem("redirectedToInterests", "true");
      window.location.href = "/onboarding/interests";
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      void onAuthenticated();
    }
    if (status === "unauthenticated") {
      const lastVisitedNode: LastVisitedNode = localStorage.getItem(
        "lastVisitedNode"
      )
        ? JSON.parse(localStorage.getItem("lastVisitedNode") as string)
        : null;
      setLastVisitedNode(lastVisitedNode);
    }
  }, [status]);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY !== 0;
      setShowDownButton(!isScrolled);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 text-gray-600">
      <HeadTag metaDescription="Discover the Urantia Papers - a unique collection of spiritual and philosophical teachings that bridge science, religion, and human history. Experience it through UrantiaHub's modern digital platform." />

      <HomepageNavbar />

      <main>
        {/* Hero Section */}
        <section className="hero-background relative min-h-screen pt-8 px-6 text-center bg-cover bg-center bg-slate-100 flex flex-col items-center justify-center overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/60 to-blue-800/40 mix-blend-multiply" />

          {/* Particle effect */}
          <ParticleBackground />

          {/* Content */}
          <div className="relative z-10 max-w-7xl mx-auto w-full mt-[-5vh]">
            <h1 className="mt-0 mb-8 text-5xl md:text-7xl font-bold text-white max-w-4xl mx-auto leading-tight drop-shadow-lg">
              Revolutionary Ideas for Life&apos;s Biggest Questions
            </h1>
            <p className="text-xl md:text-2xl text-white mb-14 max-w-2xl mx-auto leading-relaxed drop-shadow">
              Discover the Urantia Papers - a unique revelation that bridges
              lost history with modern science, offering unprecedented insights
              into our origin, purpose, and destiny.
            </p>

            {status === "authenticated" && (
              <Link
                className="fade-in bg-white text-gray-600 font-bold py-4 px-8 rounded shadow-xl transition duration-300 ease-in-out hover:no-underline"
                href={deriveReadLink(status)}
              >
                Continue Reading
              </Link>
            )}
            {status === "unauthenticated" && (
              <Link
                className="fade-in bg-white text-gray-600 font-bold py-4 px-8 rounded shadow-xl transition duration-300 ease-in-out hover:no-underline"
                href="/auth/sign-in"
              >
                Start Reading
              </Link>
            )}
          </div>

          {showDownButton && (
            <div
              className="fade-in fixed bottom-0 left-0 right-0 mx-auto w-12 h-12 mb-8 backdrop-blur-md bg-white/10 rounded-full p-2 z-10 cursor-pointer hover:bg-white/40 transition duration-300 ease-in-out"
              onClick={() => {
                const afterHero = document.getElementById("after-hero");
                afterHero?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
            >
              <svg
                aria-hidden="true"
                className="w-full h-full text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  vectorEffect="non-scaling-stroke"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
          )}
        </section>

        {/* Unique Ideas Section - NEW */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-semibold mb-16 text-center">
              Ideas That Challenge Our Understanding
            </h2>
            <p className="text-xl text-center mb-16 max-w-3xl mx-auto">
              The Urantia Papers present groundbreaking concepts about our
              universe, human history, and spiritual reality that had never been
              articulated before their publication in 1955.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="p-8 rounded-xl bg-slate-50 hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-2xl font-semibold mb-4">
                  Beyond Modern Science
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Detailed descriptions of universe mechanics and cosmic
                  organization that transcend contemporary scientific
                  understanding.
                </p>
              </div>
              <div className="p-8 rounded-xl bg-slate-50 hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-2xl font-semibold mb-4">
                  Human Origins Revealed
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  A comprehensive account of human civilization&apos;s
                  beginnings that bridges anthropological findings with
                  spiritual purpose.
                </p>
              </div>
              <div className="p-8 rounded-xl bg-slate-50 hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-2xl font-semibold mb-4">
                  Spiritual Reality Unified
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  A unique synthesis of science, philosophy, and religion that
                  provides new perspectives on life&apos;s deepest questions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Life&apos;s Biggest Questions */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-semibold mb-16 text-center">
              Life&apos;s Biggest Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 rounded-xl bg-slate-50 hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-2xl font-semibold mb-4">Are We Alone?</h3>
                <p className="text-gray-600 leading-relaxed">
                  Explore a detailed revelation of the universe&apos;s structure
                  and the countless celestial beings dedicated to helping
                  humanity grow and progress.
                </p>
              </div>
              <div className="p-8 rounded-xl bg-slate-50 hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-2xl font-semibold mb-4">
                  How is Our Universe Organized?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Explore the intricate structure of our local universe and its
                  relationship to the greater cosmos.
                </p>
              </div>
              <div className="p-8 rounded-xl bg-slate-50 hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-2xl font-semibold mb-4">
                  What is Humanity&apos;s Story?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Uncover the fascinating history of our world, from the origins
                  of human civilization to our modern global society.
                </p>
              </div>
              <div className="p-8 rounded-xl bg-slate-50 hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-2xl font-semibold mb-4">
                  Who Was Jesus as a Person?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Experience a unique perspective on the life and teachings of
                  Jesus, revealing the human story behind the historical figure.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Introduction to Urantia Papers */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-semibold mb-12 text-center">
              What are the Urantia Papers?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-xl leading-relaxed mb-6">
                  The Urantia Papers are a unique collection of 196 papers that
                  bridge science, philosophy, and religion, offering profound
                  insights into human history, cosmology, and spiritual truth.
                </p>
                <p className="text-xl leading-relaxed">
                  First published in 1955 by{" "}
                  <Link
                    className="text-blue-400 hover:text-blue-600 hover:no-underline transition-colors duration-200"
                    href="https://urantia.org"
                  >
                    The Urantia Book Foundation
                  </Link>
                  , these teachings have inspired millions worldwide, offering a
                  comprehensive view of our relationship with the universe and
                  divine purpose.
                </p>
              </div>
              <div className="relative h-96">
                <Image
                  src="/urantia-papers-history.jpg"
                  alt="Historical context of the Urantia Papers"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Traditional Reading Challenges */}
        <section className="py-24 bg-gradient-to-b from-white to-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-semibold mb-12 text-center">
              The Challenge of Studying the Papers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="relative h-96">
                  <Image
                    src="/traditional-reading.jpg"
                    alt="Traditional book reading experience"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="space-y-6">
                  <p className="text-xl leading-relaxed">
                    Traditionally, readers have accessed these teachings through
                    physical books or basic online reading experiences, which
                    presents several challenges:
                  </p>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <span className="text-red-400 mt-1">⚠️</span>
                      <p className="text-lg">
                        Complex cosmic concepts and detailed historical accounts
                        across 2,000+ pages can be challenging to piece together
                      </p>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-400 mt-1">⚠️</span>
                      <p className="text-lg">
                        Difficulty tracking progress and finding specific
                        passages across multiple reading sessions
                      </p>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-400 mt-1">⚠️</span>
                      <p className="text-lg">
                        Limited ability to take notes, bookmark passages, or
                        share insights with others
                      </p>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-red-400 mt-1">⚠️</span>
                      <p className="text-lg">
                        No built-in study aids or tools to help understand
                        complex concepts
                      </p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Modern Reading Experience */}
        <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-semibold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
              A Modern Reading Experience
            </h2>
            <p className="text-xl text-center mb-16 max-w-3xl mx-auto">
              We&apos;ve reimagined how these timeless teachings can be accessed
              and studied in the digital age, addressing traditional challenges
              with innovative solutions:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {modernFeatures.map((feature, index) => (
                <FeatureCard key={index} {...feature} />
              ))}
            </div>
          </div>
        </section>

        {/* Community and Engagement */}
        <section className="py-24 bg-blue-50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-semibold mb-8 text-center">
              Community Hub
            </h2>
            <p className="text-xl text-center mb-16 max-w-3xl mx-auto">
              We&apos;re building a space for truth-seekers to connect, share
              insights, and explore together.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {communityFeatures.map((feature, index) => (
                <CommunityCard key={index} {...feature} />
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 bg-gradient-to-b from-blue-600 to-blue-800 text-white">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-semibold mb-8">
              Begin Your Journey Today
            </h2>
            <p className="text-xl mb-12 max-w-2xl mx-auto">
              Join our growing community of truth-seekers discovering answers to
              life&apos;s deepest questions through these revolutionary
              teachings.
            </p>
            <p className="text-blue-200 mt-4">
              Free access • No credit card required • Start reading instantly
            </p>
            {status === "authenticated" && (
              <Link
                className="fade-in bg-blue-400 text-white font-bold py-4 px-8 rounded shadow-xl hover:bg-blue-500 transition duration-300 ease-in-out hover:no-underline"
                href={deriveReadLink(status)}
              >
                Continue Reading
              </Link>
            )}
            {status === "unauthenticated" && (
              <Link
                className="fade-in bg-blue-400 text-white font-bold py-4 px-8 rounded shadow-xl hover:bg-blue-500 transition duration-300 ease-in-out hover:no-underline"
                href="/auth/sign-in"
              >
                Sign in to get started
              </Link>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

// New component for modern features
const FeatureCard = ({ icon, title, description }: any) => (
  <div className="group relative bg-white p-8 rounded-xl transition-all duration-300 hover:shadow-lg border border-gray-100">
    {/* Gradient hover effect */}
    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

    {/* Content */}
    <div className="relative z-10">
      {/* Icon and Title container */}
      <div className="flex items-center gap-4 mb-4">
        {/* Icon with gradient background */}
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50">
          <span className="text-2xl">{icon}</span>
        </div>

        {/* Title with hover effect */}
        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
          {title}
        </h3>
      </div>

      {/* Description */}
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  </div>
);

// New data structures
const modernFeatures = [
  {
    icon: "📱",
    title: "Read Anywhere",
    description:
      "Access the papers on any device with our responsive platform and offline capabilities.",
  },
  {
    icon: "🎯",
    title: "Pick Up Where You Left Off",
    description:
      "Continue reading exactly where you stopped last time, with automatic progress tracking across devices.",
  },
  {
    icon: "🔍",
    title: "Enhanced Search",
    description:
      "Easily find specific papers or passages with our powerful search functionality.",
  },
  {
    icon: "📊",
    title: "Progress Tracking",
    description:
      "Track your reading journey with completion percentages for each paper, making learning engaging and motivating.",
  },
  {
    icon: "🔖",
    title: "Smart Bookmarking",
    description:
      "Save your favorite passages for quick reference and see how many others found them meaningful.",
  },
  {
    icon: "📝",
    title: "Personal Notes",
    description:
      "Create private notes on any passage to capture your thoughts and insights.",
  },
  {
    icon: "🎧",
    title: "Audio Experience",
    description:
      "Listen to high-quality audio narration with text highlighting, or enjoy the full papers on Spotify.",
  },
  {
    icon: "🤖",
    title: "AI-Powered Insights",
    description:
      "Get instant explanations and reflection questions for complex passages through our AI companion.",
  },
  {
    icon: "🎨",
    title: "Customizable Reading",
    description:
      "Personalize your reading experience with adjustable font sizes and light/dark mode themes.",
  },
  {
    icon: "🔗",
    title: "Easy Sharing",
    description:
      "Share inspiring passages on social media or copy direct links to your favorite sections.",
  },
  {
    icon: "🌐",
    title: "Free Access",
    description:
      "Read the papers without signing in, or unlock enhanced features with a free account.",
  },
  {
    icon: "✨",
    title: "More Features Coming Soon",
    description:
      "We're constantly evolving with new features like public notes, community bookmarks, additional reading themes, and more on the horizon.",
  },
];

type CommunityFeature = {
  title: string;
  description: string;
  icon?: React.ReactNode;
  imageUrl?: string;
  linkUrl?: string;
};

const CommunityCard = ({
  title,
  description,
  icon,
  imageUrl,
  linkUrl,
}: CommunityFeature) => (
  <div className="bg-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg group">
    {imageUrl && (
      <div className="relative h-48 overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transform group-hover:scale-105 transition-transform duration-300"
        />
      </div>
    )}
    <div className="p-8">
      <div className="flex items-center gap-4 mb-4">
        {icon && <div className="text-blue-500 text-2xl">{icon}</div>}
        <h3 className="text-2xl font-semibold text-gray-800">{title}</h3>
      </div>
      <p className="text-gray-600 leading-relaxed mb-6">{description}</p>
      {linkUrl && (
        <Link
          href={linkUrl}
          className="inline-flex items-center text-blue-500 font-medium hover:text-blue-600 transition-colors duration-200"
        >
          Learn more
          <svg
            className="w-4 h-4 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      )}
    </div>
  </div>
);

// Updated community features data
const communityFeatures = [
  {
    title: "Study Groups",
    description:
      "Join virtual study groups to explore the papers together. Share insights, ask questions, and deepen your understanding through meaningful discussions.",
    icon: "👥",
    imageUrl: "/images/study-groups.jpg",
    linkUrl: "/community/study-groups",
  },
  {
    title: "Discussion Forums",
    description:
      "Engage with readers worldwide in our vibrant forums. Explore topics, share interpretations, and participate in thoughtful conversations.",
    icon: "💭",
    imageUrl: "/images/forums.jpg",
    linkUrl: "/community/forums",
  },
  {
    title: "Events & Meetups",
    description:
      "Connect with fellow readers in person through local meetups and online events. Build lasting friendships with like-minded individuals.",
    icon: "🎯",
    imageUrl: "/images/events.jpg",
    linkUrl: "/community/events",
  },
];

export default HomePage;
