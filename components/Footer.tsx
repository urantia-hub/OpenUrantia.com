const Footer = () => {
  return (
    <footer className="border-t border-zinc-800 py-6 z-10">
      <div className="flex justify-between items-center container mx-auto px-4">
        <div>
          <span className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Open Urantia
          </span>
        </div>
        <div className="flex gap-4"></div>
        <div>
          <span className="text-gray-400 text-sm">All systems normal.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
