import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function TestSentry() {
  const testClientError = () => {
    throw new Error("Client Test Error");
  };

  const testApiError = async (type: string) => {
    await fetch(`/api/test-sentry?error=${type}`);
  };

  const testCustomContext = () => {
    try {
      throw new Error("Error with custom context");
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setTag("custom_tag", "test");
        scope.setExtra("custom_data", { some: "data" });
        Sentry.captureException(error);
      });
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Sentry Test Page</h1>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl mb-2">Client-side Tests</h2>
          <button
            onClick={testClientError}
            className="bg-red-500 text-white px-4 py-2 rounded mr-2"
          >
            Trigger Client Error
          </button>

          <button
            onClick={testCustomContext}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Test Custom Context
          </button>
        </div>

        <div>
          <h2 className="text-xl mb-2">API Tests</h2>
          <button
            onClick={() => testApiError("sync")}
            className="bg-yellow-500 text-white px-4 py-2 rounded mr-2"
          >
            Test Sync API Error
          </button>

          <button
            onClick={() => testApiError("async")}
            className="bg-green-500 text-white px-4 py-2 rounded mr-2"
          >
            Test Async API Error
          </button>

          <button
            onClick={() => testApiError("custom")}
            className="bg-purple-500 text-white px-4 py-2 rounded"
          >
            Test Custom API Error
          </button>
        </div>
      </div>
    </div>
  );
}
