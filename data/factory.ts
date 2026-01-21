// ./data/factory.ts
import { faker } from "@faker-js/faker";
export function createUser(_overrides = {}) {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password({ length: 10, prefix: "#1Aa" }),
    streetAddress: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    zip: faker.location.zipCode("#####"),
    country: "United States of America (the)", // Toolshop requires specific countries
    phone: faker.string.numeric(10),
    dob: createDOB({ min: 18, max: 80 }),
  };
}
/**
 * Creates an array of user objects.
 * @param {number} count - Number of users to generate
 * @returns {Array<object>} Array of user objects
 */
export function createUsers(count: number): Array<object>
 {
  return Array.from({ length: count }, () => createUser());
}
export function createInvalidUser() {
  return {
    firstName: "", // Empty name
    dob: "1900", // Invalid format
    password: "123", // Too short
  };
}
export function createDOB(ageRange: { min: number; max: number }) {
  return faker.date
    .birthdate({ min: ageRange.min, max: ageRange.max, mode: "age" })
    .toISOString()
    .split("T")[0];
};