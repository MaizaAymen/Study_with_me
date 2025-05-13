// ES Module compatible E2E test
import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import firefox from 'selenium-webdriver/firefox.js';
import fs from 'fs';

// Set timeout for the entire test
const TEST_TIMEOUT = 30000; // 30 seconds
let testTimeoutId;

// Check which browser to use from command line args
const args = process.argv.slice(2);
const browserName = args[0]?.toLowerCase() || 'chrome';

// Set up browser options
let options;
if (browserName === 'chrome') {
  options = new chrome.Options();
  options.addArguments('--headless=new');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--disable-extensions');
  options.addArguments('--disable-gpu');
  options.addArguments('--window-size=1280,800');
} else if (browserName === 'firefox') {
  options = new firefox.Options();
  options.addArguments('-headless');
}

async function runTest() {
  console.log(`Starting E2E test with ${browserName}...`);
  let driver;
  
  // Set a timeout for the entire test
  testTimeoutId = setTimeout(() => {
    console.error('❌ TEST FAILED: Test timed out after', TEST_TIMEOUT/1000, 'seconds');
    process.exit(1);
  }, TEST_TIMEOUT);

  try {
    // Create a new browser instance
    console.log(`Initializing ${browserName} WebDriver...`);
    
    if (browserName === 'chrome') {
      driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();
    } else if (browserName === 'firefox') {
      driver = await new Builder()
        .forBrowser('firefox')
        .setFirefoxOptions(options)
        .build();
    } else {
      console.error(`Unsupported browser: ${browserName}`);
      process.exit(1);
    }
    
    console.log(`${browserName} WebDriver initialized successfully`);

    // Navigate to a simple test site
    console.log('Navigating to google.com...');
    await driver.get('https://www.google.com');
    console.log('Navigation successful');
    
    // Take a screenshot
    console.log('Taking screenshot...');
    const image = await driver.takeScreenshot();
    fs.writeFileSync(`${browserName}-test.png`, image, 'base64');
    console.log(`Screenshot saved as ${browserName}-test.png`);
    
    console.log('✅ TEST PASSED: Browser navigation test completed successfully');
    clearTimeout(testTimeoutId);
  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    
    if (error.message.includes('driver executable')) {
      console.error('\nPossible WebDriver issue. Try reinstalling the WebDriver:');
      console.error(`npm uninstall ${browserName === 'chrome' ? 'chromedriver' : 'geckodriver'}`);
      console.error(`npm install ${browserName === 'chrome' ? 'chromedriver' : 'geckodriver'}@latest`);
    }
    
    process.exit(1);
  } finally {
    clearTimeout(testTimeoutId);
    
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
  
  console.log('Test completed successfully');
  process.exit(0);
}

// Run the test
console.log(`Launching E2E test with ${browserName}...`);
runTest().catch(err => {
  console.error('Unhandled error in test:', err);
  process.exit(1);
});
