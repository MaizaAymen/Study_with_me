const http = require('http');
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

console.log(`${colors.bold}${colors.cyan}===== E2E Testing Diagnostic Tool =====${colors.reset}`);
console.log(`${colors.blue}Running diagnostics to help troubleshoot E2E test issues...${colors.reset}\n`);

// Check if frontend server is running
function checkServer(url, name, callback) {
  console.log(`${colors.bold}[1/5]${colors.reset} Checking if ${name} server is running at ${url}...`);
  
  const request = http.get(url, (res) => {
    if (res.statusCode === 200) {
      console.log(`${colors.green}✓ ${name} server is running.${colors.reset}`);
      callback(true);
    } else {
      console.log(`${colors.yellow}⚠ ${name} server returned status code ${res.statusCode}${colors.reset}`);
      callback(false);
    }
  });
  
  request.on('error', (err) => {
    console.log(`${colors.red}✗ ${name} server is not running. Error: ${err.message}${colors.reset}`);
    console.log(`  ${colors.yellow}Hint: Start the ${name} server in another terminal window${colors.reset}`);
    callback(false);
  });
  
  // Set a timeout
  request.setTimeout(3000, () => {
    request.abort();
    console.log(`${colors.red}✗ Connection to ${name} server timed out${colors.reset}`);
    callback(false);
  });
}

// Check node version
function checkNodeVersion() {
  console.log(`${colors.bold}[2/5]${colors.reset} Checking Node.js version...`);
  const nodeVersion = process.version;
  console.log(`  Node.js version: ${nodeVersion}`);
  
  const majorVersion = parseInt(nodeVersion.substring(1).split('.')[0], 10);
  if (majorVersion < 14) {
    console.log(`${colors.red}✗ Node.js version is too old. Selenium WebDriver requires Node.js 14 or newer.${colors.reset}`);
  } else {
    console.log(`${colors.green}✓ Node.js version is sufficient.${colors.reset}`);
  }
}

// Check driver versions
function checkDrivers() {
  console.log(`${colors.bold}[3/5]${colors.reset} Checking WebDriver installations...`);
  
  let packageJson;
  try {
    packageJson = require('../../package.json');
    
    // Check chromedriver
    if (packageJson.dependencies?.chromedriver || packageJson.devDependencies?.chromedriver) {
      const version = packageJson.dependencies?.chromedriver || packageJson.devDependencies?.chromedriver;
      console.log(`  ChromeDriver: ${version} ${colors.green}✓${colors.reset}`);
    } else {
      console.log(`  ${colors.red}✗ ChromeDriver not found in package.json${colors.reset}`);
    }
    
    // Check geckodriver
    if (packageJson.dependencies?.geckodriver || packageJson.devDependencies?.geckodriver) {
      const version = packageJson.dependencies?.geckodriver || packageJson.devDependencies?.geckodriver;
      console.log(`  GeckoDriver: ${version} ${colors.green}✓${colors.reset}`);
    } else {
      console.log(`  ${colors.red}✗ GeckoDriver not found in package.json${colors.reset}`);
    }
    
    // Check selenium-webdriver
    if (packageJson.dependencies?.['selenium-webdriver'] || packageJson.devDependencies?.['selenium-webdriver']) {
      const version = packageJson.dependencies?.['selenium-webdriver'] || packageJson.devDependencies?.['selenium-webdriver'];
      console.log(`  Selenium WebDriver: ${version} ${colors.green}✓${colors.reset}`);
    } else {
      console.log(`  ${colors.red}✗ Selenium WebDriver not found in package.json${colors.reset}`);
    }
    
  } catch (err) {
    console.log(`${colors.red}✗ Could not read package.json: ${err.message}${colors.reset}`);
  }
}

// Check browser installations
function checkBrowsers() {
  console.log(`${colors.bold}[4/5]${colors.reset} Checking for installed browsers...`);
  
  const platform = os.platform();
  let chromePath, firefoxPath;
  
  if (platform === 'win32') {
    chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    chromePath2 = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
    firefoxPath = 'C:\\Program Files\\Mozilla Firefox\\firefox.exe';
    firefoxPath2 = 'C:\\Program Files (x86)\\Mozilla Firefox\\firefox.exe';
  } else if (platform === 'darwin') { // macOS
    chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    firefoxPath = '/Applications/Firefox.app/Contents/MacOS/firefox';
  } else { // Linux and others
    chromePath = '/usr/bin/google-chrome';
    firefoxPath = '/usr/bin/firefox';
  }
  
  // Check Chrome
  if (fs.existsSync(chromePath) || (platform === 'win32' && fs.existsSync(chromePath2))) {
    console.log(`  ${colors.green}✓ Google Chrome is installed${colors.reset}`);
  } else {
    console.log(`  ${colors.yellow}⚠ Could not find Google Chrome at the default location${colors.reset}`);
  }
  
  // Check Firefox
  if (fs.existsSync(firefoxPath) || (platform === 'win32' && fs.existsSync(firefoxPath2))) {
    console.log(`  ${colors.green}✓ Mozilla Firefox is installed${colors.reset}`);
  } else {
    console.log(`  ${colors.yellow}⚠ Could not find Mozilla Firefox at the default location${colors.reset}`);
  }
}

// Check test files
function checkTestFiles() {
  console.log(`${colors.bold}[5/5]${colors.reset} Checking E2E test files...`);
  
  const testDir = path.join(__dirname);
  
  try {
    const files = fs.readdirSync(testDir);
    
    const testFiles = files.filter(file => file.endsWith('.js') || file.endsWith('.cjs'));
    
    if (testFiles.length === 0) {
      console.log(`  ${colors.red}✗ No test files found in ${testDir}${colors.reset}`);
    } else {
      console.log(`  ${colors.green}✓ Found ${testFiles.length} test files:${colors.reset}`);
      testFiles.forEach(file => {
        console.log(`    - ${file}`);
      });
    }
  } catch (err) {
    console.log(`  ${colors.red}✗ Error reading test directory: ${err.message}${colors.reset}`);
  }
}

// Run all checks
checkServer('http://localhost:5173/login', 'Frontend', (frontendRunning) => {
  checkServer('http://localhost:4000', 'Backend', (backendRunning) => {
    checkNodeVersion();
    checkDrivers();
    checkBrowsers();
    checkTestFiles();
    
    console.log(`\n${colors.bold}${colors.cyan}===== Diagnostic Summary =====${colors.reset}`);
    
    if (!frontendRunning || !backendRunning) {
      console.log(`${colors.yellow}⚠ Server issues detected. Please start all required servers before running E2E tests.${colors.reset}`);
    }
    
    console.log(`\n${colors.magenta}Next steps:${colors.reset}`);
    console.log(`1. Make sure both frontend and backend servers are running`);
    console.log(`2. Run the Firefox-based test with: ${colors.bold}npm run test:e2e:firefox${colors.reset}`);
    console.log(`3. If Firefox test works but Chrome doesn't, there might be a ChromeDriver compatibility issue`);
    
    console.log(`\n${colors.blue}For more detailed instructions, see E2E_TEST_INSTRUCTIONS.md${colors.reset}`);
  });
});
