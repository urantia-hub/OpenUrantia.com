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
      <HeadTag metaDescription="Explore the UrantiaHub platform: your digital gateway to the profound teachings and insights of The Urantia Papers, accessible to all." />

      <HomepageNavbar />

      <main>
        {/* Hero Section */}
        <section className="hero-background min-h-screen pt-8 px-6 text-center bg-cover bg-center bg-slate-100 flex flex-col items-center justify-center">
          <p className="text-white">Experience the</p>
          <h1 className="mt-0 mb-12 text-5xl md:text-7xl font-bold text-white w-full">
            Urantia Papers
          </h1>

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
              Sign Up
            </Link>
          )}

          {showDownButton && (
            <div
              className="fade-in fixed bottom-0 left-0 right-0 mx-auto w-12 h-12 mb-8 bg-white rounded-full p-2 z-10 cursor-pointer hover:bg-gray-300 transition duration-300 ease-in-out"
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
                className="w-full h-full text-gray-600"
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

        {/* Features Overview */}
        <div className="relative bg-slate-50">
          <section className="pt-12 lg:pt-72 lg:pb-96 lg:mb-80">
            <h2
              className="text-5xl font-semibold lg:text-center mb-16 md:leading-normal text-blue-400 tracking-wide px-4 lg:px-0"
              id="after-hero"
            >
              Read, learn, share, and grow.
            </h2>
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 text-left px-4">
              {features.map((feature, index) => (
                <FeatureItem
                  description={feature.description}
                  key={index}
                  title={feature.title}
                />
              ))}
            </div>
          </section>

          {/* Upcoming Features */}
          <section className="upcoming-features lg:absolute lg:left-0 lg:right-0 lg:container lg:mx-auto lg:px-12 pt-20 pb-12 lg:pb-20 rounded mt-10 lg:my-32 mb-0 lg:mb-10 bg-gradient-to-br from-sky-400 to-blue-800 shadow-xl">
            <h2 className="text-5xl font-semibold lg:text-center text-white px-4 lg:px-0">
              Upcoming Enhancements
            </h2>
            <p className="text-2xl mx-auto leading-relaxed max-w-4xl pt-4 lg:text-center text-white px-4 lg:px-0">
              We&apos;re constantly innovating to enrich your journey through
              the Urantia Papers.
            </p>
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left px-4 mt-20">
              {upcomingFeatures.map((feature, index) => (
                <FeatureItem
                  titleClassName="text-white"
                  descriptionClassName="text-white"
                  description={feature.description}
                  key={index}
                  title={feature.title}
                />
              ))}
            </div>
          </section>
        </div>

        {/* Vision and Mission */}
        <section className="vision-and-mission pt-20 pb-20 lg:pb-60 bg-gradient-to-b from-slate-100 to-slate-50">
          <h2 className="text-5xl font-semibold lg:text-center text-gray-600 px-4 lg:px-0">
            Our Vision and Mission
          </h2>
          <p className="text-lg mx-auto text-gray-400 leading-relaxed max-w-4xl pt-4 lg:text-center px-4 lg:px-0">
            Tomorrow&apos;s technology will give an individual more potential
            impact than ever before. Let&apos;s give them the tools to make a
            difference.
          </p>
          <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left mt-16">
            {visionAndMission.map((feature, index) => (
              <FeatureItem
                description={feature.description}
                key={index}
                title={feature.title}
              />
            ))}
          </div>
          <div className="flex flex-col items-center mt-8 md:mt-16 px-4">
            <Image
              alt="hand holding holographic world with cityscape in background"
              className="border-4 border-white rounded-xl"
              height={800}
              src="/vision.png"
              width={800}
            />
          </div>
        </section>

        {/* Secondary CTA */}
        <section className="flex flex-col items-center py-20 lg:py-20 bg-slate-50 text-center">
          <h2 className="text-3xl font-semibold mb-2 px-4 lg:px-0 text-left w-full lg:text-center text-gray-600 text-center">
            {status === "authenticated" ? "Continue" : "Join"} the Journey
          </h2>
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
        </section>
      </main>

      <Footer marginBottom="0" />
    </div>
  );
};

const features = [
  {
    title: "Your Personal Reading Companion",
    description:
      "Our intuitive tracking system remembers your last read passage, providing a seamless continuation each time you return.",
  },
  {
    title: "Engage with Every Word",
    description:
      "Dive deeper into the teachings. Bookmark your favorite passages, annotate with personal reflections, and easily revisit your curated insights and notes.",
  },
  {
    title: "Share Wisdom with the World",
    description:
      "Inspire others by sharing enlightening passages directly to social platforms.",
  },
  {
    title: "Read Comfortably, Anytime",
    description:
      "Our elegant dark mode design is crafted to reduce eye strain, allowing for a comfortable reading experience in any lighting condition.",
  },
];

const upcomingFeatures = [
  {
    title: "Read with AI Explanations",
    description:
      "Gain deeper insights into complex passages with the help of AI-driven explanations and context.",
  },
  {
    title: "Offline, Anywhere, Anytime",
    description:
      "Enjoy reading the Urantia Papers even when you're not connected to the internet.",
  },
  {
    title: "Listen with Audio Narration",
    description:
      "Listen to the Urantia Papers, never lose your place, and follow along with the text.",
  },
  {
    title: "Achievements and Milestones",
    description:
      "Track your progress and celebrate your accomplishments as you read.",
  },
  {
    title: "Community-Driven Translations",
    description:
      "Read the Urantia Papers in your native language, and help us translate it into more languages.",
  },
  {
    title: "Build For Everyone",
    description:
      "Create and share your own Urantia Papers content and resources on our open-source platform.",
  },
  {
    title: "Personalized Reading Experience",
    description:
      "Customize your reading experience to your liking with adjustable font sizes, line spacing, and theming.",
  },
  {
    title: "Discover Related Content",
    description:
      "Explore related content and discover new insights with our AI-powered recommendations.",
  },
  {
    title: "Notifications and Reminders",
    description:
      "Receive notifications and reminders to keep you on track with your reading goals.",
  },
];

const visionAndMission = [
  {
    title: "Spirit of the Urantia Papers",
    description:
      "At the heart of UrantiaHub is a vision to expand the accessibility and understanding of the Urantia Papers' profound teachings.",
  },
  {
    title: "Technology with Purpose",
    description:
      "We believe technology can be a powerful tool for spiritual growth. Our mission is to create a platform that empowers individuals to discover, share, and build off the Urantia Papers' teachings.",
  },
  {
    title: "Community-Driven Approach",
    description:
      "Our commitment to open-source development invites collaboration and innovation, ensuring the teachings of the Urantia Papers continue to evolve and reach new audiences.",
  },
];

const FeatureItem = ({
  title,
  description,
  titleClassName,
  descriptionClassName,
}: any) => (
  <div className="flex flex-col mb-10">
    <h3
      className={`text-3xl font-bold mb-2 text-gray-600 ${
        titleClassName || ""
      }`}
    >
      {title}
    </h3>
    <p
      className={`text-lg leading-relaxed text-gray-400 ${
        descriptionClassName || ""
      }`}
    >
      {description}
    </p>
  </div>
);

export default HomePage;
