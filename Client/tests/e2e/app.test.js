const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');

(async function e2eTest() {
  let driver;
  try {
    driver = await new Builder().forBrowser('chrome').build();
    await driver.get('http://localhost:5173/login');
    
    // Wait for the login username input to be visible
    await driver.wait(until.elementLocated(By.css("input[placeholder='Username']")), 5000);
    console.log('✅ Login page loaded and username field is visible.');
  } catch (err) {
    if (err.message.includes('ERR_CONNECTION_REFUSED')) {
      console.error('❌ Connection refused: please start the dev server with `npm run dev` before running E2E tests.');
      process.exit(1);
    }
    console.error('❌ E2E test failed:', err);
    process.exit(1);
  } finally {
    if (driver) await driver.quit();
  }
})();
