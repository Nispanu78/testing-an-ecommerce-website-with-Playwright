// ./tests/registration.spec.ts

// Import Playwright test runner and assertion library
import { test, expect } from "@playwright/test";

// Import test data factories
// - createUser: generates valid user
// - createInvalidUser: generates invalid user for negative tests
// - createDOB: generates date of birth within age range
import { createUser, createInvalidUser, createDOB } from "../data/factory";

// Import RegistrationPage page object
// Demonstrates OOP: encapsulates page interactions and selectors
import { RegistrationPage } from "../pages/registration.page";

// Group all registration-related tests using describe
test.describe("Practice Software Testing Site Tests", async () => {

  // Variables for storing generated users
  // TypeScript type `any` is used here, but ideally should use a `User` interface
  let user: any;
  let invalidUser: any;

  // Disable default storage state for these tests
  // Ensures tests start with a clean session
  test.use({ storageState: undefined });

  // Runs before each test
  test.beforeEach(async () => {
    // Generate a fresh invalid user for negative tests
    invalidUser = createInvalidUser();

    // Generate a fresh valid user for positive tests
    user = createUser();
  });

  // -------------------------
  // Test: Successful user registration
  // -------------------------
  test("Successful user registration", async ({ page }) => {

    // Instantiate page object for registration page
    // OOP principle: encapsulates locators and page-level methods
    const registrationPage = new RegistrationPage(page);

    // Navigate to registration page
    await registrationPage.goto();

    // Clear any existing local/session storage and cookies
    // Ensures test isolation
    await registrationPage.clearStorage(page);

    // Fill personal information
    await registrationPage.firstNameInput.fill(user.firstName);
    await registrationPage.lastNameInput.fill(user.lastName);
    await registrationPage.dobInput.fill(user.dob);

    // Fill address information
    await registrationPage.streetInput.fill(user.streetAddress);
    await registrationPage.postalCodeInput.fill(user.zip);
    await registrationPage.cityInput.fill(user.city);
    await registrationPage.stateInput.fill(user.state);
    await registrationPage.countrySelect.selectOption({ label: user.country });

    // Fill contact and login info
    await registrationPage.phoneInput.fill(user.phone);
    await registrationPage.emailInput.fill(user.email);
    await registrationPage.passwordInput.fill(user.password);

    // Wait for backend API response to confirm registration
    // Advanced Playwright: intercept network responses for verification
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/users/register") && response.status() === 201
    );

    // Submit registration form
    await registrationPage.registerSubmitButton.click();

    // Wait for the network response to ensure registration succeeded
    await responsePromise;

    // Verify user is redirected to login page after registration
    await expect(page).toHaveURL(/auth\/login/);
  });

  // -------------------------
  // Test: Negative registration with invalid data
  // -------------------------
  test("Negative registration with invalid data", async ({ page }) => {

    const registrationPage = new RegistrationPage(page);
    await registrationPage.goto();

    // Clear storage to ensure clean test state
    await registrationPage.clearStorage(page);

    // Fill only the invalid fields
    await registrationPage.firstNameInput.fill(invalidUser.firstName); // empty string
    await registrationPage.dobInput.fill(invalidUser.dob); // invalid date
    await registrationPage.passwordInput.fill(invalidUser.password); // too short

    // Submit form
    await registrationPage.submitRegistration();

    // Verify that validation error messages are visible
    // Playwright assertions auto-wait for the elements to appear
    await expect(page.getByText("First name is required")).toBeVisible();
    await expect(page.getByText("Please enter a valid date")).toBeVisible();
    await expect(
      page.getByText("Password must be minimal 6 characters long.")
    ).toBeVisible();
  });
});
