// ./tests/auth.setup.ts

// Import Playwright's test and expect utilities
// - `test as setup` renames the import for clarity, signaling this script 
// is a setup task
import { test as setup, expect } from "@playwright/test";

// Import LoginPage page object
// Demonstrates OOP: encapsulating page interactions in a reusable class
import { LoginPage } from "../pages/login.page";

// Define a Playwright test that sets up authentication for Customer 1
// This is not a typical end-to-end test; it's a setup step to persist login state
setup("Create Customer 1 Authentication", async ({ page, context }) => {

  // Retrieve login credentials from environment variables
  // TypeScript guarantees `email` and `password` are strings
  // Defaulting to empty string prevents undefined runtime errors
  const email = process.env.CUSTOMER_1_EMAIL || "";
  const password = process.env.CUSTOMER_1_PASSWORD || "";

  // Path to save the authenticated storage state
  // Playwright allows storing cookies, localStorage, and sessionStorage for reuse
  const customer1AuthFile = ".auth/customer1StorageState.json";

  // Instantiate the LoginPage page object
  // OOP principle: encapsulate all login interactions in one reusable class
  const loginPage = new LoginPage(page);

  // Navigate to the home page (high-level business action from POM)
  await loginPage.gotoHome();

  // Click the "Sign In" button in the top navigation menu
  // Locator-based interaction; auto-waiting ensures element is visible and enabled
  await loginPage.navMenuSignIn.click();

  // Perform login using credentials
  // Encapsulated in the LoginPage object to hide low-level input/fill/click steps
  await loginPage.login(email, password);

  /**
 * ⬇️ CRITICAL ADDITION
 * Wait until the backend confirms the user is authenticated.
 * This guarantees the auth token/cookie is attached and usable.
 */
  await page.waitForResponse(
    (response) =>
      response.url().includes("/users/me") &&
      response.status() === 200,
    { timeout: 15000 }
  );

  // Verify login was successful
  // Playwright assertions auto-wait until the condition is met or timeout occurs
  await expect(loginPage.navMenu).toContainText("Jane Doe");

  // Save storage state into the file
  // This captures cookies, localStorage, and sessionStorage
  // Later tests can reuse this state to avoid logging in repeatedly
  await context.storageState({ path: customer1AuthFile });
});