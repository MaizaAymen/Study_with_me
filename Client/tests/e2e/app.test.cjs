const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// Set timeout for the entire test
const TEST_TIMEOUT = 30000; // 30 seconds
let testTimeoutId;

// Set up Chrome options - NOT using headless mode for easier debugging
const options = new chrome.Options();
// options.addArguments('--headless'); // Commented out to see the browser for debugging
options.addArguments('--no-sandbox');
options.addArguments('--disable-dev-shm-usage');
options.addArguments('--disable-extensions');
options.addArguments('--disable-gpu');
options.addArguments('--window-size=1280,800');

async function runTest() {
  console.log('Starting E2E test...');
  let driver;
  
  // Set a timeout for the entire test
  testTimeoutId = setTimeout(() => {
    console.error('❌ TEST FAILED: Test timed out after', TEST_TIMEOUT/1000, 'seconds');
    process.exit(1);
  }, TEST_TIMEOUT);
  try {
    // Create a new Chrome browser instance
    console.log('Initializing Chrome WebDriver...');
    
    // Set a specific timeout for the WebDriver initialization
    const initTimeout = setTimeout(() => {
      console.error('❌ WebDriver initialization timed out - this usually indicates a ChromeDriver version mismatch or Chrome not installed correctly');
      process.exit(1);
    }, 15000); // 15 seconds timeout for just the initialization
    
    try {
      driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();
      
      clearTimeout(initTimeout); // Clear the init timeout when successful
      } catch (initError) {
      clearTimeout(initTimeout);
      console.error('❌ WebDriver initialization error:', initError.message);
      
      if (initError.message.includes('ChromeDriver')) {
        console.error('\n=== CHROME/CHROMEDRIVER VERSION MISMATCH DETECTED ===');
        console.error('This is a common issue. Here are steps to fix it:');
        console.error('1. Update ChromeDriver: npm uninstall chromedriver && npm install chromedriver@latest');
        console.error('2. Or try using Firefox: npm run test:e2e:runner:firefox');
        console.error('3. Install Chrome browser if not already installed');
      }
      
      throw initError;
    }

    // Navigate to the application with timeout
    console.log('Navigating to application at http://localhost:5173/login...');
    await driver.manage().setTimeouts({ pageLoad: 10000 });
    try {
      await driver.get('http://localhost:5173/login');
      console.log('Navigation successful');
    } catch (navError) {
      console.error('❌ Error during navigation:', navError.message);
      if (navError.message.includes('ERR_CONNECTION_REFUSED')) {
        console.error('Make sure your frontend server is running with: npm run dev');
        console.error('The test-runner.cjs should have started the server automatically,');
        console.error('but you can also start it manually in another terminal.');
      }
      throw navError;
    }
    
    // Check if app is running by looking for login form
    try {
      console.log('Waiting for login form to appear...');
      const usernameInput = await driver.wait(
        until.elementLocated(By.css('input[placeholder="Username"]')), 
        10000,
        'Login form did not appear in 10 seconds'
      );
      
      // Take a screenshot (useful for debugging)
      await driver.takeScreenshot().then((image) => {
        require('fs').writeFileSync('login-screen.png', image, 'base64');
        console.log('Screenshot saved as login-screen.png');
      });
      
      console.log('✅ TEST PASSED: Login page loaded successfully');
      clearTimeout(testTimeoutId); // Clear the test timeout
      
    } catch (error) {
      console.error('❌ TEST FAILED: Could not find login form');
      console.error('Error details:', error.message);
      console.error('Make sure your frontend server is running with: npm run dev');
      throw error; // Re-throw to be caught by the outer catch block
    }
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    
    if (error.message.includes('ERR_CONNECTION_REFUSED')) {
      console.error('Make sure your frontend server is running with: npm run dev');
    }
    
    if (error.message.includes('Chrome')) {
      console.error('Chrome/ChromeDriver error. Make sure Chrome and ChromeDriver versions are compatible.');
      console.error('Try: npm uninstall chromedriver && npm install chromedriver@latest');
    }
    
    process.exit(1);
  } finally {
    clearTimeout(testTimeoutId); // Clear the test timeout
    
    if (driver) {
      console.log('Closing browser...');
      try {
        await driver.quit();
        console.log('Browser closed successfully');
      } catch (quitError) {
        console.error('Error closing browser:', quitError.message);
      }
    }
  }
  
  console.log('E2E test completed successfully');
  process.exit(0); // Ensure process exits
}

// Run the test
console.log('Launching E2E test with Chrome...');
runTest().catch(err => {
  console.error('Unhandled error in test:', err);
  process.exit(1);
});
