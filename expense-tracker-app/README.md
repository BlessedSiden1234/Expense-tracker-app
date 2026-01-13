# Expense Tracker App 💵  
**Full Stack Application (React + Azure Functions + Cosmos DB NoSQL)**

This repository contains the **complete Expense Tracker application**, including:

- **Frontend** → React (located in `/frontend`)
- **Backend** → Azure Functions (Node.js) with **Azure Cosmos DB (NoSQL)** (located in `/backend`)

---

## Repository Structure 📁

```text
expense-tracker-app/
│
├── exprense-tracker-frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env.local
│
├── expense-tracker-backend/
    ├── src/
        ├── functions/
        │   ├── createUser/
        │   ├── loginUser/
        │   ├── addExpense/
        │   ├── createSettingsForUser/
│   ├── host.json
│   ├── local.settings.json
│   ├── package.json
│   └── .env.local
│
└── README.md
```

---

## Tech Stack 🧰

### Frontend
- React
- React Router
- Fetch API
- Chart.js

### Backend
- Azure Functions (Node.js)
- Azure Cosmos DB (NoSQL)
- VS Code Azure Extensions

---

## Backend Setup ⚡

### Clone Repository
```bash
git clone https://github.com/<YOUR_USERNAME>/expense-tracker.git
cd expense-tracker/backend
```

### Install Dependencies
```bash
npm install
```

### Cosmos DB Environment Variable
Create `.env.local`:
```env
COSMOS_CONNECTION="YOUR_PRIMARY_CONNECTION_STRING"
```

### Run Backend
```bash
func start --verbose
```

Backend runs at:
```
http://localhost:7071
```

---

## Frontend Setup ⚛️

```bash
cd ../frontend
npm install
npm start
```

Frontend runs at:
```
http://localhost:3000
```

---

## Environment Variables 🔐

Frontend:
```env
REACT_APP_API_BASE_URL=http://localhost:7071/api
```

Backend:
```env
COSMOS_CONNECTION=...
```

---

## Notes
- Do not commit `.env.local`
- Use Azure App Settings for production
- Backend and frontend can be deployed independently

---

✅ Azure-ready  
✅ Firebase fully removed  
✅ Clean separation of concerns
