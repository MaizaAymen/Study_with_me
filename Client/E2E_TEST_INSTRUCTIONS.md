# E2E Test Instructions for Study With Me

This document explains how to properly run the end-to-end (E2E) tests for the Study With Me application.

## Quick Start: Diagnose Issues

If you're having problems with E2E tests, run the diagnostic tool first:

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

## Testing Your Browser and WebDriver Setup

Before running the full E2E tests, verify your browser and WebDriver setup:

### For Chrome:
```powershell
cd Client
npm run test:browser
```

### For Firefox:
```powershell
cd Client
npm run test:e2e:firefox
```

## Step 1: Start the Backend Server

First, start the backend server in a separate terminal:

```powershell
cd Backend
node server.js
```

You should see a message indicating that the server is running on port 4000.

## Step 2: Start the Frontend Server

Next, start the frontend development server in another terminal:

```powershell
cd Client
npm run dev
```

You should see a message indicating that the Vite server is running at http://localhost:5173.

## Step 3: Run the E2E Tests

With both servers running, open a third terminal and run one of:

```powershell
# Try Firefox first (more reliable)
cd Client
npm run test:e2e:firefox

# Or Chrome if Firefox works
cd Client
npm run test:e2e
```

If successful, you'll see a series of logs indicating the test progress and a final message that the test completed successfully.

## Troubleshooting

If you encounter issues running the E2E tests:

1. **Run the Diagnostic Tool**: Use `npm run test:diagnose` to check for common issues.

2. **Browser Test Hangs**: If Chrome tests hang but Firefox works, use the Firefox test instead.

3. **ChromeDriver Version Mismatch**: If you see error messages about Chrome version, you need to install a ChromeDriver version that matches your Chrome browser version:
   ```powershell
   npm uninstall chromedriver
   npm install chromedriver@latest
   ```

4. **Timeout Issues**: If the test times out, check if both servers are running and accessible:
   - Backend: http://localhost:4000 
   - Frontend: http://localhost:5173/login

5. **Browser Launches But Test Fails**: Look for the screenshot saved as `login-screen.png` or `login-screen-firefox.png` in the Client folder to see what the browser is actually displaying.

6. **Connection Refused**: Make sure both your frontend and backend servers are running and not blocked by a firewall.

## Manual Verification Steps

To manually verify that your application is ready for testing:

1. Open http://localhost:5173/login in your browser
2. Check that the login form appears with username and password fields
3. If these are visible, your E2E test should work correctly
