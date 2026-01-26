// ./tests/bulk.spec.ts

// Import Playwright test runner and assertions
// `test` is the main test function, `expect` provides assertion helpers
import { test, expect } from "@playwright/test";

// Import the user factory for generating test data
// Centralizes test data creation and enforces consistency
import { createUsers } from "../data/factory";

// Import the RegistrationPage page object
// Demonstrates OOP: encapsulating all registration page interactions
import { RegistrationPage } from "../pages/registration.page";

// Group related tests into a suite using describe
// This provides better organization and reporting in Playwright
test.describe("Load test", () => {

  // Define a single test for bulk user registration
  // `browser` is injected by Playwright as a built-in fixture
  test("bulk user registration", async ({ browser }) => {

    // Generate 3 users for the simulation using the factory
    // TypeScript ensures each user is typed correctly (after 
    // defining a User interface)
    const users = createUsers(3);

    // Map over users to create an array of async registration promises
    // Each registration runs in its own isolated context for concurrency
    const registrations = users.map(async (user) => {

      // Declare browser context variable
      // Must be initialized before use in finally to properly close
      let context;

      try {
        // Create a new isolated browser context for each user
        // Playwright context acts like an incognito window:
        // - Separate cookies, localStorage, sessionStorage
        context = await browser.newContext();

        // Open a new page (tab) in this context
        const page = await context.newPage();

        // Instantiate RegistrationPage object
        // OOP principle: encapsulate all page-specific behavior and selectors
        const registrationPage = new RegistrationPage(page);

        // Navigate to the registration page
        // This uses high-level methods from the page object for readability
        await registrationPage.goto();

        // Fill in all registration fields using page object locators
        // Each field is a Locator (Playwright concept) which is lazy and 
        // auto-waiting
        await registrationPage.firstNameInput.fill(user.firstName);
        await registrationPage.lastNameInput.fill(user.lastName);
        await registrationPage.dobInput.fill(user.dob);
        await registrationPage.streetInput.fill(user.streetAddress);
        await registrationPage.postalCodeInput.fill(user.zip);
        await registrationPage.cityInput.fill(user.city);
        await registrationPage.stateInput.fill(user.state);

        // Select country from <select> element
        // selectOption with { label } ensures resilience if value/index changes
        await registrationPage.countrySelect.selectOption({
          label: user.country,
        });

        await registrationPage.phoneInput.fill(user.phone);
        await registrationPage.emailInput.fill(user.email);
        await registrationPage.passwordInput.fill(user.password);

        // Submit the registration form
        // Encapsulation in RegistrationPage makes tests cleaner
        await registrationPage.submitRegistration();

        // Logging the registration action for debugging/concurrency observation
        console.log(
          `Registering ${user.firstName} ${user.lastName} concurrently...`
        );

        // Verify the user is redirected to login page after registration
        // Playwright assertions auto-wait until the condition passes
        await expect(page).toHaveURL(/auth\/login/);

      } finally {
        // Close the browser context to release memory and isolate sessions
        // Non-null assertion `!` informs TypeScript that context is initialized
        await context!.close();
      }
    });

    // Run all registration promises concurrently
    // Promise.all allows simulating bulk registration at the same time
    await Promise.all(registrations);
  });
});