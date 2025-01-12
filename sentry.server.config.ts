// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

if (process.env.NODE_ENV === "production") {
  Sentry.init({
    dsn:
      process.env.NEXT_PUBLIC_SENTRY_DSN ||
      "https://3e482dce99f521fbb29aeda8001efd2a@o4506857923739648.ingest.us.sentry.io/4506857924984832",

    debug: false,

    // Add environment tag
    environment: process.env.NODE_ENV,

    // Increase sample rate for better debugging
    tracesSampleRate: 1.0,

    // Enable request data capturing
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express(),
      new Sentry.Integrations.Prisma(),
    ],

    // Configure beforeSend to add more context
    beforeSend(event) {
      // Add additional context to the event
      if (event.request) {
        event.tags = {
          ...event.tags,
          route: event.request.url,
        };
      }
      return event;
    },
  });
}
