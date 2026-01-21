import { FlatCompatCompat } from "@eslint/eslintrc";
import eslintConfigNextCoreWebVitals from "eslint-config-next/core-web-vitals.js";
import eslintConfigNextTypeScript from "eslint-config-next/typescript.js";

const flatConfig = [
  ...FlatCompatCompat.extends(eslintConfigNextCoreWebVitals.default),
  ...FlatCompatCompat.extends(eslintConfigNextTypeScript.default),
  {
    rules: {
      "@next/next/no-html-import-for-document": "off",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "node_modules/**",
    ],
  },
];

export default flatConfig;
