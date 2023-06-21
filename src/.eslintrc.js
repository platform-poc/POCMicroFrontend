name: ESLint Analysis

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  eslint-analysis:
    name: Analyze code with ESLint
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v2

      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: 14

      - name: Install dependencies
        run: npm install

      - name: Run ESLint
        run: npm run lint
