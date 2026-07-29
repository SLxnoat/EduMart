# EduMart React Client

The frontend application for the EduMart platform, built with React 18, Material UI (MUI), React Router v6, and Axios.

---

## ⚡ Quick Start Options

### Option A: Via Docker Compose (Production Build via Nginx)
From the project root:
```bash
docker compose up --build -d client
```
- Access application at: **[http://localhost](http://localhost)** (Port 80)

### Option B: Local Development Server
1. Navigate to client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set environment variable (optional, defaults to `http://localhost:5000/api`):
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```
4. Start development server:
   ```bash
   npm start
   ```
- Access application at: **[http://localhost:3000](http://localhost:3000)**

---

## 🧪 Testing

Frontend unit testing is built with **React Testing Library** and **Jest**.

```bash
# Run test suite once
npm test -- --watchAll=false
```

### Verified Test Suite
- `App.test.js`: Verifies full application rendering, header/footer mounting, and `AuthContext` loading state rendering.

---

## 🐳 Docker Deployment Details

The client image uses a **multi-stage build**:
1. **Stage 1 (Build)**: `node:20-alpine` installs dependencies and executes `npm run build`.
2. **Stage 2 (Production)**: `nginx:alpine` copies compiled production assets into `/usr/share/nginx/html` and uses `nginx.conf` to handle client-side Single Page Application (SPA) routing.

---

## 📁 Directory Structure

```
client/
├── src/
│   ├── __tests__/          # React component test suites (App.test.js)
│   ├── components/         # UI layout & navigation (Header, Footer, PrivateRoute)
│   ├── context/            # React Context providers (AuthContext)
│   ├── pages/              # View pages (Home, About, Auth, Products, Cart, Profile, Admin)
│   ├── services/           # Axios HTTP client configuration (api.js)
│   ├── styles/             # Global CSS & MUI Theme definitions
│   ├── App.js              # Root Application router component
│   ├── index.js            # React DOM root entry point
│   ├── routes.js           # Route declarations & PrivateRoute guards
│   └── theme.js            # Custom Material UI theme tokens
├── public/                 # Static assets & index.html template
├── Dockerfile              # Multi-stage Docker build configuration
├── nginx.conf              # Nginx web server configuration for SPA routing
└── package.json            # Client dependencies & scripts
```