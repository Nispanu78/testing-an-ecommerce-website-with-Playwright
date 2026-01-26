// ./pages/registration.page.ts

// Import Playwright core types.
// These types describe browser-side concepts but are consumed in Node.js.
// They enable strong typing without changing runtime behavior.
import { Locator, Page } from "@playwright/test";

// Import the shared base page.
// This establishes an inheritance relationship:
// RegistrationPage is a specialized form of BasePage.
import { BasePage } from "./base.page";

// RegistrationPage models the user registration workflow.
// It encapsulates all selectors and interactions related to registration,
// keeping tests readable and implementation details isolated.
export class RegistrationPage extends BasePage {

  // Each form field is represented as a Locator.
  // Declaring them as `readonly` enforces immutability after construction,
  // which aligns with safe object-oriented design.
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly dobInput: Locator;
  readonly streetInput: Locator;
  readonly postalCodeInput: Locator;
  readonly cityInput: Locator;
  readonly stateInput: Locator;
  readonly countrySelect: Locator;
  readonly phoneInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly registerSubmitButton: Locator;

  // Constructor receives the Playwright Page instance from the test layer.
  // This is dependency injection:
  // - Tests control browser lifecycle
  // - Page objects focus only on UI behavior
  constructor(page: Page) {

    // Initialize shared BasePage state before defining page-specific elements.
    super(page);

    // Locators are defined once and reused.
    // Playwright Locators are lazy and auto-waiting, which:
    // - Avoids race conditions
    // - Automatically retries until elements are actionable
    this.firstNameInput = page.getByTestId("first-name");
    this.lastNameInput = page.getByTestId("last-name");
    this.dobInput = page.getByTestId("dob");
    this.streetInput = page.getByTestId("street");
    this.postalCodeInput = page.getByTestId("postal_code");
    this.cityInput = page.getByTestId("city");
    this.stateInput = page.getByTestId("state");
    this.countrySelect = page.getByTestId("country");
    this.phoneInput = page.getByTestId("phone");
    this.emailInput = page.getByTestId("email");
    this.passwordInput = page.getByTestId("password");
    this.registerSubmitButton = page.getByTestId("register-submit");
  }

  // Page-specific navigation method.
  // Encapsulates how this page is reached, keeping tests declarative.
  async goto() {

    // Relative URL relies on the Playwright baseURL configuration.
    // Navigation automatically waits for page load to complete.
    await this.page.goto("/auth/register");
  }

  // Grouped interaction method representing a logical user action.
  // This improves readability and promotes reuse across tests.
  async fillPersonalInfo(firstName: string, lastName: string, dob: string) {

    // fill() clears the field and types the value,
    // auto-waiting for visibility and editability.
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.dobInput.fill(dob);
  }

  // Encapsulates address-related inputs into a single operation.
  // This reflects business intent rather than low-level UI steps.
  async fillAddressInfo(
    streetAddress: string,
    postalCode: string,
    city: string,
    state: string,
    country: string
  ) {

    await this.streetInput.fill(streetAddress);
    await this.postalCodeInput.fill(postalCode);
    await this.cityInput.fill(city);
    await this.stateInput.fill(state);

    // selectOption interacts with <select> elements.
    // Selecting by label is more resilient than selecting by value or index.
    await this.countrySelect.selectOption({ label: country });
  }

  // Contact information may include optional data.
  // TypeScript enforces the method contract at compile time.
  async fillContactInfo(phone: string, email: string) {

    // Defensive default prevents passing undefined to fill().
    // This avoids runtime errors and reflects real-world optional input.
    await this.phoneInput.fill(phone || "");
    await this.emailInput.fill(email);
  }

  // Isolated password entry method.
  // Separation allows reuse in negative or partial registration scenarios.
  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  // Single-responsibility method for form submission.
  async submitRegistration() {

    // click() auto-waits for the button to become actionable
    // and handles transient UI states such as animations.
    await this.registerSubmitButton.click();
  }

  // High-level workflow method that completes the full registration.
  // This method accepts a structured object instead of many parameters,
  // improving readability, scalability, and type safety.
  async registerUser(user: {
    firstName: string;
    lastName: string;
    dob: string;
    streetAddress: string;
    zip: string;
    city: string;
    state: string;
    country: string;
    phone?: string; // Optional property enforced by TypeScript
    email: string;
    password: string;
  }) {

    // The workflow is composed of smaller, reusable steps.
    // This is composition within an object-oriented design.
    await this.fillPersonalInfo(user.firstName, user.lastName, user.dob);
    await this.fillAddressInfo(
      user.streetAddress,
      user.zip,
      user.city,
      user.state,
      user.country
    );
    await this.fillContactInfo(user.phone || "", user.email);
    await this.fillPassword(user.password);
    await this.submitRegistration();
  }
};