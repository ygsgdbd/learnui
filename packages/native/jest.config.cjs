module.exports = {
  moduleNameMapper: {
    "^@learnui/native$": "<rootDir>/src/index.ts",
    "^uniwind$": "<rootDir>/src/__mocks__/uniwind.ts"
  },
  preset: "react-native",
  testMatch: ["<rootDir>/src/**/__tests__/**/*.test.ts?(x)"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)/)"
  ]
};
