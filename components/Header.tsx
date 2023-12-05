// Node modules.
import Link from "next/link";

const Header = () => {
  return (
    <header className="container mx-auto flex justify-between items-center py-6 px-4 border-b border-zinc-700 z-10">
      <Link href="/" className="no-underline hover:no-underline">
        <h1 className="text-3xl font-bold tracking-wider">
          <span className="font-thin">Open</span>Urantia
        </h1>
      </Link>
      <div className="flex items-center">
        <Link className="mr-6" href="/read">
          Read
        </Link>
      </div>
    </header>
  );
};

export default Header;
