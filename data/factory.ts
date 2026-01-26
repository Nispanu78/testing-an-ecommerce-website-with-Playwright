// ./data/factory.ts

// Import faker for generating deterministic-looking but randomized test data.
// This supports data-driven testing and reduces reliance on hardcoded values.
import { faker } from "@faker-js/faker";
import { User } from "../types/user";

// Factory function responsible for creating a valid user object.
// This follows the Factory Pattern (OOP):
// object creation logic is centralized and abstracted from test logic.
// Key points:
// export makes this function part of the module’s public API
// Any test, fixture, or helper can import and reuse it
// This aligns with good modular design: data creation is centralized
// From an architectural perspective:
// Tests consume data
// Factories produce data
// Responsibilities do not overlap
export function createUser(): User {

  // The function returns a plain object representing a user domain entity.
  // This object is typically consumed by page objects or test workflows.
  return {
    // Faker generates realistic values that satisfy validation rules,
    // improving test coverage without manual data maintenance.
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),

    // Password generation includes explicit constraints.
    // This ensures generated data complies with security and validation policies.
    password: faker.internet.password({ length: 10, prefix: "#1Aa" }),

    streetAddress: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    zip: faker.location.zipCode("#####"),

    // Hardcoded country value reflects a known business rule.
    // Keeping this in the factory ensures consistency across tests.
    country: "United States of America (the)", // Toolshop requires specific 
    // countries

    phone: faker.string.numeric(10),

    // Date of birth is delegated to a helper function.
    // This is composition: complex logic is broken into reusable units.
    dob: createDOB({ min: 18, max: 80 }),
  };
}

/**
 * Creates an array of user objects.
 * This supports bulk-data scenarios such as load testing or parameterized tests.
 *
 * @param count - Number of users to generate
 * @returns Array of user objects
 */
// What it means:
// The function returns an array
// Each element is an object (no shape guaranteed)
// This is a contract, not an implementation detail.
// Why explicitly declare the return type?
// Even though TypeScript could infer it, declaring it:
// Locks the function’s public behavior
// Prevents accidental refactors from changing the return type
// Improves readability for reviewers and consumers
export function createUsers(count: number): User[] {

  // Array.from is used to generate a fixed-length array.
  // Each element is produced by calling the user factory.
  // JavaScript defines an array-like object as:
  // An object
  // With a length property
  // And numeric indices implied by that length
  // Array.from() converts array-like objects into real arrays.
  // It generates a new array with indices from 0 to count - 1.
  // So if count = 3, the result is:
  // [undefined, undefined, undefined]
  // This is why { length: count } is sufficient — no elements are required.
  return Array.from({ length: count }, () => createUser());
}

// Factory function for generating intentionally invalid user data.
// This is useful for negative testing and validation scenarios.
export function createInvalidUser() {

  // Fields intentionally violate validation rules.
  // Centralizing invalid data prevents duplication across tests.
  return {
    firstName: "", // Empty name
    dob: "1900",   // Invalid date format
    password: "123", // Too short and weak
  };
}

// Helper function responsible for generating a date of birth
// within a specific age range.
export function createDOB(ageRange: { min: number; max: number }) {

  // Strong typing enforces that both min and max are provided.
  // This prevents accidental misuse at compile time.
  return faker.date
    .birthdate({
      min: ageRange.min,
      max: ageRange.max,

      // "age" mode ensures the generated date corresponds
      // to the specified age range rather than absolute years.
      mode: "age",
    })
    // Convert Date object to ISO string for compatibility
    // with HTML date inputs and backend APIs.
    .toISOString()
    .split("T")[0];
};