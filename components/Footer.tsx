const Footer = () => {
  return (
    <footer className="border-t border-zinc-800 py-4 text-xs bg-gradient-to-b from-gray-900 to-black">
      <div className="flex justify-between items-center container mx-auto px-4">
        <div>
          <span className="text-gray-400">
            &copy; {new Date().getFullYear()} OpenUrantia
          </span>
        </div>
        <div className="flex gap-4"></div>
        <div>
          <span className="text-gray-400">All systems normal.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
