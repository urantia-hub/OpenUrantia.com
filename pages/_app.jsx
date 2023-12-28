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
    <>
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
      {process.env.NODE_ENV === "production" && <SpeedInsights />}
      <script
        async
        src="https://app.termly.io/resource-blocker/2d5a2b8c-1d75-49a7-b386-2dd80780e256?autoBlock=on"
        type="text/javascript"
      />
    </>
  );
}
