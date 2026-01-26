// ./pages/login.page.ts

// Import Playwright types only for type-checking.
// The `type` keyword is a TypeScript-specific optimization that ensures
// these imports are erased at compile time and not included in the runtime bundle.
import { type Locator, type Page } from "@playwright/test";

// Import the base page object.
// This establishes an inheritance relationship (OOP: "is-a").
// LoginPage *is a* BasePage with additional, page-specific behavior.
import { BasePage } from "./base.page";

// LoginPage extends BasePage to reuse shared navigation, utilities,
// and the injected Page instance.
export class LoginPage extends BasePage {

  // Page-specific Locators are declared here.
  // `readonly` enforces immutability after construction,
  // preventing accidental reassignment during test execution.
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  // Constructor receives the Playwright Page from the test layer.
  // This maintains separation of concerns:
  // - Tests manage browser lifecycle
  // - Page objects model UI behavior
  constructor(page: Page) {

    // `super(page)` calls the BasePage constructor.
    // This ensures shared properties (like `this.page` and navigation locators)
    // are initialized before this subclass adds its own state.
    super(page);

    // Locators are initialized once and reused.
    // Playwright Locators are lazy and auto-waiting, meaning:
    // - No DOM query happens here
    // - Resolution occurs at interaction time with built-in retries
    this.emailInput = page.getByTestId("email");
    this.passwordInput = page.getByTestId("password");
    this.loginButton = page.getByTestId("login-submit");
  }

  // Page-specific navigation method.
  // Although BasePage has `gotoHome`, this method represents
  // polymorphic intent: each page defines how it is reached.
  async goto() {

    // Relative URL relies on Playwright's baseURL configuration.
    // Playwright automatically waits for the navigation to complete.
    await this.page.goto("/auth/login");
  }

  // High-level business action that represents a user intent.
  // This keeps tests readable and prevents duplication of low-level steps.
  async login(email: string, password: string) {

    // fill() clears the input before typing and auto-waits
    // for the element to be visible and editable.
    await this.emailInput.fill(email);

    await this.passwordInput.fill(password);

    // click() auto-waits for the element to be actionable
    // and handles timing issues such as animations or delayed rendering.
    await this.loginButton.click();
  }
};
