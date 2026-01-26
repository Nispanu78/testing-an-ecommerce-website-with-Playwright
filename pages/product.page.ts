// ./pages/product.page.ts

// Import Playwright core types.
// Unlike `import type`, these imports may exist at runtime, not only at compile time
// which is acceptable when the module already depends on Playwright.
import { Locator, Page } from "@playwright/test";

// Import the shared base page.
// This establishes an inheritance relationship:
// ProductPage extends BasePage to reuse navigation, utilities, 
// and the Page instance.
import { BasePage } from "./base.page";

// ProductPage represents product-related UI behavior.
// In OOP terms, it specializes BasePage with product-specific state and actions.
export class ProductPage extends BasePage {

  // Collection locator representing multiple product cards.
  // Locators can represent zero, one, or many elements without immediate DOM 
  // evaluation.
  readonly productCards: Locator;

  // Locator for a user-facing confirmation message.
  readonly addedToCartMessage: Locator;

  // Locator for the product name element.
  readonly productName: Locator;

  // Locator for the primary call-to-action button.
  readonly addToCartButton: Locator;

  // Constructor receives the Playwright Page from the test layer.
  // This follows dependency injection and keeps browser lifecycle management 
  // external.
  constructor(page: Page) {

    // Initialize shared BasePage state before adding product-specific locators.
    super(page);

    // CSS-based locator targeting a list of product cards.
    // page.locator() supports advanced features such as filtering, chaining,
    // and index-based selection without querying the DOM immediately.
    this.productCards = page.locator(".card");

    // Accessible label-based locator for system feedback.
    // This avoids brittle selectors tied to markup structure.
    this.addedToCartMessage = page.getByLabel(
      "Product added to shopping cart."
    );

    this.productName = page.getByTestId("product-name");
    this.addToCartButton = page.getByTestId("add-to-cart");
  }

  // Page-specific navigation method.
  // The optional parameter (`productId?: string`) is a TypeScript feature
  // allowing the caller to omit the argument without causing a compile-time error.
  async goto(productId?: string) {

    // Template string constructs the URL dynamically.
    // Playwright automatically waits for navigation completion.
    await this.page.goto(`/product/${productId}`);
  }

  // Encapsulated interaction representing user intent:
  // selecting a product from a list by position.
  async clickProductByIndex(index: number) {

    // nth() resolves the locator to a specific element by index.
    // The element is still lazily evaluated and auto-waited at interaction time.
    const product = this.productCards.nth(index);

    // click() ensures the element is visible, stable, and enabled before acting.
    await product.click();
  }
};
