// Script to generate screenshots of resource websites at build time
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

// Import resource categories from a separate file to keep them in sync
const { resourceCategories } = require("../data/resources");

// Helper function to wait for a specified amount of time
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function captureScreenshots() {
  console.log("📸 Starting screenshot generation...");

  // Ensure the screenshots directory exists
  const screenshotsDir = path.join(process.cwd(), "public", "screenshots");
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
    console.log(`Created directory: ${screenshotsDir}`);
  }

  // Configure browser options
  const browserOptions = {
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--disable-gpu",
    ],
    timeout: 30000,
  };

  let browser;

  try {
    browser = await puppeteer.launch(browserOptions);

    let total = 0;
    let successful = 0;
    let skipped = 0;
    let failed = 0;

    // Process each resource in each category
    for (const category of resourceCategories) {
      console.log(`\nProcessing category: ${category.title}`);

      for (const resource of category.resources) {
        total++;
        const urlDomain = resource.url
          .replace(/^https?:\/\//, "")
          .replace(/\/$/, "");

        // Create a safe filename based on the URL domain
        const filename = urlDomain.replace(/[\/\.\:]/g, "-") + ".png";
        const outputPath = path.join(screenshotsDir, filename);

        // Skip if screenshot already exists and is less than a week old
        if (fs.existsSync(outputPath)) {
          const stats = fs.statSync(outputPath);
          const fileAgeInDays =
            (Date.now() - stats.mtimeMs) / (1000 * 60 * 60 * 24);

          if (fileAgeInDays < 7) {
            console.log(
              `⏭️  Skipping ${urlDomain} (screenshot is less than 7 days old)`
            );
            skipped++;
            continue;
          }
        }

        let page = null;

        try {
          console.log(`📷 Capturing ${urlDomain}...`);

          // Create a new page
          page = await browser.newPage();

          // Set user agent to avoid bot detection
          await page.setUserAgent(
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
          );

          // Set a timeout for navigation
          await page.setDefaultNavigationTimeout(30000);

          // Set viewport size for consistent screenshots
          await page.setViewport({ width: 1280, height: 800 });

          // Navigate to the URL with more robust error handling
          try {
            await page.goto(resource.url, {
              waitUntil: ["load", "networkidle2"],
              timeout: 30000,
            });
          } catch (navigationError) {
            console.warn(
              `⚠️ Navigation issue with ${urlDomain}: ${navigationError.message}`
            );
            console.log(`Trying with a simpler approach...`);

            // Try with a simpler approach if the first method fails
            await page.goto(resource.url, {
              waitUntil: "domcontentloaded",
              timeout: 30000,
            });
          }

          // Wait a bit for any animations or delayed content to load
          await wait(2000);

          // Take screenshot
          await page.screenshot({
            path: outputPath,
            type: "png",
            fullPage: false,
          });

          successful++;
          console.log(`✅ Captured ${urlDomain}`);
        } catch (error) {
          failed++;
          console.error(`❌ Failed to capture ${urlDomain}: ${error.message}`);

          // Create a fallback image with error message
          if (!fs.existsSync(outputPath)) {
            try {
              // Create a simple fallback image for errors
              const fallbackPage = await browser.newPage();
              await fallbackPage.setContent(`
                <html>
                  <body style="margin:0;padding:0;display:flex;align-items:center;justify-content:center;height:100vh;background:linear-gradient(135deg, #f44336, #e91e63);color:white;font-family:Arial,sans-serif;text-align:center;">
                    <div>
                      <h1 style="font-size:28px;margin:0;">${resource.name}</h1>
                      <p style="margin:10px 0 0;opacity:0.8;">${urlDomain}</p>
                    </div>
                  </body>
                </html>
              `);
              await fallbackPage.setViewport({ width: 1280, height: 800 });
              await fallbackPage.screenshot({
                path: outputPath,
                type: "png",
              });
              await fallbackPage.close();
              console.log(`📄 Created fallback image for ${urlDomain}`);
            } catch (fallbackError) {
              console.error(
                `❌ Failed to create fallback image: ${fallbackError.message}`
              );
            }
          }
        } finally {
          // Always close the page to free resources
          if (page) {
            try {
              await page.close();
            } catch (closeError) {
              console.warn(
                `Warning: Error closing page: ${closeError.message}`
              );
            }
          }
        }
      }
    }

    console.log("\n📸 Screenshot generation complete!");
    console.log(
      `Total: ${total}, Successful: ${successful}, Skipped: ${skipped}, Failed: ${failed}`
    );
  } catch (error) {
    console.error("❌ Fatal error in screenshot generation:", error);
  } finally {
    // Always close the browser to avoid zombie processes
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error("Error closing browser:", closeError);
      }
    }
  }
}

// Run the function
captureScreenshots()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error in screenshot generation:", error);
    process.exit(1);
  });
