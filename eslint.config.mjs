import js from "@eslint/js";
import ts from "typescript-eslint";
import globals from "globals";

export default ts.config(
    js.configs.recommended,
    ...ts.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.browser,
                ...globals.node
            }
        }
    },
    {
        files: ["**/*.ts", "**/*.js"],

        languageOptions: {
            parserOptions: {
                parser: ts.parser
            }
        },
        rules: {
            "@typescript-eslint/no-unused-expressions": "off",
            "@typescript-eslint/ban-ts-comment": "off",
            "@typescript-eslint/no-explicit-any": "off",
            // あまりにも現状のコードが汚すぎて修正しきれない
            "@typescript-eslint/no-unused-vars": "warn",
            "indent": ["error", 4],
            "quotes": ["error", "double"],
            "semi": ["error", "always"],
        }
    },
    {
        ignores: [
            "build/",
            "node_modules/",
            "dist/",
            "packages/backend/migration/",
            "packages/client/assets",
            "scripts/"
        ]
    }
);
