# Full Stack React + Node + MongoDB (document_db)

This project is a full-stack example connecting a React frontend to MongoDB Atlas using Node.js/Express and Mongoose, with CRUD operations.

## ✅ Project setup

### 1) Install dependencies
```bash
npm install
```

### 2) Environment config
Create `.env` in project root with:
```env
VITE_SUPABASE_URL=<your supabase url>
VITE_SUPABASE_ANON_KEY=<your supabase anon key>
MONGO_URI=mongodb+srv://document_service_user:ARPi2ffAj4RZYux4@barangaycluster.seb5lfn.mongodb.net/document_db?authSource=admin&retryWrites=true&w=majority
MONGO_DB_NAME=document_db
SERVER_PORT=4000
```

### 3) Run backend + frontend
```bash
npm run server
npm run dev
```

## 📁 Folder structure
```
/ (project root)
  backend/
    server.js
    config/db.js
    models/userModel.js
    controllers/userController.js
    routes/userRoutes.js
  src/
    components/UserCrud.tsx
    pages/Dashboard.tsx
  .env
  package.json
  vite.config.ts
```

## 🔌 Backend details (Express + Mongoose)
- Connects to MongoDB Atlas `document_db`.
- Mongoose model: `User` (name, email, role).
- CRUD API routes:
  - `GET /api/users`
  - `GET /api/users/:id`
  - `POST /api/users`
  - `PUT /api/users/:id`
  - `DELETE /api/users/:id`

## 🧭 Frontend usage
- The React component `UserCrud` sends fetch requests to backend endpoints.
- Data is displayed in a list and can be created/deleted.
- Vite proxy is configured in `vite.config.ts` to forward `/api` to `http://localhost:4000`.

## 🧪 Test endpoints
```bash
curl http://localhost:4000/api/health
curl http://localhost:4000/api/users
```

## 🚀 How to use
1. Open frontend: `http://localhost:5173`
2. Use the user form to create users.
3. Confirm Mongo records in Atlas `document_db` collection.

## 📝 Notes
- This is intentionally wired to `document_db` only.
- Do not switch to `profiling_db`.
