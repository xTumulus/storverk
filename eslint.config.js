import js from "@eslint/js";
import vue from "eslint-plugin-vue";
import vueTsEslintConfig from "@vue/eslint-config-typescript";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";

export default [
  { ignores: ["dist/**", "src/generated/**", ".vite-ssg-temp/**"] },
  js.configs.recommended,
  ...vue.configs["flat/recommended"],
  ...vueTsEslintConfig(),
  {
    rules: {
      // TypeScript itself already catches undefined-reference errors; no-undef
      // duplicates that check without understanding TS types, producing false
      // positives (this is the standard recommendation when using typescript-eslint).
      "no-undef": "off",
      // Every v-html in this app renders either a bundled icon SVG
      // (icon-registry.ts) or HTML produced by our own build-time Markdown
      // pipeline — GitHub READMEs specifically go through sanitize-html
      // first (see scripts/fetch-github-readmes.ts). None of it is
      // unsanitized user input, so the rule doesn't apply here.
      "vue/no-v-html": "off",
    },
  },
  {
    files: ["src/**/*.{ts,vue}"],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ["scripts/**/*.ts", "tests/**/*.ts", "vite.config.ts", "schemas/**/*.ts"],
    languageOptions: { globals: globals.node },
  },
  eslintConfigPrettier,
];
