// Node modules.
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
// Relative modules.
import Footer from "@/components/Footer";
import HeadTag from "@/components/HeadTag";
import HomepageNavbar from "@/components/HomepageNavbar";

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

    // Check if the user has interests, if they have been redirected before, or if they skipped the selection
    if (
      data.userInterests.length === 0 &&
      !sessionStorage.getItem("redirectedToInterests") &&
      !sessionStorage.getItem("skippedInterestsSelection")
    ) {
      sessionStorage.setItem("redirectedToInterests", "true");
      window.location.href = "/onboarding/interests"; // Redirect to the onboarding interests selection page
    } else {
      window.location.href = "/papers"; // Redirect to the papers page
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
    <div className="flex flex-col min-h-screen text-white bg-neutral-900">
      <HeadTag metaDescription="Explore the OpenUrantia platform: your digital gateway to the profound teachings and insights of The Urantia Papers, accessible to all." />

      <HomepageNavbar />

      <main>
        {/* Hero Section */}
        <section className="hero-image min-h-screen pt-16 md:pt-56 px-6 md:px-12 text-center bg-cover bg-center bg-neutral-900">
          {/* Consider adding a background image that resonates with the reading experience */}
          <h1 className="mt-8 mb-2 text-6xl md:text-7xl font-bold">
            Discover the Urantia Papers
          </h1>
          <p className="text-lg mx-auto leading-relaxed max-w-2xl pb-10">
            {lastVisitedNode?.paperId && status === "authenticated"
              ? `Welcome back! Ready to continue your journey reading ${
                  lastVisitedNode.paperId === "0"
                    ? "the Foreword"
                    : `Paper ${lastVisitedNode.paperId}`
                }?`
              : `Embark on an enlightening journey with a personalized, seamless
            reading experience.`}
          </p>
          {/* <div className="flex flex-col md:flex-row items-center md:items-end justify-center pb-10">
            <Image
              alt="Urantia Papers on an iPhone 14 Pro"
              className="md:mr-4 mb-4 md:mb-0"
              height={350}
              src="/paper-63-iphone-14-pro.png"
              width={176}
            />
            <Image
              alt="Urantia Papers on a MacBook Pro"
              className="hidden md:block"
              height={600}
              src="/foreword-macbook-pro.png"
              width={600}
            />
          </div> */}
          <Link
            className="bg-white text-black font-bold py-4 px-8 rounded-full shadow-xl hover:bg-blue-100 transition duration-300 ease-in-out"
            href={
              lastVisitedNode?.paperId &&
              lastVisitedNode?.globalId &&
              status === "authenticated"
                ? `/papers/${lastVisitedNode.paperId}#${lastVisitedNode.globalId}`
                : "/auth/sign-in"
            }
          >
            {lastVisitedNode && status === "authenticated"
              ? "Continue right where you left off"
              : "Sign in to get started"}
          </Link>

          {showDownButton && (
            <div
              className="fade-in fixed bottom-0 left-0 right-0 mx-auto w-12 h-12 mb-8 bg-neutral-900/80 rounded-full p-2 z-10 cursor-pointer hover:bg-neutral-900/100 transition duration-300 ease-in-out"
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

        {/* Features Overview */}
        <div className="relative">
          <section className="pt-12 lg:pt-72 lg:pb-96 lg:mb-80">
            <h2
              className="text-5xl font-semibold lg:text-center mb-16 leading-normal text-sky-300 tracking-wide px-4 lg:px-0"
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
          <section className="upcoming-features lg:absolute lg:left-0 lg:right-0 lg:container lg:mx-auto lg:px-12 pt-20 pb-12 lg:pb-20 bg-neutral-800 rounded-xl mt-10 lg:my-32 mb-0 lg:mb-10">
            <h2 className="text-5xl font-semibold lg:text-center text-blue-400 px-4 lg:px-0">
              Upcoming Enhancements
            </h2>
            <p className="text-2xl mx-auto leading-relaxed max-w-4xl pt-4 lg:text-center px-4 lg:px-0">
              We&apos;re constantly innovating to enrich your journey through
              the Urantia Papers.
            </p>
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left px-4 mt-20">
              {upcomingFeatures.map((feature, index) => (
                <FeatureItem
                  description={feature.description}
                  key={index}
                  title={feature.title}
                />
              ))}
            </div>
          </section>
        </div>

        {/* Vision and Mission */}
        <section className="vision-and-mission pt-20 bg-black pb-20 lg:pb-60">
          <h2 className="text-5xl font-semibold lg:text-center text-indigo-300 px-4 lg:px-0">
            Our Vision and Mission
          </h2>
          <p className="text-xl mx-auto leading-relaxed max-w-4xl pt-4 lg:text-center px-4 lg:px-0">
            Tomorrow&apos;s technology will give an individual more potential
            impact than ever before.
            <br />
            Let&apos;s give them the tools to make a difference.
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
        <section className="flex flex-col items-center py-20 bg-gradient-to-br from-sky-400 to-blue-800">
          <h2 className="text-3xl font-semibold mb-4 px-4 lg:px-0 text-left w-full lg:text-center">
            {status === "authenticated" ? "Continue" : "Join"} the Journey
          </h2>
          {status !== "authenticated" && (
            <p className="text-lg mx-auto leading-relaxed max-w-2xl pb-8 px-4 lg:px-0">
              We&apos;re just getting started. Begin reading the Urantia Papers
              today.
            </p>
          )}
          <Link
            className="bg-white text-black font-bold py-4 px-8 rounded-full shadow-xl hover:bg-blue-100 transition duration-300 ease-in-out"
            href={
              lastVisitedNode?.paperId &&
              lastVisitedNode?.globalId &&
              status === "authenticated"
                ? `/papers/${lastVisitedNode.paperId}#${lastVisitedNode.globalId}`
                : "/auth/sign-in"
            }
          >
            {lastVisitedNode?.paperId && status === "authenticated"
              ? `Continue reading ${
                  lastVisitedNode.paperId === "0"
                    ? "the Foreword"
                    : `Paper ${lastVisitedNode.paperId}`
                }`
              : "Sign in to get started"}
          </Link>
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
      "Customize your reading experience to your liking with adjustable font sizes and line spacing.",
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
      "At the heart of OpenUrantia is a vision to expand the accessibility and understanding of the Urantia Papers' profound teachings.",
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

const FeatureItem = ({ title, description, titleClassName }: any) => (
  <div className="flex flex-col mb-10">
    <h3 className={`text-3xl font-bold mb-2 ${titleClassName || ""}`}>
      {title}
    </h3>
    <p className="text-lg leading-relaxed">{description}</p>
  </div>
);

export default HomePage;
