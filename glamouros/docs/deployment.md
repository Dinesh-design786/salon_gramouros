# ☁️ Supabase Cloud Setup & Platform Deployment

GlamourOS is built with a dual-mode database layer. While it boots flawlessly on a local in-memory mock datastore out-of-the-box, connecting a live production **Supabase PostgreSQL** cloud instance is incredibly simple.

---

## 💾 Part-1: Setup Supabase Cloud DB

1.  **Create a free account** at [Supabase](https://supabase.com).
2.  **Create a new project** named `GlamourOS`. Set your database password and choose your nearest hosting region (e.g. Asia Pacific - Mumbai).
3.  **Run Schema Triggers**:
    *   In the Supabase Sidebar, open the **SQL Editor**.
    *   Click **New Query**.
    *   Copy and paste the entire contents of [schema.sql](../database/schema.sql) and click **Run**. This establishes all UUID tables, indexes, and automated trigger functions for inventory stockouts, loyalty point promos, and payroll.
4.  **Run Seeds**:
    *   Create another SQL editor query tab.
    *   Copy the entire contents of [seed.sql](../database/seed.sql) and click **Run**. This populates your database with our Hyderabad branches, master stylists, VVIP Gold/Platinum members, and safety inventory products.

---

## 🔑 Part-2: Configure Environment Variables

Create a file named `.env` in the backend root directory (`e:\summerinternship\glamouros\backend\.env`) and add the following keys:

```ini
# Server Port Configuration
PORT=5000

# Supabase PostgreSQL Database URI Connection String
# Retrieve this from Supabase Dashboard -> Project Settings -> Database -> Connection String (URI pooled format)
DATABASE_URL="postgresql://postgres:[YOUR_DB_PASSWORD]@db.xxxx.supabase.co:5432/postgres?sslmode=require"

# JWT Authentication secret seed
JWT_SECRET="glamouros_super_secret_jwt_key_2026"

# Optional Cloud Integrations
TWILIO_WA_TOKEN=""
CLAUDE_API_KEY=""
```

Once saved, restart the Express server. The server will auto-detect the `DATABASE_URL` and log:
`⚡ PostgreSQL Database Pool bound to Supabase.`

---

## 🚀 Part-3: Deployment to Render / Vercel

If you want to host GlamourOS live for presentations:

1.  **Frontend (Next.js)**: Host on **Vercel** or **Netlify**.
    *   Simply import the `frontend/` directory.
    *   Add an environment variable `NEXT_PUBLIC_API_URL` pointing to your hosted Express backend.
2.  **Backend (Express)**: Host on **Render**, **Railway**, or **Heroku**.
    *   Deploy the `backend/` directory.
    *   Provide the `.env` parameters listed above in Render's Env settings panel.
