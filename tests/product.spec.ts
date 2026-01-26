// ./tests/product.spec.ts

// Import ProductPage page object
// Demonstrates OOP: encapsulating all product page interactions
import { ProductPage } from "../pages/product.page";

// Import test runner and expect assertions
// Here we import from a custom fixture that provides adminAuthPage
import { test, expect } from "../fixtures/adminAuth.fixture";

// -------------------------
// Test 1: Standard product add to cart
// -------------------------
test("Add product to cart", async ({ page }) => {

  // Instantiate ProductPage with the provided Playwright page
  // OOP: Encapsulates all locators and actions on the product page
  const productPage = new ProductPage(page);

  // Navigate to home page using page object method
  await productPage.gotoHome();

  // Select a category using high-level page object method
  await productPage.selectCategory("Hand Tools");

  // Click the first product in the list
  await productPage.clickProductByIndex(0);

  // Assert that the product name is correct
  // Playwright's Locator assertions auto-wait for stability
  await expect(productPage.productName).toHaveText("Combination Pliers");

  // Click the "Add to Cart" button
  await productPage.addToCartButton.click();

  // Verify that the "Product added to shopping cart." message appears
  await expect(productPage.addedToCartMessage).toHaveText(
    "Product added to shopping cart."
  );

  // Wait for the message to disappear (up to 10 seconds)
  // Advanced Playwright concept: using timeout options for dynamic elements
  await expect(productPage.addedToCartMessage).not.toBeVisible({
    timeout: 10000,
  });

  // Verify the cart quantity is updated
  await expect(productPage.navCartQuantity).toHaveText("1");
});

// -------------------------
// Test 2: Product add to cart using admin-authenticated fixture
// -------------------------
test("Add product to cart with admin auth fixture", async ({
  adminAuthPage, // Injected fixture: a pre-authenticated page object
}) => {

  // Instantiate ProductPage with the authenticated page
  const productPage = new ProductPage(adminAuthPage);

  // Navigate to home page
  await productPage.gotoHome();

  // Select category
  await productPage.selectCategory("Hand Tools");

  // Click first product
  await productPage.clickProductByIndex(0);

  // Assert product name
  await expect(productPage.productName).toHaveText("Combination Pliers");

  // Add product to cart
  await productPage.addToCartButton.click();

  // Assert success message
  await expect(productPage.addedToCartMessage).toHaveText(
    "Product added to shopping cart."
  );

  // Wait for success message to disappear (up to 10 seconds)
  await expect(productPage.addedToCartMessage).not.toBeVisible({
    timeout: 10000,
  });

  // Verify cart quantity
  await expect(productPage.navCartQuantity).toHaveText("1");
});