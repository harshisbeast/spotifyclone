import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "@typescript-eslint/eslint-plugin";  // Corrected to use the correct TypeScript ESLint plugin

export default tseslint.config({
  ignores: ["dist"],  // Ignore build output folder (e.g., dist)
}, {
  extends: [
    js.configs.recommended, // ESLint recommended rules
    "@typescript-eslint/recommended", // TypeScript recommended rules
  ],
  files: ["**/*.{ts,tsx}"],  // Apply to TypeScript files
  languageOptions: {
    ecmaVersion: 2020, // Using modern JavaScript features (ES2020)
    globals: globals.browser,  // Define browser globals
  },
  plugins: {
    "react-hooks": reactHooks, // React hooks plugin for better management
    "react-refresh": reactRefresh, // React Refresh plugin (for fast refresh)
  },
  rules: {
    ...reactHooks.configs.recommended.rules,  // Add React Hooks best practices
    "react-refresh/only-export-components": ["warn", { allowConstantExport: true }], // Custom React Refresh rule
    "@typescript-eslint/no-explicit-any": "off",  // Allow `any` type (you can change this based on your preferences)
  },
});
