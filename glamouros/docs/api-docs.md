# 📖 GlamourOS REST API Reference

The backend API is exposed under `http://localhost:5000/api/v1`. Security routes are protected by JSON Web Token handshakes.

---

## 🔑 1. Authentication
Endpoints managing user profiles, JWT creation, and staff access roles.

### `POST /auth/login`
Authenticates a user and returns a bearer authorization token.
*   **Request Body**:
    ```json
    {
      "username": "admin",
      "password": "password"
    }
    ```
*   **Response**:
    ```json
    {
      "success": true,
      "token": "eyJhbGciOi...",
      "role": "CTO"
    }
    ```

---

## 🏢 2. Multi-Branch Operations
Endpoints listing salon branches, live capacities, and surcharge pricing tags.

### `GET /branches`
Returns a list of all active branch locations in the chain.

### `GET /branches/pricing?branchId={id}`
Returns a dynamic pricing advisory recommendation based on active therapist loads.
*   **Response**:
    ```json
    {
      "success": true,
      "branchId": "b1000000-...",
      "fillRate": 25,
      "recommendation": "Happy Hour",
      "factor": 0.85
    }
    ```

---

## 📅 3. Unified Scheduler & AI Engine
Endpoints scheduling bookings, resolving conflicts, and querying therapist workloads.

### `GET /appointments?branchId={id}&date={date}`
Lists all active bookings scheduled under the branch for a target calendar day.

### `GET /appointments/ai-recommend?serviceId={id}&branchId={id}`
Queries stylists specializations, reviews ratings, balances workload fatigue, and recommends the best therapist.

### `POST /appointments/create`
Books a new slot. Automatically runs collision checks.
*   **Request Body**:
    ```json
    {
      "customerId": "c1000000-...",
      "branchId": "b1000000-...",
      "stylistId": "st100000-...",
      "serviceId": "s1000000-...",
      "date": "2026-05-25",
      "time": "15:00",
      "source": "Walk-in"
    }
    ```
*   **Response (on conflict collision)**:
    ```json
    {
      "success": false,
      "conflict": true,
      "error": "Stylist Collision Alert!",
      "aiResolution": {
        "suggestedTime": "15:15",
        "message": "🤖 AI Resolution: Shifted appointment by +15 minutes."
      }
    }
    ```

---

## 💳 4. Smart POS Billing Terminal
Endpoints compiling retail tax transactions and generating dynamic invoices.

### `POST /pos/calculate`
Calculates subtotal, applies Gold/Platinum member tier discounts, adds CGST/SGST splits (18%), and generates a digital UPI QR string payload.

### `POST /pos/settle`
Settle transaction. Triggers auto-deductions in inventory, upgrades customer tier points, and appends commission payouts.

### `GET /pos/pdf/:invoiceNo`
Generates and streams a custom, certified GST invoice PDF compiled via PDFKit.
