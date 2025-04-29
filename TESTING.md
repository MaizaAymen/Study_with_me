# Running All Tests

This document summarizes how to verify that your test suites are working correctly.

---

## 1. Backend API Tests (Jest + Supertest)

1. Open a terminal and navigate to the Backend folder:
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
   cd Client
   npm run test:e2e
   ```

This will launch ChromeDriver, navigate to `http://localhost:5173/login`, and verify the login form loads.

---

If any step fails, inspect the console output for errors and ensure the corresponding server is running or dependencies are installed.