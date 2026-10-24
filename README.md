# DineDesk — Professional Restaurant Billing System & Owner Dashboard

A modern, fast, and easy-to-use restaurant billing and financial management system built for restaurant owners.

---

## 🌟 Key Features

1. **Owner Dashboard**:
   - **4 Summary Cards**: Today's Total Income, Total Bills Today, Average Bill Amount, and Latest Bill Number.
   - **Daily Income Chart**: Interactive hourly revenue progression throughout the day (IST).
   - **Recent Bills Table**: Real-time transactions showing Bill No., Date & Time, Customer, Amount (₹), and Payment Method.
   - **Sample Demo Mode & Clean Slate**: Clearly labeled initial demo bills with a one-click button to clear or reload sample data.

2. **Restaurant Billing Page (`/billing`)**:
   - **Automatic Sequential Bill Numbering**: Atomic and unique bill numbers (`BILL-001`, `BILL-002`, `BILL-003`, etc.).
   - **Live Bill Date & Time**: Formatted in Indian Standard Time (en-IN).
   - **Configurable Restaurant Info**: Name, Address, Contact, and GSTIN automatically included.
   - **Optional Customer Details**: Name, table number, or notes.
   - **Quick Food Preset Chips**: One-tap addition for popular dishes (Dosas, Curries, Breads, Biryanis, Beverages).
   - **Interactive Line Items**: Custom food item name, quantity with `+` / `-` steppers, unit price, and live item total calculation.
   - **Accurate Financial Engine**: Subtotal, optional discount (Flat ₹ or % Percentage), configurable GST / Tax, and grand final amount.
   - **Neutral Payment Method by Default**: Strictly defaults to **"Not Specified"**; never forces Cash, UPI, or Card.

3. **Bill Management & History (`/bills`)**:
   - Search by Bill Number or Customer name.
   - Filter by date (Today, Yesterday, or custom date picker).
   - Filter by payment method (`Not Specified`, `Cash`, `UPI / GPay`, `Card`, `Net Banking`).
   - View complete itemized bill breakdowns.
   - Print receipts directly (Thermal 80mm or Standard A4).
   - Instant PDF download (`BILL-XXX-Receipt.pdf`).

4. **Owner Dashboard Reports (`/reports`)**:
   - Today's Total Income & Bills count.
   - Yesterday's Total Income & Bills count.
   - Current Month's Total Income & Bills count.
   - Total number of bills overall.
   - **Date-Specific Lookup**: Select any calendar date to view that day's total income, bills count, and list of transactions.
   - **Daily Income History**: 30-day chronological breakdown of income and order volume.
   - **Dynamic Payment Method Summary**: Only activates when payment methods are chosen; preserves neutral transparency for "Not Specified" bills.

5. **Receipt Print & PDF Engine**:
   - Clean receipt layout suitable for thermal POS receipt printers (80mm width) and standard desktop A4 printers.
   - Includes restaurant header, tax invoice title, customer details, itemized table, subtotal, discount, GST %, grand total in ₹, payment method, and customizable thank-you footer.

6. **Restaurant Settings (`/settings`)**:
   - Configure restaurant business name, address, contact phone, GSTIN, default tax rate, and receipt footer note.
   - Update Owner Quick PIN and username/password.
   - Persistent database controls: Clear Demo Data, Reload Demo Bills, or Reset Database.

7. **Database & Security**:
   - Built on a relational SQLite database (`dinedesk.db`) with foreign key cascading and transactions.
   - Refreshing or restarting never deletes saved customer bills.
   - Owner security: Protected dashboard and billing pages with session cookies.
   - Server-side amount validation and duplicate bill number prevention.

---

## 🚀 Quick Start Guide

### 1. Start the Application

The development server is already configured. To run it anytime:

\`\`\`bash
npm run dev
\`\`\`

The website is available at:
**[http://localhost:3000](http://localhost:3000)**

### 2. Owner Login Credentials

Access the dashboard using either of the following default credentials:

* **Quick Owner PIN**: `1234`
* **Username**: `owner`
* **Password**: `dinedesk123`

*(You can customize the PIN and password anytime in the **Settings** page).*

---

## 🗄️ Database Architecture

* **Database File**: `dinedesk.db` (SQLite relational database, auto-created in project root)
* **Tables**:
  * `Restaurant`: ID, Name, Address, Contact Number, GSTIN, Tax Rate, Receipt Footer, Owner PIN, Owner Username, Owner Password.
  * `Bills`: ID, Bill Number (`BILL-XXX`), Bill Date, Subtotal, Discount, Tax, Final Amount, Payment Method (`Not Specified` by default), Customer Name, Is Demo flag, Created At.
  * `BillItems`: ID, Bill ID (Foreign Key), Item Name, Quantity, Unit Price, Total Price.
