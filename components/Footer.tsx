// Node modules.
import Link from "next/link";
import { useRouter } from "next/router";

type FooterProps = {
  marginBottom?: string;
};

const Footer = ({ marginBottom }: FooterProps) => {
  const router = useRouter();

  return (
    <footer
      className={`py-4 text-xs`}
      style={{ marginBottom: marginBottom || "4.3rem" }}
    >
      <div className="flex flex-col md:flex-row justify-between items-center container mx-auto px-4">
        <div>
          <span className="text-gray-400">
            &copy; {new Date().getFullYear()} OpenUrantia
          </span>
        </div>
        <div className="flex items-center my-2 md:my-0">
          <div className="flex gap-4">
            <Link
              href="/privacy-policy"
              className="text-gray-400 hover:text-gray-500"
            >
              Privacy
            </Link>
            <Link
              href="/terms-of-service"
              className="text-gray-400 hover:text-gray-500"
            >
              Terms
            </Link>
            <Link
              href="/cookie-policy"
              className="text-gray-400 hover:text-gray-500"
            >
              Cookies
            </Link>
            {router.asPath === "/cookie-policy" && (
              <Link
                href="/cookie-policy"
                id="termly-consent-preferences"
                onClick={() => {
                  // @ts-ignore
                  window?.displayPreferenceModal();
                  return false;
                }}
              >
                Consent Preferences
              </Link>
            )}
          </div>
          <Link
            className="flex items-center text-green-400 text-xs hover:text-green-500 ml-4"
            href="https://stats.uptimerobot.com/6qzJEHV7rN"
            rel="noopener noreferrer"
            target="_blank"
          >
            <span className="flex relative h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>{" "}
            All systems normal.
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
