// Node modules.
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
// Relative modules.
import Footer from "@/components/Footer";
import HeadTag from "@/components/HeadTag";
import { ReadNode } from "@prisma/client";

const HomePage = () => {
  // Hooks.
  const { data: session } = useSession();

  // State.
  const [lastReadNode, setLastReadNode] = useState<ReadNode | null>(null);
  const [showDownButton, setShowDownButton] = useState<boolean>(true);

  const fetchLastReadNode = async () => {
    if (session) {
      const response = await fetch(`/api/user/nodes/read?lastRead=true`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setLastReadNode(data);
    }
  };

  useEffect(() => {
    void fetchLastReadNode();
  }, [session]);

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
      <HeadTag />

      <main>
        {/* Hero Section */}
        <section className="hero-image min-h-screen pt-16 md:pt-56 px-6 md:px-12 text-center bg-cover bg-center bg-neutral-900">
          {/* Consider adding a background image that resonates with the reading experience */}
          <h1 className="mt-8 mb-2 text-6xl md:text-7xl font-bold">
            Discover the Urantia Book
          </h1>
          <p className="text-lg mx-auto leading-relaxed max-w-2xl pb-10">
            {session && lastReadNode?.paperId
              ? `Welcome back! Ready to continue your journey reading ${
                  lastReadNode.paperId === "0"
                    ? "the Foreword"
                    : `Paper ${lastReadNode.paperId}`
                }?`
              : `Embark on an enlightening journey with a personalized, seamless
            reading experience.`}
          </p>
          <Link
            className="bg-white text-black font-bold py-4 px-8 rounded-full shadow-xl hover:bg-blue-100 transition duration-300 ease-in-out"
            href={
              session && lastReadNode?.paperId && lastReadNode?.globalId
                ? `/papers/${lastReadNode.paperId}#${lastReadNode.globalId}`
                : "/papers/0"
            }
          >
            {session && lastReadNode
              ? "Continue right where you left off"
              : "Start Reading"}
          </Link>

          {showDownButton && (
            <div
              className="fade-in fixed bottom-0 left-0 right-0 mx-auto w-12 h-12 mb-8 bg-neutral-900/90 rounded-full p-2"
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
                  key={index}
                  title={feature.title}
                  description={feature.description}
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
              the Urantia Book.
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
        </section>

        {/* Secondary CTA */}
        <section className="flex flex-col items-center py-20 lg:py-12 bg-gradient-to-br from-sky-400 to-blue-800">
          <h2 className="text-3xl font-semibold mb-4 px-4 lg:px-0 text-left w-full lg:text-center">
            Join the Journey
          </h2>
          <p className="text-lg mx-auto leading-relaxed max-w-2xl pb-8 px-4 lg:px-0">
            We&apos;re just getting started. Begin reading the Urantia Book
            today.
          </p>
          <Link
            className="bg-white text-black font-bold py-4 px-8 rounded-full shadow-xl hover:bg-blue-100 transition duration-300 ease-in-out"
            href={
              session && lastReadNode?.paperId && lastReadNode?.globalId
                ? `/papers/${lastReadNode.paperId}#${lastReadNode.globalId}`
                : "/papers/0"
            }
          >
            {session && lastReadNode?.paperId
              ? `Continue reading ${
                  lastReadNode.paperId === "0"
                    ? "the Foreword"
                    : `Paper ${lastReadNode.paperId}`
                }`
              : "Start Reading"}
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
      "Our intuitive tracking system remembers your last read paragraph, providing a seamless continuation each time you return.",
  },
  {
    title: "Engage with Every Word",
    description:
      "Dive deeper into the teachings. Save your favorite paragraphs, annotate with personal reflections, and easily revisit your curated insights and notes.",
  },
  {
    title: "Share Wisdom with the World",
    description:
      "Inspire others by sharing enlightening paragraphs directly to social platforms.",
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
      "Enjoy reading the Urantia Book even when you're not connected to the internet.",
  },
  {
    title: "Listen with Audio Narration",
    description:
      "Listen to the Urantia Book, never lose your place, and follow along with the text.",
  },
  {
    title: "Achievements and Milestones",
    description:
      "Track your progress and celebrate your accomplishments as you read.",
  },
  {
    title: "Community-Driven Translations",
    description:
      "Read the Urantia Book in your native language, and help us translate it into more languages.",
  },
  {
    title: "Build For Everyone",
    description:
      "Create and share your own Urantia Book content and resources on our open-source platform.",
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
    title: "Spirit of the Urantia Book",
    description:
      "At the heart of OpenUrantia is a vision to expand the accessibility and understanding of the Urantia Book's profound teachings.",
  },
  {
    title: "Technology with Purpose",
    description:
      "We believe technology can be a powerful tool for spiritual growth. Our mission is to create a platform that empowers individuals to discover, share, and build off the Urantia Book's teachings.",
  },
  {
    title: "Community-Driven Approach",
    description:
      "Our commitment to open-source development invites collaboration and innovation, ensuring the teachings of the Urantia Book continue to evolve and reach new audiences.",
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
