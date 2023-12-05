// Node modules.
import Link from "next/link";
// Relative modules.
import Footer from "@/components/Footer";
import HeadTag from "@/components/HeadTag";
import Header from "@/components/Header";

const HomePage = () => {
  return (
    <div className="homepage flex flex-col min-h-screen text-white">
      <HeadTag />

      <Header />

      <main className="flex-grow container mx-auto px-4 py-10">
        <section className="text-center space-y-6">
          <h1 className="text-5xl font-bold">
            <span className="font-thin">Open</span>Urantia
          </h1>
          <p className="text-lg mx-auto leading-relaxed max-w-2xl pb-14">
            OpenUrantia.com offers an engaging platform to read the Urantia
            Book. We are actively developing new features to enhance your
            experience, including AI-driven insights, progress tracking, and a
            global community for spiritual growth. Stay tuned!
          </p>
          <Link
            className="bg-white text-black font-bold py-3 px-6 rounded-full shadow-lg hover:bg-gray-400 transition duration-300 ease-in-out"
            href="/read"
          >
            Start Reading
          </Link>
        </section>

        <section className="mt-16 bg-black/50 backdrop-filter backdrop-blur-sm rounded-xl p-8">
          <h2 className="text-3xl font-semibold text-center">
            Upcoming Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left mt-8">
            {features.map((feature, index) => (
              <FeatureItem
                key={index}
                icon={feature.icon}
                text={feature.text}
              />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

const features = [
  {
    icon: "📖",
    text: "Save your favorite passages and take notes.",
  },
  {
    icon: "💡",
    text: "Get instant AI explanations for complex passages.",
  },
  {
    icon: "🏆",
    text: "Monitor your progress and collect achievements.",
  },
  {
    icon: "🔗",
    text: "Effortlessly share and connect via social media.",
  },
  {
    icon: "🔎",
    text: "Search the entire Urantia Book with ease.",
  },
  { icon: "🎨", text: "Customize your reading experience." },
];

const FeatureItem = ({ icon, text }: any) => (
  <div className="flex items-start">
    <span className="text-2xl">{icon}</span>
    <p className="ml-4 text-lg leading-snug">{text}</p>
  </div>
);

export default HomePage;
