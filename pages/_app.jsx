// Node modules.
import { SessionProvider } from "next-auth/react";
import { useRouter } from "next/router";
import { SpeedInsights } from "@vercel/speed-insights/next";
// Relative modules.
import "@/styles/globals.css";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SpeedInsights>
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
    </SpeedInsights>
  );
}
