// ./playwright.config.ts

// Import Playwright test configuration utilities
// - defineConfig: provides strongly-typed configuration for Playwright
// - devices: predefined device configurations (e.g., Desktop Chrome, iPhone)
import { defineConfig, devices } from "@playwright/test";

// Import dotenv to load environment variables from .env file
import * as dotenv from "dotenv";

// Load environment variables from ".env" file silently
// Useful for sensitive data like credentials and base URLs
dotenv.config({ path: ".env", quiet: true });

// Export Playwright configuration using defineConfig
// TypeScript provides type-checking and autocomplete for config properties
export default defineConfig({

  // Directory containing test files
  testDir: "./tests",

  // Run tests in files in parallel
  fullyParallel: true,

  // Prevent accidentally committing `test.only` in CI environments
  // !! converts the value to boolean
  forbidOnly: !!process.env.CI,

  // Control retries (uncomment to retry failed tests in CI)
  // retries: process.env.CI ? 2 : 0,

  // Control number of parallel workers
  // 1 worker in CI to avoid flakiness; unlimited locally
  workers: process.env.CI ? 1 : undefined,

  // Configure reporters
  // - "html": detailed report with UI
  // - "list": concise CLI output
  reporter: [["html"], ["list"]],

  // Global `use` settings applied to all tests unless overridden in projects
  use: {
    // Always capture Playwright traces for debugging
    trace: "on",

    // Base URL for navigation
    // Allows using relative URLs in tests like page.goto("/auth/login")
    baseURL: process.env.BASE_URL || "https://practicesoftwaretesting.com",

    // Custom test ID attribute for selectors
    // Enables page.getByTestId("foo") to work
    testIdAttribute: "data-test",

    // Run browser in headless mode
    headless: true,

    // Capture video of tests, retain only on failure
    video: "retain-on-failure",

    // Take screenshots only on failure
    screenshot: "only-on-failure",
  },

  // Define multiple projects (parallel execution contexts)
  projects: [

    // -------------------------
    // Setup project for authentication
    // -------------------------
    {
      name: "setup",
      // Only match setup files (like auth.setup.ts)
      testMatch: /.*\.setup\.ts/,
    },

    // -------------------------
    // Customer1 Chromium project
    // -------------------------
    {
      name: "customer1-chromium",

      // Ensure setup runs first
      dependencies: ["setup"],

      // Use Desktop Chrome settings from predefined devices
      use: {
        ...devices["Desktop Chrome"],

        // Load authenticated storage state created in setup
        storageState: ".auth/customer1StorageState.json",
      },
    },

    // Additional projects for Firefox, WebKit, mobile emulation can be added here
  ],
});