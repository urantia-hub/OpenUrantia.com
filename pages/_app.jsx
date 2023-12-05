// Node modules.
import { useRouter } from "next/router";
// Relative modules.
import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
