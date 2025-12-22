## TAR UMT Lost & Found – Setup Guide (Windows)

This guide explains **step‑by‑step** how to set up the project on Windows, including the **Python virtual environment**, required **libraries**, and **terminal commands** for both backend and frontend, **using Command Prompt** (`cmd.exe`).

---

## 1. Prerequisites

- **Python**: 3.10+ installed and added to PATH  
  - Check:  

```cmd
python --version
```

- **Node.js & npm**: Node 20+ recommended  
  - Check:

```cmd
node --version
npm --version
```

- **Git** (optional, if you are cloning the repo)

---

## 2. Backend (FastAPI) – Virtual Environment & Dependencies

All backend code is under the `backend` folder and uses **FastAPI**, **Uvicorn**, **Supabase**, and **PostgreSQL**.

### 2.1. Go to the backend folder

Open the project in your favourite IDE and run this on the **Terminal**:

```cmd
cd backend
```

OR

Open **Command Prompt** and run:

```cmd
cd "C:\Users\User\tarumt-lost-and-found\backend"
```

> If your path is different, adjust it accordingly. Find your project root path and copy the path and add `\backend` to the end of the path.

### 2.2. Create a virtual environment

```cmd
python -m venv venv
```

This creates a folder `venv` that contains an isolated Python environment for this project.

### 2.3. Activate the virtual environment

In **Command Prompt**:

```cmd
.\venv\Scripts\activate
```

When it’s activated, you should see `(venv)` at the beginning of your terminal prompt.

### 2.4. Install backend libraries

With the virtual environment **activated**, install dependencies from `requirements.txt`:

```cmd
pip install --upgrade pip
pip install -r requirements.txt
```

This will install (among others):
- **fastapi**
- **uvicorn**
- **psycopg2-binary**
- **supabase**
- **python-multipart**
- **pydantic**

### 2.5. Configure environment variables (recommended)

The backend uses Supabase and a PostgreSQL URL. For security, you should set environment variables instead of hard‑coding keys:

In **Command Prompt**, before running the server (valid for the current window only):

```cmd
set SUPABASE_URL=https://your-project-id.supabase.co
set SUPABASE_SERVICE_KEY=your-service-role-key
set DB_URL=postgresql://user:password@host:port/database
```

Then in `backend/main.py`, you can optionally update to read `DB_URL` from the environment if needed.  
For local testing, you may keep the current values, but **do not commit real secrets** to Git.

### 2.6. Run the FastAPI backend

From the `backend` folder with the virtual environment **activated**, run:

```cmd
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

- The API will be available at `http://127.0.0.1:8000`
- The automatic docs will be at `http://127.0.0.1:8000/docs`

Keep this terminal **open and running** while you work with the frontend.

---

## 3. Frontend (Next.js) – Dependencies & Dev Server

All frontend code is under the `frontend` folder and uses **Next.js 16**, **React 19**, **TypeScript**, and Tailwind CSS.

### 3.1. Go to the frontend folder

Open a **new Command Prompt window** and run:

```cmd
cd "C:\Users\User\tarumt-lost-and-found\frontend"
```
> Remember to adjust the path accordingly, if different.

### 3.2. Install Node dependencies

Install packages defined in `package.json`:

```cmd
npm install
```

This will install dependencies such as:
- **next**
- **react** / **react-dom**
- **@radix-ui/** components
- **react-hook-form**, **zod**, **tailwindcss**, etc.

### 3.3. Run the Next.js development server

Still in the `frontend` folder, start the dev server:

```cmd
npm run dev
```

By default, the app runs at:

```text
http://localhost:3000
```

Open this URL in your browser to use the TAR UMT Lost & Found interface.

---

## 4. Running the Full System (Backend + Frontend)

1. **Backend terminal**
   - Open **Command Prompt**
   - Navigate to `backend`
   - Activate virtual environment
   - Install dependencies (first time only)
   - Start FastAPI with Uvicorn:

   ```cmd
   cd "C:\Users\User\tarumt-lost-and-found\backend"
   venv\Scripts\activate
   uvicorn main:app --reload --host 127.0.0.1 --port 8000
   ```

2. **Frontend terminal**
   - Open another **Command Prompt** window
   - Navigate to `frontend`
   - Install dependencies (first time only)
   - Start Next.js dev server:

   ```cmd
   cd "C:\Users\User\tarumt-lost-and-found\frontend"
   npm install
   npm run dev
   ```

3. **Use the app**
   - Open `http://localhost:3000` in your browser.
   - Ensure the backend at `http://127.0.0.1:8000` is running so that API calls work.

---

## 5. Common Commands (Quick Reference)

- **Activate backend virtual environment (Command Prompt)**  

```cmd
cd "...\tarumt-lost-and-found\backend"
venv\Scripts\activate
```

- **Install backend dependencies**  

```cmd
pip install -r requirements.txt
```

- **Run backend (FastAPI + Uvicorn)**  

```cmd
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

- **Install frontend dependencies**  

```cmd
cd "...\tarumt-lost-and-found\frontend"
npm install
```

- **Run frontend (Next.js)**  

```cmd
npm run dev
```

---

## 6. Deactivating the Virtual Environment

When you are done working on the backend, you can deactivate the Python virtual environment by running:

```cmd
deactivate
```

Your terminal prompt will return to normal, and the global Python environment will be active again.
