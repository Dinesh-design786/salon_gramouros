# 🌟 GlamourOS: AI-Powered Multi-Branch Salon Management SaaS

GlamourOS is a high-fidelity, startup-grade SaaS Operating System engineered for Indian retail salon chains (e.g. Hyderabad markets). It features a sleek, Linear-inspired dark-mode flat UI design. The platform solves omnichannel appointment scheduling, automated payroll commissions ledgers, POS billing terminals with CGST/SGST splits, dynamic pricing adjustments, and predictive inventory forecasting under a single reactive monorepo workspace.

---

## 🏗️ Folder Architectural Map

```text
glamouros/
├── package.json                    # Workspace root for concurrent execution
├── database/
│   ├── schema.sql                  # PostgreSQL DB isolated tables & triggers
│   ├── seed.sql                    # High-fidelity Hyderabad seed data
│   └── migrations/                 # PostgreSQL migrations directory
├── docs/
│   ├── README.md                   # Setup guide
│   ├── architecture.md             # System architecture documentation
│   ├── api-docs.md                 # REST API endpoints reference
│   └── demo-script.md              # 7-Step Hackathon Presentation runway
├── backend/
│   ├── package.json                # Express server dependencies
│   ├── tsconfig.json               # Backend compilation settings
│   ├── .env                        # Backend environment settings
│   └── src/
│       ├── config/                 # DB Pool and Mock stores configs
│       ├── controllers/            # Business logic and AI engines controllers
│       ├── middleware/             # Auth and RBAC middleware
│       ├── models/                 # DB models definitions
│       ├── routes/                 # Express API and WhatsApp routing routes
│       ├── services/               # Shared backend services
│       ├── sockets/                # Socket.IO synchronization helpers
│       ├── utils/                  # Backend helpers utilities
│       └── server.ts               # Express bootstrapper listening on Port 5000
└── frontend/
    ├── package.json                # Next.js 14 client dependencies
    ├── .env.local                  # Next.js client environment overrides
    └── src/
        ├── app/                    # Layout, templates, and dashboard router pages
        ├── components/             # Reusable UI elements and separated tab components
        │   ├── dashboard/          # Central dashboard view files
        │   ├── booking/            # Calendars scheduler widgets
        │   ├── billing/            # Invoices billing POS terminals
        │   ├── analytics/          # Recharts comparative graphs
        │   ├── inventory/          # Safety stocks replenish lists
        │   └── ui/                 # Reusable cards, badges, and flat buttons
        ├── hooks/                  # NextJS custom hooks
        ├── lib/                    # Standard utilities libraries
        ├── services/               # API communications classes
        ├── store/                  # Zustand state container coordinating syncing
        ├── styles/                 # Custom styling frameworks
        └── utils/                  # Client-side formatters helpers
```

---

## 🛠️ Installation & Local Startup

GlamourOS is built as an integrated monorepo. You can launch both the Next.js client (port 3000) and Express server (port 5000) concurrently with a single command:

1.  **Open terminal** in the platform directory:
    ```bash
    cd e:\summerinternship\glamouros
    ```
2.  **Install dependencies** across both workspaces:
    ```bash
    npm install
    npm run install:all
    ```
3.  **Bootload both servers** concurrently:
    ```bash
    npm run dev
    ```
4.  **Open in Browser**:
    *   SaaS Client Landing Page: [http://localhost:3000](http://localhost:3000)
    *   REST API Health Check: [http://localhost:5000/health](http://localhost:5000/health)

---

## ⚡ Technical Core & Presentation Highlights

If the judges ask about the technical stack:
1.  **Dual-Mode Relational DB syncing (Zustand + pg):** If the Supabase database is offline, the client state manager (`mainStore.ts`) auto-detects this and redirects actions to an automated client-side memory database. This guarantees a flawless pitch without crashing on blank env keys.
2.  **Indian Retail GST Invoicing:** Invoices calculate standard **SAC Code 999721** beauty splits, applying standard **18% GST (9% CGST + 9% SGST)**. Settle invoice yields options to download a dynamic PDF invoice compiled via `pdfkit` nodes.
3.  **Dynamic Surge Multiplier Pricing:** If branch workloads spike past 85% occupancy, surge pricing rules auto-multiply prices by **1.2x**. When workload drops below 30%, happy hour deals auto-apply **15% discounts** to fill empty therapist blocks.
4.  **Omnichannel Chat Simulation:** The WhatsApp tab simulates multi-lingual Hinglish text inquiries, parses time slots, checks stylist workloads, and adjusts double-bookings conflict-free.
