import Link from "next/link";
import {
  Smartphone,
  Target,
  Search,
  BarChart2,
  Bookmark,
  PenTool,
  Headphones,
  Brain,
  Palette,
} from "lucide-react";

export const FeatureCard = ({
  icon: Icon,
  title,
  description,
  iconColor,
}: {
  icon: typeof Smartphone;
  title: string;
  description: React.ReactNode;
  iconColor: string;
}) => (
  <div className="group relative">
    <div
      className="relative h-full bg-slate-800 backdrop-blur-sm p-8 rounded-xl transition-all duration-300
      hover:shadow-xl hover:scale-105 hover:-translate-y-1 transform"
    >
      <div className="flex items-center gap-4 mb-6">
        <div
          className={`inline-flex items-center justify-center w-14 h-14 rounded-xl flex-shrink-0`}
          style={{ backgroundColor: iconColor }}
        >
          <Icon className="w-8 h-8 text-white" strokeWidth={1.5} />
        </div>
        <h3 className="text-xl font-semibold text-slate-200">{title}</h3>
      </div>
      <p className="relative text-slate-400 leading-relaxed">{description}</p>
    </div>
  </div>
);

// Update the modernFeatures array with gradient colors
export const modernFeatures = [
  {
    icon: Smartphone,
    title: "Read Anywhere",
    description:
      "Access the papers on any device with our responsive platform and offline capabilities.",
    iconColor: "#007bff",
  },
  {
    icon: Target,
    title: "Pick Up Where You Left Off",
    description:
      "Continue reading exactly where you stopped last time, with automatic progress tracking across devices.",
    iconColor: "#dc3545",
  },
  {
    icon: Search,
    title: "Enhanced Search",
    description:
      "Easily find specific papers or passages with our powerful search functionality.",
    iconColor: "#ffc107",
  },
  {
    icon: BarChart2,
    title: "Progress Tracking",
    description:
      "Track your reading journey with completion percentages for each paper, making learning engaging and motivating.",
    iconColor: "#ff9800",
  },
  {
    icon: Bookmark,
    title: "Smart Bookmarking",
    description:
      "Save your favorite passages for quick reference and see how many others found them meaningful.",
    iconColor: "#28a745",
  },
  {
    icon: PenTool,
    title: "Personal Notes",
    description:
      "Create private notes on any passage to capture your thoughts and insights.",
    iconColor: "#00bcd4",
  },
  {
    icon: Headphones,
    title: "Audio Experience",
    description: (
      <>
        Listen to high-quality audio narration with text highlighting, or enjoy
        the full papers on{" "}
        <Link
          href="https://open.spotify.com/show/7IDP6RsZbKtUjfEwLLHtuw?si=1fec0631594d45fb"
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-400 hover:text-emerald-300 transition-colors duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          Spotify
        </Link>
        .
      </>
    ),
    iconColor: "#007bff",
  },
  {
    icon: Brain,
    title: "AI-Powered Insights",
    description:
      "Get instant explanations and reflection questions for complex passages through our AI companion.",
    iconColor: "#6610f2",
  },
  {
    icon: Palette,
    title: "Customizable Reading",
    description:
      "Personalize your reading experience with adjustable font sizes and light/dark mode themes.",
    iconColor: "#ff9800",
  },
];
export default FeatureCard;
