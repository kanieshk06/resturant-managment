import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const DB_PATH = path.join(process.cwd(), 'dinedesk.db');

// Singleton database connection
let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!dbInstance) {
    dbInstance = new Database(DB_PATH);
    dbInstance.pragma('journal_mode = WAL');
    dbInstance.pragma('foreign_keys = ON');
    initTables(dbInstance);
  }
  return dbInstance;
}

export interface RestaurantConfig {
  id: number;
  name: string;
  address: string;
  contact_number: string;
  gstin?: string;
  tax_rate: number;
  receipt_footer: string;
  owner_pin: string;
  owner_username: string;
  owner_password?: string;
  created_at?: string;
}

export interface BillItem {
  id?: number;
  bill_id?: number;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Bill {
  id: number;
  bill_number: string;
  bill_date: string;
  subtotal: number;
  discount: number;
  tax: number;
  final_amount: number;
  payment_method: string;
  customer_name: string | null;
  is_demo: number;
  created_at: string;
  items?: BillItem[];
}

function initTables(db: Database.Database) {
  // Restaurant Settings Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS Restaurant (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      contact_number TEXT,
      gstin TEXT,
      tax_rate REAL DEFAULT 5.0,
      receipt_footer TEXT DEFAULT 'Thank you for dining with us! Please visit again.',
      owner_pin TEXT DEFAULT '1234',
      owner_username TEXT DEFAULT 'owner',
      owner_password TEXT DEFAULT 'dinedesk123',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Bills Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS Bills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bill_number TEXT UNIQUE NOT NULL,
      bill_date TEXT NOT NULL,
      subtotal REAL NOT NULL,
      discount REAL DEFAULT 0,
      tax REAL DEFAULT 0,
      final_amount REAL NOT NULL,
      payment_method TEXT DEFAULT 'Not Specified',
      customer_name TEXT,
      is_demo INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Bill Items Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS BillItems (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bill_id INTEGER NOT NULL REFERENCES Bills(id) ON DELETE CASCADE,
      item_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      total_price REAL NOT NULL
    );
  `);

  // Index for fast searching and sorting
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_bills_date ON Bills(bill_date);
    CREATE INDEX IF NOT EXISTS idx_bills_number ON Bills(bill_number);
    CREATE INDEX IF NOT EXISTS idx_bill_items_bill_id ON BillItems(bill_id);
  `);

  // Seed default restaurant settings if not present
  const restaurant = db.prepare('SELECT * FROM Restaurant WHERE id = 1').get();
  if (!restaurant) {
    db.prepare(`
      INSERT INTO Restaurant (id, name, address, contact_number, gstin, tax_rate, receipt_footer, owner_pin, owner_username, owner_password)
      VALUES (1, 'DineDesk Fine Dining', '14, Residency Road, MG Road Area, Bengaluru, Karnataka 560025', '+91 98450 12345', '29AABCU9603R1Z7', 5.0, 'Thank you for dining with DineDesk! Please visit again.', '1234', 'owner', 'dinedesk123')
    `).run();
  }

  // Check if any bills exist. If empty, seed initial demo bills as requested by prompt
  const billCount = db.prepare('SELECT COUNT(*) as count FROM Bills').get() as { count: number };
  if (billCount.count === 0) {
    seedDemoData(db);
  }
}

export function seedDemoData(db: Database.Database) {
  const insertBill = db.prepare(`
    INSERT INTO Bills (bill_number, bill_date, subtotal, discount, tax, final_amount, payment_method, customer_name, is_demo, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
  `);

  const insertItem = db.prepare(`
    INSERT INTO BillItems (bill_id, item_name, quantity, unit_price, total_price)
    VALUES (?, ?, ?, ?, ?)
  `);

  const now = new Date();
  const formatISO = (d: Date) => d.toISOString();

  // Create BILL-001 (₹450, Not Specified) as specified in prompt section 2
  const time1 = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago
  const res1 = insertBill.run(
    'BILL-001',
    formatISO(time1),
    428.57,
    0,
    21.43,
    450.00,
    'Not Specified',
    'Guest Walk-in',
    formatISO(time1)
  );
  const bill1Id = Number(res1.lastInsertRowid);
  insertItem.run(bill1Id, 'Masala Dosa', 2, 120, 240);
  insertItem.run(bill1Id, 'Filter Coffee', 2, 50, 100);
  insertItem.run(bill1Id, 'Medu Vada (2 pcs)', 1, 88.57, 88.57);

  // Create BILL-002 (₹250, Not Specified) as specified in prompt section 2
  const time2 = new Date(now.getTime() - 45 * 60 * 1000); // 45 mins ago
  const res2 = insertBill.run(
    'BILL-002',
    formatISO(time2),
    238.10,
    0,
    11.90,
    250.00,
    'Not Specified',
    'Table 4',
    formatISO(time2)
  );
  const bill2Id = Number(res2.lastInsertRowid);
  insertItem.run(bill2Id, 'Paneer Butter Masala', 1, 190, 190);
  insertItem.run(bill2Id, 'Butter Naan', 1, 48.10, 48.10);
}

// Generate the next sequential bill number e.g. BILL-001, BILL-002, BILL-003
export function getNextBillNumber(): string {
  const db = getDb();
  const bills = db.prepare('SELECT bill_number FROM Bills').all() as { bill_number: string }[];
  
  let maxNum = 0;
  for (const b of bills) {
    const match = b.bill_number.match(/^BILL-(\d+)$/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }

  const nextNum = maxNum + 1;
  const padded = nextNum.toString().padStart(3, '0');
  return `BILL-${padded}`;
}

export function getRestaurantSettings(): RestaurantConfig {
  const db = getDb();
  const row = db.prepare('SELECT * FROM Restaurant WHERE id = 1').get() as RestaurantConfig;
  return row;
}

export function updateRestaurantSettings(data: Partial<RestaurantConfig>): RestaurantConfig {
  const db = getDb();
  const current = getRestaurantSettings();

  const updated: RestaurantConfig = {
    ...current,
    name: data.name !== undefined ? data.name.trim() : current.name,
    address: data.address !== undefined ? data.address.trim() : current.address,
    contact_number: data.contact_number !== undefined ? data.contact_number.trim() : current.contact_number,
    gstin: data.gstin !== undefined ? data.gstin.trim() : current.gstin,
    tax_rate: data.tax_rate !== undefined ? Number(data.tax_rate) : current.tax_rate,
    receipt_footer: data.receipt_footer !== undefined ? data.receipt_footer.trim() : current.receipt_footer,
    owner_pin: data.owner_pin !== undefined ? data.owner_pin.trim() : current.owner_pin,
    owner_username: data.owner_username !== undefined ? data.owner_username.trim() : current.owner_username,
  };

  if (data.owner_password && data.owner_password.trim().length > 0) {
    updated.owner_password = data.owner_password.trim();
  }

  db.prepare(`
    UPDATE Restaurant
    SET name = ?, address = ?, contact_number = ?, gstin = ?, tax_rate = ?, receipt_footer = ?, owner_pin = ?, owner_username = ?, owner_password = ?
    WHERE id = 1
  `).run(
    updated.name,
    updated.address,
    updated.contact_number,
    updated.gstin,
    updated.tax_rate,
    updated.receipt_footer,
    updated.owner_pin,
    updated.owner_username,
    updated.owner_password
  );

  return updated;
}

export function clearDemoData(): { deleted: number } {
  const db = getDb();
  const res = db.prepare('DELETE FROM Bills WHERE is_demo = 1').run();
  return { deleted: res.changes };
}

export function resetAllBills(): { deleted: number } {
  const db = getDb();
  const res = db.prepare('DELETE FROM Bills').run();
  return { deleted: res.changes };
}

export function reloadDemoData(): void {
  const db = getDb();
  db.prepare('DELETE FROM Bills WHERE is_demo = 1').run();
  seedDemoData(db);
}
