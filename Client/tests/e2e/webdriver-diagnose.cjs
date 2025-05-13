const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

console.log(`${colors.bold}${colors.cyan}===== WebDriver Diagnostic Tool =====${colors.reset}`);
console.log(`${colors.blue}Running diagnostics to help troubleshoot WebDriver issues...${colors.reset}\n`);

// Capture platform info
const platform = os.platform();
const isWindows = platform === 'win32';
const isMac = platform === 'darwin';
const isLinux = platform === 'linux';

// Function to check if a command exists (executable is in PATH)
function commandExists(command) {
  try {
    const cmd = isWindows ? 'where' : 'which';
    execSync(`${cmd} ${command}`, { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Function to safely execute a command and return its output
function safeExec(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
  } catch (error) {
    return null;
  }
}

// Check browser and driver installation
async function checkBrowserAndDriver(browser, driver) {
  console.log(`${colors.bold}Checking ${browser} and ${driver}...${colors.reset}`);
  
  // Check if browser is installed
  let browserInstalled = false;
  let browserVersion = null;
  
  if (browser === 'Chrome') {
    // Check Chrome installation
    if (isWindows) {
      const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
      const chromePath2 = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
      
      if (fs.existsSync(chromePath) || fs.existsSync(chromePath2)) {
        browserInstalled = true;
        // Try to get Chrome version
        browserVersion = safeExec('reg query "HKEY_CURRENT_USER\\Software\\Google\\Chrome\\BLBeacon" /v version');
        if (!browserVersion) {
          browserVersion = safeExec('reg query "HKLM\\SOFTWARE\\Google\\Chrome\\BLBeacon" /v version');
        }
        
        if (browserVersion) {
          browserVersion = browserVersion.match(/version\s+REG_SZ\s+([\d.]+)/i);
          browserVersion = browserVersion ? browserVersion[1] : 'unknown';
        }
      }
    } else if (isMac) {
      if (fs.existsSync('/Applications/Google Chrome.app')) {
        browserInstalled = true;
        browserVersion = safeExec('/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --version');
      }
    } else if (isLinux) {
      // Linux
      if (commandExists('google-chrome') || commandExists('chrome')) {
        browserInstalled = true;
        browserVersion = safeExec('google-chrome --version') || safeExec('chrome --version');
      }
    }
  } else if (browser === 'Firefox') {
    // Check Firefox installation
    if (isWindows) {
      const firefoxPath = 'C:\\Program Files\\Mozilla Firefox\\firefox.exe';
      const firefoxPath2 = 'C:\\Program Files (x86)\\Mozilla Firefox\\firefox.exe';
      
      if (fs.existsSync(firefoxPath) || fs.existsSync(firefoxPath2)) {
        browserInstalled = true;
        browserVersion = safeExec('"C:\\Program Files\\Mozilla Firefox\\firefox.exe" -v | more');
        if (!browserVersion) {
          browserVersion = safeExec('"C:\\Program Files (x86)\\Mozilla Firefox\\firefox.exe" -v | more');
        }
      }
    } else if (isMac) {
      if (fs.existsSync('/Applications/Firefox.app')) {
        browserInstalled = true;
        browserVersion = safeExec('/Applications/Firefox.app/Contents/MacOS/firefox --version');
      }
    } else if (isLinux) {
      // Linux
      if (commandExists('firefox')) {
        browserInstalled = true;
        browserVersion = safeExec('firefox --version');
      }
    }
  }
  
  // Print browser status
  if (browserInstalled) {
    console.log(`${colors.green}✓ ${browser} is installed${colors.reset}`);
    if (browserVersion) {
      console.log(`  ${browser} version: ${browserVersion}`);
    } else {
      console.log(`  ${colors.yellow}Could not determine ${browser} version${colors.reset}`);
    }
  } else {
    console.log(`${colors.red}✗ ${browser} does not appear to be installed${colors.reset}`);
    console.log(`  ${colors.yellow}Please install ${browser} or check your installation${colors.reset}`);
  }
  
  // Check WebDriver package installation
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    if (driver.toLowerCase() in dependencies) {
      console.log(`${colors.green}✓ ${driver} is installed as a dependency${colors.reset}`);
      console.log(`  ${driver} version: ${dependencies[driver.toLowerCase()]}`);
      
      // Check if we can determine compatible versions
      if (browser === 'Chrome' && browserVersion && browserVersion !== 'unknown') {
        const majorVersion = browserVersion.split('.')[0];
        console.log(`  ${colors.yellow}Note: Chrome version ${majorVersion} should use a compatible ChromeDriver version${colors.reset}`);
        console.log(`  ${colors.yellow}If your tests are failing, try: npm uninstall chromedriver && npm install chromedriver@latest${colors.reset}`);
      }
    } else {
      console.log(`${colors.red}✗ ${driver} is not installed as a dependency${colors.reset}`);
      console.log(`  ${colors.yellow}Install it with: npm install ${driver.toLowerCase()}${colors.reset}`);
    }
  } catch (error) {
    console.log(`${colors.red}✗ Could not read package.json${colors.reset}`);
  }
  
  // Try to run a simple WebDriver command for each browser
  console.log(`\n${colors.bold}Attempting to create a simple ${driver} instance...${colors.reset}`);
    // Create a temporary test file
  const testFile = path.join(__dirname, `${browser.toLowerCase()}-test-temp.cjs`);
  const testCode = browser === 'Chrome' 
    ? `
      const { Builder } = require('selenium-webdriver');
      const chrome = require('selenium-webdriver/chrome');
      
      async function testChromeDriver() {
        console.log('Attempting to create Chrome WebDriver instance...');
        let driver;
        
        try {
          const options = new chrome.Options();
          options.addArguments('--headless');
          
          driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();
            
          console.log('SUCCESS: Chrome WebDriver created successfully!');
          return true;
        } catch (error) {
          console.error('FAILED: Chrome WebDriver creation failed with error:', error.message);
          return false;
        } finally {
          if (driver) {
            try {
              await driver.quit();
            } catch (e) {}
          }
        }
      }
      
      testChromeDriver().then(result => {
        process.exit(result ? 0 : 1);
      });
    `    : `
      const { Builder } = require('selenium-webdriver');
      const firefox = require('selenium-webdriver/firefox');
      
      async function testFirefoxDriver() {
        console.log('Attempting to create Firefox WebDriver instance...');
        let driver;
        
        try {
          const options = new firefox.Options();
          options.addArguments('-headless');
          
          driver = await new Builder()
            .forBrowser('firefox')
            .setFirefoxOptions(options)
            .build();
            
          console.log('SUCCESS: Firefox WebDriver created successfully!');
          return true;
        } catch (error) {
          console.error('FAILED: Firefox WebDriver creation failed with error:', error.message);
          return false;
        } finally {
          if (driver) {
            try {
              await driver.quit();
            } catch (e) {}
          }
        }
      }
      
      testFirefoxDriver().then(result => {
        process.exit(result ? 0 : 1);
      });
    `;
  
  fs.writeFileSync(testFile, testCode);
  
  // Execute the test file
  return new Promise(resolve => {
    const child = spawn('node', [testFile], {
      stdio: 'inherit'
    });
    
    let timeout = setTimeout(() => {
      console.log(`${colors.red}✗ ${driver} test timed out after 20 seconds${colors.reset}`);
      child.kill();
      
      // Clean up
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
      }
      
      resolve(false);
    }, 20000);
    
    child.on('close', code => {
      clearTimeout(timeout);
      
      // Clean up
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
      }
      
      if (code === 0) {
        console.log(`${colors.green}✓ ${driver} works correctly!${colors.reset}`);
        resolve(true);
      } else {
        console.log(`${colors.red}✗ ${driver} test failed with exit code ${code}${colors.reset}`);
        resolve(false);
      }
    });
  });
}

// Provide recommendations based on the results
function provideRecommendations(chromeWorks, firefoxWorks) {
  console.log(`\n${colors.bold}${colors.cyan}===== Recommendations =====${colors.reset}`);
  
  if (chromeWorks && firefoxWorks) {
    console.log(`${colors.green}✓ Both Chrome and Firefox WebDrivers are working correctly!${colors.reset}`);
    console.log(`  You can use either browser for your E2E tests.`);
    console.log(`  Run your tests with:`);
    console.log(`  ${colors.cyan}npm run test:e2e:runner:chrome${colors.reset} or ${colors.cyan}npm run test:e2e:runner:firefox${colors.reset}`);
    return;
  }
  
  if (chromeWorks) {
    console.log(`${colors.green}✓ Chrome WebDriver is working correctly${colors.reset}`);
    console.log(`${colors.red}✗ Firefox WebDriver has issues${colors.reset}`);
    console.log(`\nRecommendation: Use Chrome for your E2E tests.`);
    console.log(`Run your tests with: ${colors.cyan}npm run test:e2e:runner:chrome${colors.reset}`);
    return;
  }
  
  if (firefoxWorks) {
    console.log(`${colors.red}✗ Chrome WebDriver has issues${colors.reset}`);
    console.log(`${colors.green}✓ Firefox WebDriver is working correctly${colors.reset}`);
    console.log(`\nRecommendation: Use Firefox for your E2E tests.`);
    console.log(`Run your tests with: ${colors.cyan}npm run test:e2e:runner:firefox${colors.reset}`);
    return;
  }
  
  console.log(`${colors.red}✗ Both Chrome and Firefox WebDrivers have issues${colors.reset}`);
  console.log(`\nRecommendations:`);
  console.log(`1. ${colors.yellow}Reinstall WebDriver dependencies:${colors.reset}`);
  console.log(`   ${colors.cyan}npm uninstall chromedriver geckodriver${colors.reset}`);
  console.log(`   ${colors.cyan}npm install chromedriver@latest geckodriver@latest${colors.reset}`);
  console.log(`\n2. ${colors.yellow}Ensure you have the latest browser versions:${colors.reset}`);
  console.log(`   - Update Chrome and Firefox to their latest versions`);
  console.log(`\n3. ${colors.yellow}Try different browsers:${colors.reset}`);
  console.log(`   If you only have Chrome, try installing Firefox and vice versa`);
  console.log(`\n4. ${colors.yellow}Check environment variables:${colors.reset}`);
  console.log(`   Make sure PATH includes the necessary directories for WebDrivers`);
  console.log(`\n5. ${colors.yellow}Run a simplified test:${colors.reset}`);
  console.log(`   Try running a simple Selenium test directly to isolate the issue`);
}

// Main function
async function main() {
  console.log(`${colors.bold}Platform:${colors.reset} ${platform}`);
  console.log(`${colors.bold}Node version:${colors.reset} ${process.version}`);
  console.log();
  
  // Check Chrome and ChromeDriver
  const chromeWorks = await checkBrowserAndDriver('Chrome', 'chromedriver');
  
  console.log(`\n${colors.cyan}-------------------------------------------${colors.reset}\n`);
  
  // Check Firefox and geckodriver
  const firefoxWorks = await checkBrowserAndDriver('Firefox', 'geckodriver');
  
  // Provide recommendations
  provideRecommendations(chromeWorks, firefoxWorks);
}

// Run the main function
main().catch(error => {
  console.error(`${colors.red}An error occurred:${colors.reset}`, error);
  process.exit(1);
});
