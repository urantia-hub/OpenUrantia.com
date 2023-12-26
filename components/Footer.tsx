// Node modules.
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="py-4 text-xs bg-gradient-to-b to-gray-1000 from-black">
      <div className="flex justify-between items-center container mx-auto px-4">
        <div>
          <span className="text-gray-400">
            &copy; {new Date().getFullYear()} OpenUrantia
          </span>
        </div>
        <div className="flex gap-4"></div>
        <Link
          className="flex items-center text-green-400 text-xs hover:text-green-500"
          href="https://stats.uptimerobot.com/6qzJEHV7rN"
          rel="noopener noreferrer"
          target="_blank"
        >
          <span className="relative flex h-2 w-2 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>{" "}
          All systems normal.
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
