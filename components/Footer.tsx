// Node modules.
import Link from "next/link";
import { useRouter } from "next/router";

type FooterProps = {
  marginBottom?: string;
};

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-lg font-bold tracking-wide mb-4 flex items-center">
              <span className="flex items-center font-light">Urantia</span>
              Hub
            </h3>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/features">Features</Link>
              </li>
              <li>
                <Link href="/about">About</Link>
              </li>
              <li>
                <Link href="/community">Community</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/blog">Blog</Link>
              </li>
              <li>
                <Link href="/help">Help Center</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy-policy">Privacy</Link>
              </li>
              <li>
                <Link href="/terms-of-service">Terms</Link>
              </li>
              <li>
                <Link href="/cookie-policy">Cookies</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="text-sm border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p>
            &copy; {new Date().getFullYear()} UrantiaHub. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            {/* Add social media links */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
