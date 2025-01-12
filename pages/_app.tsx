// Node modules.
import { Analytics } from "@vercel/analytics/react";
import { SessionProvider, useSession } from "next-auth/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Lato } from "next/font/google";
import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
// Relative modules.
import { ThemeProvider } from "@/context/theme";
import "@/styles/globals.css";
import SentryErrorBoundary from "@/components/SentryErrorBoundary";

const googleFont = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

// Wrap the actual app content with session tracking
function AppContent({ Component, pageProps }: any) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      if (status === "authenticated" && session?.user) {
        Sentry.setUser(session.user as Sentry.User);
      } else {
        Sentry.setUser(null);
      }
    }
  }, [session, status]);

  return (
    <SentryErrorBoundary>
      <Component {...pageProps} />
    </SentryErrorBoundary>
  );
}

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: any) {
  return (
    <div className={googleFont.className}>
      <ThemeProvider>
        <SessionProvider session={session}>
          <AppContent Component={Component} pageProps={pageProps} />
        </SessionProvider>
      </ThemeProvider>
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
