module.exports = {
  moduleNameMapper: {
    "^@learnui/native$": "<rootDir>/src/index.ts"
  },
  preset: "react-native",
  testMatch: ["<rootDir>/src/**/__tests__/**/*.test.ts?(x)"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)/)"
  ]
};
