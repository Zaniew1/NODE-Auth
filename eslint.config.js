import tsEslintPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
    {
      files: ["**/*.ts", "**/*.tsx"], // Apply to TypeScript files
      languageOptions: {
        parser: tsParser, // Use TypeScript parser
        parserOptions: {
          ecmaVersion: 2020,
          sourceType: "module",
        },
      },
      plugins: {
        "@typescript-eslint": tsEslintPlugin, // Use the TypeScript ESLint plugin
      },
      rules: {
        ...tsEslintPlugin.configs.recommended.rules, // Use the recommended rules
        "@typescript-eslint/no-explicit-any": "warn", // Customize additional rules
        "@typescript-eslint/no-unused-vars": [
            "warn",
            {
              "argsIgnorePattern": "^_",
              "varsIgnorePattern": "^_"
            }
          ]
      },
    },
  ];