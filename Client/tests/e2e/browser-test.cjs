const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// Simple test to check if ChromeDriver works
async function testBrowser() {
  console.log('Testing if ChromeDriver can launch Chrome...');
  
  // Set up Chrome options
  const options = new chrome.Options();
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  
  let driver;
  try {
    // Try to create a browser instance
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
    
    console.log('✅ SUCCESS: ChromeDriver successfully launched Chrome');
    console.log('ChromeDriver and Chrome versions are compatible');
    
    // Navigate to Google as a simple test
    await driver.get('https://www.google.com');
    console.log('✅ SUCCESS: Browser successfully navigated to Google');
    
    return true;
  } catch (error) {
    console.error('❌ ERROR: Failed to launch Chrome with ChromeDriver');
    console.error('Error details:', error.message);
    
    if (error.message.includes('Chrome version must be')) {
      console.error('\nChrome version mismatch detected!');
      console.error('Try installing the matching ChromeDriver version:');
      console.error('npm uninstall chromedriver && npm install chromedriver@xxx');
      console.error('where xxx is the version that matches your Chrome installation');
    }
    
    return false;
  } finally {
    if (driver) {
      try {
        await driver.quit();
        console.log('Browser closed successfully');
      } catch (error) {
        console.error('Error closing browser:', error.message);
      }
    }
  }
}

// Run the test
testBrowser()
  .then(success => {
    if (success) {
      console.log('\nChrome and ChromeDriver setup is working correctly');
      console.log('You should be able to run E2E tests with "npm run test:e2e"');
    } else {
      console.log('\nChrome and ChromeDriver setup has issues');
      console.log('Please fix the errors above before running E2E tests');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
