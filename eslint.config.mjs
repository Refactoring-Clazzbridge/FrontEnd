import { defineConfig } from "eslint-define-config";
import eslintPluginReact from "eslint-plugin-react";
import babelParser from "@babel/eslint-parser";

export default defineConfig([
  {
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: {
      parser: babelParser,  // import로 불러온 babelParser 사용
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ["@babel/preset-react"], // JSX를 지원하기 위한 설정
        },
      },
    },
    plugins: {
      react: eslintPluginReact,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "no-var": "error",
      "react/jsx-filename-extension": [1, { extensions: [".js", ".jsx"] }],
      "react/prop-types": "off",
    },
  },
]);