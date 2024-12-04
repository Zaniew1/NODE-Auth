import type { Config } from "@jest/types";
const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,
  testPathIgnorePatterns: ["__test__/db-handler.ts"],
  // collectCoverage: true,
  // collectCoverageFrom: ["<rootDir>/src/**/*.ts"],
};
export default config;
