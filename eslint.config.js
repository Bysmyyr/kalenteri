export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        // Browser globals
        window: "readonly",
        document: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        setInterval: "readonly",
        clearTimeout: "readonly",
        clearInterval: "readonly",
        URLSearchParams: "readonly",
        URL: "readonly",
        fetch: "readonly",
        // Libraries
        L: "readonly", // Leaflet
        // Node.js (for geocode scripts)
        require: "readonly",
        module: "readonly",
        __dirname: "readonly",
        process: "readonly"
      }
    },
    rules: {
      // Syntax errors only - don't enforce style
      "no-undef": "error",
      "no-unused-vars": "warn",
      "no-dupe-keys": "error",
      "no-dupe-args": "error",
      "no-duplicate-case": "error",
      "no-unreachable": "error",
      "no-constant-condition": "error",
      "constructor-super": "error",
      "valid-typeof": "error"
    }
  },
  {
    // Don't check node_modules or dist
    ignores: ["node_modules/**", "dist/**", "**/*.min.js"]
  }
];
