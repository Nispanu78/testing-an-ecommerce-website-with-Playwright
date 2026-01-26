// ./fixtures/adminAuth.fixture.ts

// Import the base Playwright test object, assertions, and Page type
// - `test as base` allows extending the test fixture without overwriting 
// the original
import { test as base, expect, Page } from "@playwright/test";

// Import the LoginPage page object
// This demonstrates OOP: encapsulating page interactions in a dedicated class
import { LoginPage } from "../pages/login.page";

// Extend Playwright’s base test with a custom fixture
// This fixture provides a page pre-authenticated as an admin
export const test = base.extend<{ adminAuthPage: Page }>({

  // `adminAuthPage` is the fixture key that tests can access
  // TypeScript enforces that its type is `Page`
  // How Playwright fixture composition works
  // Fixtures can depend on other fixtures by listing them as parameters.
  // Playwright resolves these dependencies automatically and injects the values.
  // Here:
  // browser → built-in Playwright fixture
  // use → callback to provide the fixture to the test
  // adminAuthPage → your custom fixture built on top of browser built-in fixture
  // adminAuthPage fixture reuses the existing browser instead of launching a new 
  // one manually.
  // You can layer fixtures: e.g., adminAuthPage depends on browser, while 
  // browser itself depends on the Playwright test runner’s global setup.
  // Promotes DRY and modular test design: you don’t need to create a 
  // new browser per fixture.
  adminAuthPage: async ({ browser }, use) => {

    // File path to persist authenticated storage state
    // Playwright can save cookies, localStorage, and sessionStorage 
    // to reuse sessions
    const storageStatePath = ".auth/adminStorageState.json";

    // Step 1: Create a temporary browser context for initial login
    // OOP concept: using the LoginPage class for encapsulated login behavior
    const setupContext = await browser.newContext();
    const setupPage = await setupContext.newPage();
    const loginPage = new LoginPage(setupPage);

    // Step 2: Navigate to login page and perform admin login
    // Business-level methods from the LoginPage POM keep tests clean
    await loginPage.goto();
    await loginPage.login(
      process.env.ADMIN_EMAIL!,   // Non-null assertion (!) tells TypeScript 
      // this env variable exists
      process.env.ADMIN_PASSWORD!
    );

    // Step 3: Verify login success by checking UI content
    // Playwright’s expect supports auto-waiting for elements
    await expect(loginPage.navMenu).toContainText("John Doe");

    // Step 4: Save authenticated state for reuse
    // This captures cookies, localStorage, sessionStorage
    // Advanced Playwright concept: state can be reused across 
    // contexts or test runs
    await setupContext.storageState({ path: storageStatePath });
    await setupContext.close(); // Close the temporary login context

    // Step 5: Create a new context that starts already authenticated
    // This avoids logging in for every test, improving performance
    const context = await browser.newContext({
      storageState: storageStatePath,
    });

    // Open a page in the new authenticated context
    const page = await context.newPage();

    // Step 6: Provide the fixture to the test
    // `use(page)` passes the pre-authenticated page to any test that requests it
    await use(page);

    // Step 7: Cleanup
    // Ensures the context and page are properly disposed after the test
    await context.close();
  },
});

// Re-export expect to allow tests to import from this fixture file
// This is convenient for consistency and reduces repeated imports
export { expect } from "@playwright/test";

// Typical flow inside the fixture

// 1. browser.newContext() → create an isolated session
// 2. new LoginPage(setupPage) → use OOP page object
// 3. Login and save storageState
// 4. Close temporary context
// 5. Reopen a new context using the saved state
// 6. use(page) → make it available to tests
// 7. All of this leverages the browser fixture provided by Playwright.