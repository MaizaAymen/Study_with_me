// ES Module compatible test runner
import { spawn } from 'child_process';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

// Configuration
const SERVER_START_TIMEOUT = 60000; // 60 seconds max to wait for server
const SERVER_URL = 'http://localhost:5173';
const SERVER_CHECK_INTERVAL = 1000; // Check every second

// Parse command line args
const args = process.argv.slice(2);
const BROWSER = args[0]?.toLowerCase() || 'chrome'; // Default to chrome
const DEBUG = args.includes('--debug');

// Store server process and exit handler references
let serverProcess = null;
let exitHandlerInstalled = false;

// Clean up function to kill server process
function cleanup() {
  if (serverProcess) {
    console.log(`\n${colors.blue}Shutting down dev server...${colors.reset}`);
    if (process.platform === 'win32') {
      // Windows requires this to properly kill the process tree
      spawn('taskkill', ['/pid', serverProcess.pid, '/T', '/F']);
    } else {
      // Unix-like systems
      serverProcess.kill('SIGINT');
    }
    serverProcess = null;
  }
}

// Install exit handlers only once
function installExitHandlers() {
  if (!exitHandlerInstalled) {
    // Handle normal exit
    process.on('exit', cleanup);
    
    // Handle Ctrl+C
    process.on('SIGINT', () => {
      console.log(`\n${colors.yellow}Test runner interrupted.${colors.reset}`);
      cleanup();
      process.exit(1);
    });
    
    // Handle app crashes
    process.on('uncaughtException', (err) => {
      console.error(`\n${colors.red}Uncaught exception:${colors.reset}`, err);
      cleanup();
      process.exit(1);
    });
    
    exitHandlerInstalled = true;
  }
}

// Function to check if server is responsive
function checkServerIsUp() {
  return new Promise((resolve) => {
    const request = http.get(SERVER_URL, (res) => {
      if (res.statusCode === 200) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    
    request.on('error', () => {
      resolve(false);
    });
    
    request.setTimeout(3000, () => {
      request.abort();
      resolve(false);
    });
  });
}

// Function to wait until server is ready
async function waitForServer(timeout) {
  console.log(`${colors.blue}Waiting for dev server to be ready at ${SERVER_URL}...${colors.reset}`);
  
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (await checkServerIsUp()) {
      console.log(`${colors.green}✓ Server is up and running!${colors.reset}`);
      return true;
    }
    
    // Wait a bit before checking again
    await new Promise(resolve => setTimeout(resolve, SERVER_CHECK_INTERVAL));
    
    // Print a dot every few seconds to show progress
    if ((Date.now() - startTime) % 5000 <= SERVER_CHECK_INTERVAL) {
      process.stdout.write('.');
    }
  }
  
  console.log(`\n${colors.red}✗ Server failed to start within ${timeout / 1000} seconds${colors.reset}`);
  return false;
}

// Function to start the development server
function startDevServer() {
  console.log(`\n${colors.bold}${colors.cyan}===== ESM E2E Test Runner =====${colors.reset}`);
  console.log(`${colors.blue}Starting Vite development server...${colors.reset}`);
  
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  
  // Navigate to the root directory (up two levels from this file)
  const projectRoot = path.resolve(__dirname, '../../');
  
  serverProcess = spawn(npmCmd, ['run', 'dev'], {
    cwd: projectRoot,
    stdio: DEBUG ? 'inherit' : 'pipe', // Show all server output if in debug mode
    shell: true
  });
  
  if (!DEBUG) {
    // Log some server output for debugging purposes
    serverProcess.stdout?.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Local:') || output.includes('ready in')) {
        console.log(`${colors.green}[Server]${colors.reset} ${output.trim()}`);
      }
    });
    
    serverProcess.stderr?.on('data', (data) => {
      console.error(`${colors.red}[Server Error]${colors.reset} ${data.toString().trim()}`);
    });
  }
  
  serverProcess.on('error', (err) => {
    console.error(`${colors.red}Failed to start development server:${colors.reset}`, err);
    process.exit(1);
  });
  
  serverProcess.on('close', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`${colors.red}Development server process exited with code ${code}${colors.reset}`);
    }
    serverProcess = null;
  });
  
  installExitHandlers();
  
  return serverProcess;
}

// Function to run the E2E tests
async function runE2ETest(browser) {
  console.log(`\n${colors.blue}Running ESM E2E tests with ${browser}...${colors.reset}`);
  
  const testCmd = process.platform === 'win32' ? 'node.exe' : 'node';
  // Use the ESM test based on browser
  const testScript = path.resolve(__dirname, './esm-test.js');
  
  return new Promise((resolve) => {
    const testProcess = spawn(testCmd, [testScript, browser], {
      stdio: 'inherit',
      shell: true
    });
    
    testProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`${colors.green}✓ ESM E2E tests completed successfully!${colors.reset}`);
        resolve(true);
      } else {
        console.error(`${colors.red}✗ ESM E2E tests failed with code ${code}${colors.reset}`);
        resolve(false);
      }
    });
  });
}

// Main function
async function main() {
  const validBrowsers = ['chrome', 'firefox'];
  
  if (!validBrowsers.includes(BROWSER)) {
    console.error(`${colors.red}Invalid browser specified. Use 'chrome' or 'firefox'.${colors.reset}`);
    process.exit(1);
  }
  
  console.log(`${colors.bold}Running ESM E2E tests with ${BROWSER}${colors.reset}`);
  
  // 1. Start the development server
  startDevServer();
  
  // 2. Wait for server to be ready
  const serverReady = await waitForServer(SERVER_START_TIMEOUT);
  
  if (!serverReady) {
    console.error(`${colors.red}Aborting tests: Server failed to start${colors.reset}`);
    cleanup();
    process.exit(1);
  }
  
  // 3. Run the actual E2E tests
  const testsPassed = await runE2ETest(BROWSER);
  
  // 4. Cleanup and exit
  cleanup();
  process.exit(testsPassed ? 0 : 1);
}

// Run the main function
main().catch(err => {
  console.error(`${colors.red}Unhandled error:${colors.reset}`, err);
  cleanup();
  process.exit(1);
});
