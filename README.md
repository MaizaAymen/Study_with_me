# Study With Me

An AI-powered study companion that helps students and teachers by generating concise reports, providing helpful resources, and storing chat history. Includes an admin dashboard to manage users and review chat logs.

---

## Features

- User authentication (student, teacher, admin) with JWT
- AI-driven chat: summary reports and resource links via OpenRouter/Gemini
- Persistent chat history stored in MongoDB
- Admin dashboard to view all users and their chat logs
- Responsive React frontend with educational styling and animations
- Comprehensive test suites:
  - Frontend: Jest + React Testing Library
  - Backend: Jest + Supertest
  - E2E: Selenium (Firefox)

---

## Tech Stack

- Frontend: React, Vite, React Router, CSS Modules
- Backend: Node.js, Express, Mongoose (MongoDB)
- AI API: OpenRouter.ai (Google Gemini)
- Authentication: JWT, bcrypt
- Testing: Jest, React Testing Library, Supertest, Selenium WebDriver (geckodriver)

---

## Prerequisites

- Node.js >= 16
- MongoDB Atlas or local MongoDB instance
- Firefox browser (for E2E tests)

---

## Environment Variables

Create a `.env` file in `Backend/` with:
```ini
MONGODB_URL=<your MongoDB connection string>
OPENROUTER_API_KEY=<your OpenRouter API key>
JWT_SECRET=<your JWT secret>
```  

And optionally in `Client/`, you can set VITE_BACKEND_URL if not using default `http://localhost:4000`.

---

## Getting Started

### Backend

```bash
cd Backend
env\Scripts\activate      # Windows: activate virtual environment if using one
dotenv setup if needed
npm install
npm start                   # starts server on port 4000
```

### Frontend

```bash
cd Client
npm install
npm run dev                 # starts Vite dev server on port 5173
```

Visit `http://localhost:5173` in your browser.

---

## Default Admin

On first run, the server seeds a default admin user:

- **Username:** `aymen`  
- **Password:** `123456789`  
- **Email:** `maizaaymena@gmail.com`

Use these credentials to log in as an admin and access the admin dashboard.

---

## Running Tests

See [TESTING.md](TESTING.md) for detailed instructions on running all test suites.

---

## Folder Structure

```
Study_with_me/
├─ Backend/            # Express API, models, tests
├─ Client/             # React app, components, tests
├─ TESTING.md          # Testing instructions
├─ LICENSE
└─ README.md           # This file
```

---

© 2025 Study With Me Project. MIT Licensed.