# Scripts

This directory contains utility scripts for the UrantiaHub application.

## Screenshot Generator

The `generate-screenshots.js` script captures screenshots of all websites listed in the community resources page. These screenshots are used to provide visual previews on the Community Resources page.

### How It Works

1. The script reads the resource data from `data/resources.js`
2. For each website URL, it:
   - Creates a browser instance using Puppeteer
   - Navigates to the URL
   - Captures a screenshot
   - Saves it to `/public/screenshots/`

### Usage

Run the script manually:

```bash
npm run screenshots
```

Or include it as part of the build process:

```bash
npm run build:with-screenshots
```

### Features

- **Caching**: Screenshots less than 7 days old are not regenerated
- **Error handling**: If a screenshot fails, the page will fall back to showing a gradient with the first letter of the resource name
- **Logging**: The script provides detailed logs about the screenshot generation process

### Adding New Resources

To add a new resource:

1. Update the `data/resources.js` file with the new resource details
2. Run the screenshot generator script
3. The new resource will appear on the Community Resources page with its screenshot

### Notes

- Screenshots are excluded from git using the `.gitignore` file to avoid bloating the repository
- They will be regenerated during the build process
- If you want to force regeneration of a specific screenshot, delete it from the `/public/screenshots/` directory
