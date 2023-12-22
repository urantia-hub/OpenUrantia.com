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
          className="text-gray-400 text-sm"
          href="https://stats.uptimerobot.com/6qzJEHV7rN"
          rel="noopener noreferrer"
          target="_blank"
        >
          Status
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
