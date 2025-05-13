# Running All Tests

This document summarizes how to verify that your test suites are working correctly.

---

## 1. Backend API Tests (Jest + Supertest)

1. Open a terminal and navigate to the Backend folder:
   ```bash
   npx jest
   ```

Expected output: 5 passing tests (registration, login, protected routes, history fetch).

---

## 2. Frontend Unit Tests (Jest + React Testing Library)

1. In a new terminal, navigate to the Client folder:
   ```bash
   cd Client
   ```
2. Install dependencies (if not already done):
   ```bash
   npm install
   ```
3. Run the frontend tests:
   ```bash
   npm run test:frontend
   ```

Expected output: tests for `AuthPage` (login/register toggle) should pass.

---

## 3. End-to-End (E2E) Tests (Selenium)

> **NOTE:** Make sure both servers are running:
> - Backend: in `Backend/`, run `node server.js`
> - Frontend: in `Client/`, run `npm run dev`

1. In another terminal, still in the Client folder:
   ```bash
   cd Backend
   ```
2. Install dependencies (if not already done):
   ```bash  
   npm install
   ```
3. Run the tests:
   ```bash
   npm test
   ```
   *or* explicitly:
   ```bash
   cd Client
   npm run test:e2e
   ```

This will launch ChromeDriver, navigate to `http://localhost:5173/login`, and verify the login form loads.

---

## 4. End-to-End (E2E) Tests (Cypress)

> **NOTE:** Make sure both servers are running:
> - Backend: in `Backend/`, run `node server.js`
> - Frontend: in `Client/`, run `npm run dev`

1. In the `Client/` folder, install dependencies:
   ```bash
   npm install
   ```
2. Open the Cypress Test Runner UI:
   ```bash
   npx cypress open
   ```
3. Or run tests headlessly:
   ```bash
   npx cypress run
   ```

Expected output: all Cypress specs under `cypress/e2e` pass.

---

## 5. Linting & Static Analysis (ESLint)

1. From the project root or `Client/` folder, run:
   ```bash
   npm run lint
   ```
2. To auto-fix issues:
   ```bash
   npm run lint -- --fix
   ```

Expected output: no lint errors.

---

If any step fails, inspect the console output for errors and ensure the corresponding server is running or dependencies are installed.