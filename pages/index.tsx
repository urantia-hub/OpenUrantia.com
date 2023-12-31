// Node modules.
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
// Relative modules.
import Footer from "@/components/Footer";
import HeadTag from "@/components/HeadTag";

const HomePage = () => {
  const [showDownButton, setShowDownButton] = useState<boolean>(true);

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
        <section className="hero-image relative min-h-screen pt-2 md:pt-40 px-2 md:px-0 text-center bg-neutral-900">
          {/* Consider adding a background image that resonates with the reading experience */}
          <h1 className="mt-8 mb-2 text-6xl md:text-7xl font-bold">
            Discover the Urantia Book
          </h1>
          <p className="text-lg mx-auto leading-relaxed max-w-2xl pb-10">
            Embark on an enlightening journey with a personalized, seamless
            reading experience.
          </p>
          <Link
            className="bg-white text-black font-bold py-3 px-6 rounded-full shadow-xl hover:bg-blue-100 transition duration-300 ease-in-out"
            href="/papers/0"
          >
            Start Reading
          </Link>

          {showDownButton && (
            <div
              className="fade-in absolute bottom-0 left-0 right-0 mx-auto w-12 h-12 mb-8 bg-neutral-900/80 rounded-full p-2"
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
        <section className="pt-16 pb-20">
          <h2
            className="text-5xl font-semibold text-center mb-16 leading-normal text-sky-300 tracking-wide"
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
        <section className="container mx-auto px-8 py-10 bg-neutral-800 rounded-xl mb-28">
          <h2 className="text-4xl font-semibold text-center">
            Upcoming Enhancements
          </h2>
          <p className="text-lg mx-auto leading-relaxed max-w-2xl pt-2 text-center">
            We&apos;re constantly innovating to enrich your journey through the
            Urantia Book.
          </p>
          <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left mt-10">
            {upcomingFeatures.map((feature, index) => (
              <FeatureItem
                key={index}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </section>

        {/* Vision and Mission */}
        <section className="bg-black py-28">
          <div className="relative w-full md:h-96">
            <Image
              alt="A hand holding a holographic globe"
              fill
              objectFit="contain"
              src="/vision.png"
            />
          </div>
          <h2 className="text-5xl font-semibold text-center mt-10 leading-normal text-indigo-300 tracking-wide">
            Our Vision and Mission
          </h2>
          <p className="text-2xl mx-auto leading-relaxed max-w-4xl pt-10 text-center">
            Tomorrow&apos;s technology will give an individual more potential
            impact than ever before. Let&apos;s give them the tools to make a
            difference.
          </p>
          <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left mt-16">
            <div>
              <h3 className="text-2xl font-bold mb-2">
                Embracing the Spirit of the Urantia Book
              </h3>
              <p className="text-lg leading-snug">
                At the heart of OpenUrantia is a vision to expand the
                accessibility and understanding of the Urantia Book&apos;s
                profound teachings.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">
                Fostering a Community-Driven Approach
              </h3>
              <p className="text-lg leading-snug">
                Our commitment to open-source development invites collaboration
                and innovation, ensuring the teachings of the Urantia Book
                continue to evolve and reach new audiences.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">
                Looking Beyond: Language & Technology
              </h3>
              <p className="text-lg leading-snug">
                Expanding into multiple languages and integrating advanced
                technologies like AI-generated audio, we strive to make the
                Urantia Book&apos;s wisdom universally accessible.
              </p>
            </div>
          </div>
        </section>

        {/* Interactive Demo or Video */}
        <section className="mt-16">
          <h2 className="text-3xl font-semibold text-center mb-10">
            Experience OpenUrantia: A Guided Tour
          </h2>
          <p className="text-lg mx-auto leading-relaxed max-w-2xl pb-10 text-center">
            Get a feel for the enriching reading experience we offer. Watch our
            interactive video tour and see how OpenUrantia brings the Urantia
            Book to life.
          </p>
          {/* Placeholder for video or interactive demo */}
          {/* <div className="relative h-56 w-full md:h-96">
            <Image
              src="/path-to-your-video-thumbnail.jpg"
              alt="A thumbnail of the OpenUrantia interactive tour video"
              layout="fill"
              objectFit="cover"
              className="rounded-lg shadow-lg"
            />
          </div> */}
        </section>

        {/* Testimonials or User Reviews */}
        <section className="mt-16">
          <h2 className="text-3xl font-semibold text-center mb-10">
            Hear from Our Community
          </h2>
          {/* Placeholder for testimonials or user reviews */}
          {/* Testimonial cards or carousel can go here */}
        </section>

        {/* Secondary CTA */}
        <section className="mt-16 text-center">
          <h2 className="text-3xl font-semibold mb-10">
            Join the OpenUrantia Journey
          </h2>
          <p className="text-lg mx-auto leading-relaxed max-w-2xl pb-10">
            Ready to explore the depths of the Urantia Book? Sign up today and
            begin a journey of cosmic discovery.
          </p>
          <Link
            className="bg-white text-black font-bold py-3 px-6 rounded-full shadow-lg hover:bg-blue-100 transition duration-300 ease-in-out"
            href="/signup"
          >
            Sign Up Now
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
    title: "Interactive Guidance with ChatGPT",
    description:
      "Gain deeper insights into complex passages with the help of AI-driven explanations.",
  },
  {
    title: "Offline Access for Uninterrupted Reading",
    description:
      "Enjoy reading the Urantia Book even when you're not connected to the internet.",
  },
  // Add other upcoming features here...
];

const FeatureItem = ({ title, description }: any) => (
  <div className="flex flex-col mb-10">
    <h3 className="text-3xl font-bold mb-2">{title}</h3>
    <p className="text-lg leading-snug">{description}</p>
  </div>
);

export default HomePage;
