// Node modules.
import { Analytics } from "@vercel/analytics/react";
import { SessionProvider } from "next-auth/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Lato } from "next/font/google";
import { useRouter } from "next/router";
// Relative modules.
import "@/styles/globals.css";

const googleFont = Lato({
  subsets: ["latin"],
  weight: ["100", "400", "700"],
});

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <div className={googleFont.className}>
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
      {process.env.NODE_ENV === "production" && <SpeedInsights />}
      {process.env.NODE_ENV === "production" && <Analytics />}
      <script
        async
        src="https://app.termly.io/resource-blocker/2d5a2b8c-1d75-49a7-b386-2dd80780e256?autoBlock=on"
        type="text/javascript"
      />
    </div>
  );
}
