const { Builder, By, Key, until } = require('selenium-webdriver');

// Set timeout for the entire test
const TEST_TIMEOUT = 30000; // 30 seconds
let testTimeoutId;

async function runTest() {
  console.log('Starting simple browser test...');
  let driver;
  
  // Set a timeout for the entire test
  testTimeoutId = setTimeout(() => {
    console.error('❌ Test timed out after', TEST_TIMEOUT/1000, 'seconds');
    process.exit(1);
  }, TEST_TIMEOUT);

  try {
    // Create a new browser instance - using headless mode for more stability
    console.log('Initializing WebDriver...');
    
    // Initialize browser based on command line argument or default to Chrome
    const browserName = process.argv[2]?.toLowerCase() || 'chrome';
    
    if (browserName === 'chrome') {
      const chrome = require('selenium-webdriver/chrome');
      const options = new chrome.Options();
      options.addArguments('--headless=new');
      options.addArguments('--no-sandbox');
      options.addArguments('--disable-dev-shm-usage');
      
      driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();
        
      console.log('Chrome WebDriver initialized successfully');
    } else if (browserName === 'firefox') {
      const firefox = require('selenium-webdriver/firefox');
      const options = new firefox.Options();
      options.addArguments('-headless');
      
      driver = await new Builder()
        .forBrowser('firefox')
        .setFirefoxOptions(options)
        .build();
        
      console.log('Firefox WebDriver initialized successfully');
    } else {
      console.error(`Unsupported browser: ${browserName}`);
      process.exit(1);
    }
    
    // Navigate to a simple test page
    console.log('Navigating to google.com...');
    await driver.get('https://www.google.com');
    console.log('Navigation successful');
    
    // Take a screenshot
    console.log('Taking screenshot...');
    const image = await driver.takeScreenshot();
    require('fs').writeFileSync(`simple-test-${browserName}.png`, image, 'base64');
    console.log(`Screenshot saved as simple-test-${browserName}.png`);
    
    console.log('✅ TEST PASSED: Browser test completed successfully');
    clearTimeout(testTimeoutId);
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
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
const browserName = process.argv[2]?.toLowerCase() || 'chrome';
console.log(`Launching simple browser test with ${browserName}...`);
runTest().catch(err => {
  console.error('Unhandled error in test:', err);
  process.exit(1);
});
