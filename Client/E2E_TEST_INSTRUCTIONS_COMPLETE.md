# E2E Test Instructions for Study With Me (Updated)

This document provides comprehensive instructions for all end-to-end (E2E) testing options available for the Study With Me application.

## Recommended Method: Cypress Tests (Easiest & Most Reliable)

Cypress offers the most reliable and user-friendly E2E testing experience:

```powershell
cd Client
npm run test:cypress       # Run Cypress tests in headless mode
npm run test:cypress:open  # Open Cypress interactive test runner
```

This will:
1. Start the frontend server automatically
2. Wait for it to be ready
3. Run the Cypress tests
4. Show detailed test results with screenshots and videos
5. Clean up when done

### Available Cypress Tests

We have the following Cypress test suites:

1. **Login Tests** (`login.cy.js`): Tests the login page functionality 
2. **Register Tests** (`register.cy.js`): Tests the user registration functionality
3. **Chatbot Tests** (`chatbot.cy.js`): Tests the AI chatbot functionality, including:
   - Sending messages to the chatbot
   - Viewing AI responses
   - Testing loading states
   - Viewing chat history
   - Error handling
   - Logout functionality

## ES Module Compatible Tests

If you prefer using Selenium WebDriver with ES modules compatibility:

```powershell
cd Client
npm run test:esm:runner         # Uses Chrome by default
npm run test:esm:runner:chrome  # Explicitly use Chrome
npm run test:esm:runner:firefox # Explicitly use Firefox
```

This will:
1. Start the frontend server automatically
2. Wait for it to be ready
3. Run the ESM-compatible E2E tests
4. Clean up when done

## Troubleshooting WebDriver Issues

If you're experiencing WebDriver issues, start by running our dedicated WebDriver diagnostic tool:

```powershell
cd Client
npm run test:webdriver
```

This tool will:
1. Check Chrome and Firefox browser installations
2. Verify WebDriver package installations (chromedriver/geckodriver)
3. Test if WebDrivers can be initialized
4. Provide recommendations based on the results

## Simple Browser Test

To test just the WebDriver functionality without the full application:

```powershell
cd Client
npm run test:simple          # Uses Chrome
npm run test:simple:chrome   # Explicitly use Chrome
npm run test:simple:firefox  # Explicitly use Firefox
```

This simple test will:
1. Open Google.com in headless mode
2. Take a screenshot
3. Close the browser

If this works, the WebDriver is functioning correctly.

## Quick Start: Diagnose General Issues

For diagnosing general E2E test issues:

```powershell
cd Client
npm run test:diagnose
```

This will check for common issues like:
- If servers are running
- Browser installations
- WebDriver installations
- Test file existence

## Prerequisites

Before running the E2E tests, ensure you have the following:

1. Google Chrome or Firefox browser installed
2. All dependencies installed in both the Client and Backend folders:
   ```powershell
   cd Backend
   npm install
   cd ../Client
   npm install
   ```

## Legacy Testing Methods (Not Recommended)

If none of the above methods work, you can try the original testing methods:

### Manual Testing (Alternative Method)

You can run tests manually in separate terminals:

#### Step 1: Start the Backend Server

First, start the backend server in a separate terminal:
```powershell
cd Backend
node server.js
```

#### Step 2: Start the Frontend Server

Next, start the frontend development server in another terminal:

```powershell
cd Client
npm run dev
```

#### Step 3: Run the E2E Tests

With both servers running, open a third terminal and run one of:

```powershell
cd Client
npm run test:e2e             # Chrome
npm run test:e2e:firefox     # Firefox
```

## Common WebDriver Issues and Solutions

1. **Module Type Issues**:
   - Error symptoms: "require is not defined in ES module scope"
   - Solution: Use the ESM-compatible tests (`npm run test:esm:runner`)

2. **Chrome/ChromeDriver Version Mismatch**:
   - Error symptoms: WebDriver initialization hangs or fails
   - Solution: Update ChromeDriver to match your Chrome version
     ```powershell
     npm uninstall chromedriver
     npm install chromedriver@latest
     ```

3. **Firefox/GeckoDriver Issues**:
   - Error symptoms: WebDriver initialization fails with geckodriver error
   - Solution: Update GeckoDriver
     ```powershell
     npm uninstall geckodriver
     npm install geckodriver@latest
     ```

4. **Browser Not Installed**:
   - Error symptoms: Cannot find browser binary
   - Solution: Install Chrome or Firefox

5. **Missing Dependencies**:
   - Error symptoms: Cannot find module errors
   - Solution: Run `npm install` to install all dependencies

6. **Timeout Issues**:
   - Error symptoms: Test times out during navigation
   - Solution: Ensure your frontend server is running and accessible

## Manual Verification Steps

To manually verify that your application is ready for testing:

1. Open http://localhost:5173/login in your browser
2. Check that the login form appears with username and password fields
3. If these are visible, your E2E test should work correctly
