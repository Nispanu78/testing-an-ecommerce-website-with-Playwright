// ./pages/base.page.ts

// Import Playwright core types.
// - Page represents a single browser tab or window.
// - Locator is Playwright’s lazy, auto-waiting element abstraction.
import { Page, Locator } from "@playwright/test";

// BasePage acts as a foundational Page Object.
// In OOP terms, this class is intended to be extended by more specific page classes
// (e.g., HomePage, ProductPage) to promote reuse and encapsulation.
export class BasePage {

  // `readonly` enforces immutability after construction.
  // This is a TypeScript feature that prevents reassignment,
  // improving reliability and intent clarity in test architecture.
  readonly page: Page;

  // Each UI element is modeled as a Locator.
  // This follows the Page Object Model (POM) pattern,
  // encapsulating selectors and interactions in one place.
  readonly navMenu: Locator;
  readonly navMenuHome: Locator;
  readonly navMenuCategories: Locator;
  readonly navCategoryList: Locator;
  readonly navMenuContact: Locator;
  readonly navMenuSignIn: Locator;
  readonly navMenuLanguageSelect: Locator;
  readonly navCart: Locator;
  readonly navCartQuantity: Locator;

  // Constructor dependency injection:
  // The Page instance is injected from the test layer,
  // decoupling page objects from browser lifecycle management.
  // The Page object is created and controlled by the test, not by 
  // the page class itself.
  // The test then passes that Page into the constructor of BasePage.
  // Because of this:
  // The page object does not open browsers, create tabs, or manage sessions
  // It only uses the Page it is given to interact with the UI
  // Browser setup and teardown stay in one place (tests or fixtures)
  // The page class stays focused on page behavior, not infrastructure.
  // In short:
  // Tests manage the browser lifecycle; page objects only describe how to 
  // use a page.
  constructor(page: Page) {
    this.page = page;

    // Locator initialization is done once in the constructor.
    // Playwright Locators are *lazy* — they do not query the DOM immediately,
    // which enables automatic retries, visibility checks, and stability.
    
    // Using getByTestId aligns with Playwright best practices:
    // - Stable selectors
    // - Resistant to UI/layout changes
    this.navMenu = page.getByTestId("nav-menu");
    this.navMenuHome = page.getByTestId("nav-home");
    this.navMenuCategories = page.getByTestId("nav-categories");

    // getByLabel targets elements associated with accessible labels.
    // This improves test resilience and enforces accessibility-aware automation.
    this.navCategoryList = page.getByLabel("nav-categories");

    this.navMenuContact = page.getByTestId("nav-contact");
    this.navMenuSignIn = page.getByTestId("nav-sign-in");
    this.navMenuLanguageSelect = page.getByTestId("language-select");
    this.navCart = page.getByTestId("nav-cart");
    this.navCartQuantity = page.getByTestId("cart-quantity");
  }

  // Navigation behavior is abstracted into a method.
  // This supports reuse and keeps test files declarative.
  async gotoHome() {
    // Playwright automatically waits for the navigation to complete.
    // Relative URLs leverage the baseURL configuration from playwright.config.ts.
    await this.page.goto("/");
  }

  // Business-level action rather than low-level UI steps.
  // This aligns with high-quality POM design by expressing intent.
  async selectCategory(category: string) {

    // Locator actions auto-wait for:
    // - Element attachment
    // - Visibility
    // - Enabled state
    await this.navMenuCategories.click();

    // Dynamic locator resolution using runtime data.
    // Template literals are a TypeScript/JavaScript feature for 
    // safe string interpolation.
    await this.navCategoryList.getByText(`${category}`).click();
  }

  // Storage cleanup is centralized to avoid test pollution.
  // Note: passing `page` here allows flexibility if called from hooks
  // where `this.page` may not be available.
  async clearStorage(page: Page) {

    // page.evaluate executes JavaScript in the browser context.
    // This bridges the Node.js test runner and the in-browser environment.
    // Conceptually:
    // Page = Playwright’s control interface (Node.js side)
    // evaluate() = bridge between Node.js and the browser
    // localStorage / sessionStorage = browser-native storage mechanisms
    // You can think of it like this:
    // Playwright says: “Run this code inside the page”
    // The browser says: “Here are my built-in APIs 
    // The storage is cleared by the browser itself, not by Playwright
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Context-level cookie clearing ensures isolation across tests.
    // This is especially important in parallel execution.
    await page.context().clearCookies();

    // Reload guarantees that cleared state is reflected in the DOM.
    await page.reload();
  }
};
