import { getDb, getNextBillNumber, Bill, BillItem, RestaurantConfig, getRestaurantSettings } from './db';

export interface CreateBillInput {
  customer_name?: string;
  items: Array<{
    item_name: string;
    quantity: number;
    unit_price: number;
  }>;
  discount?: number;
  tax_rate?: number;
  payment_method?: string;
  is_demo?: boolean;
}

export function createBill(input: CreateBillInput): Bill {
  const db = getDb();

  if (!input.items || input.items.length === 0) {
    throw new Error('A bill must contain at least one item.');
  }

  // Sanitize and validate items
  const validatedItems: Array<{
    item_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }> = [];

  let calculatedSubtotal = 0;

  for (const item of input.items) {
    const name = (item.item_name || '').trim();
    if (!name) {
      throw new Error('All items must have a valid item name.');
    }
    const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
    const price = Math.max(0, Number(item.unit_price) || 0);
    const lineTotal = Math.round(qty * price * 100) / 100;

    calculatedSubtotal += lineTotal;
    validatedItems.push({
      item_name: name,
      quantity: qty,
      unit_price: price,
      total_price: lineTotal,
    });
  }

  calculatedSubtotal = Math.round(calculatedSubtotal * 100) / 100;

  // Validate discount
  const discount = Math.max(0, Math.min(calculatedSubtotal, Number(input.discount) || 0));

  // Determine tax rate
  const settings = getRestaurantSettings();
  const taxRate = input.tax_rate !== undefined ? Number(input.tax_rate) : settings.tax_rate;
  const taxableAmount = Math.max(0, calculatedSubtotal - discount);
  const tax = Math.round((taxableAmount * (taxRate / 100)) * 100) / 100;

  // Final amount payable
  const finalAmount = Math.round((calculatedSubtotal - discount + tax) * 100) / 100;

  // Neutral payment method by default
  const paymentMethod = (input.payment_method && input.payment_method.trim().length > 0)
    ? input.payment_method.trim()
    : 'Not Specified';

  const customerName = input.customer_name ? input.customer_name.trim() : null;
  const isDemo = input.is_demo ? 1 : 0;
  const billDate = new Date().toISOString();

  // Execute in a transaction to prevent race conditions on bill number
  const insertTransaction = db.transaction(() => {
    const billNumber = getNextBillNumber();

    const insertBillStmt = db.prepare(`
      INSERT INTO Bills (
        bill_number, bill_date, subtotal, discount, tax, final_amount,
        payment_method, customer_name, is_demo, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertBillStmt.run(
      billNumber,
      billDate,
      calculatedSubtotal,
      discount,
      tax,
      finalAmount,
      paymentMethod,
      customerName,
      isDemo,
      billDate
    );

    const billId = Number(result.lastInsertRowid);

    const insertItemStmt = db.prepare(`
      INSERT INTO BillItems (bill_id, item_name, quantity, unit_price, total_price)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const item of validatedItems) {
      insertItemStmt.run(billId, item.item_name, item.quantity, item.unit_price, item.total_price);
    }

    return { billId, billNumber };
  });

  const { billId } = insertTransaction();

  return getBillById(billId) as Bill;
}

export function getBillById(idOrNumber: string | number): Bill | null {
  const db = getDb();
  let bill: Bill | undefined;

  if (typeof idOrNumber === 'number' || /^\d+$/.test(String(idOrNumber))) {
    bill = db.prepare('SELECT * FROM Bills WHERE id = ?').get(Number(idOrNumber)) as Bill | undefined;
  } else {
    bill = db.prepare('SELECT * FROM Bills WHERE bill_number = ?').get(String(idOrNumber)) as Bill | undefined;
  }

  if (!bill) return null;

  const items = db.prepare('SELECT * FROM BillItems WHERE bill_id = ?').all(bill.id) as BillItem[];
  bill.items = items;
  return bill;
}

export interface BillFilterOptions {
  search?: string;
  date?: string; // YYYY-MM-DD
  paymentMethod?: string;
  isDemo?: boolean;
}

export function getAllBills(filters?: BillFilterOptions): Bill[] {
  const db = getDb();
  let sql = 'SELECT * FROM Bills WHERE 1=1';
  const params: any[] = [];

  if (filters?.search) {
    const term = `%${filters.search.trim()}%`;
    sql += ' AND (bill_number LIKE ? OR customer_name LIKE ?)';
    params.push(term, term);
  }

  if (filters?.date) {
    // Match date string starting with YYYY-MM-DD
    sql += ' AND substr(bill_date, 1, 10) = ?';
    params.push(filters.date.trim());
  }

  if (filters?.paymentMethod && filters.paymentMethod !== 'ALL') {
    sql += ' AND payment_method = ?';
    params.push(filters.paymentMethod.trim());
  }

  sql += ' ORDER BY id DESC';

  const bills = db.prepare(sql).all(...params) as Bill[];

  // Fetch items for each bill
  const getItemsStmt = db.prepare('SELECT * FROM BillItems WHERE bill_id = ?');
  for (const bill of bills) {
    bill.items = getItemsStmt.all(bill.id) as BillItem[];
  }

  return bills;
}

export function getDashboardOverview() {
  const db = getDb();

  // Determine today in local ISO (YYYY-MM-DD)
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  // Today's total income & bills count
  // Using actual saved bills for today
  const todayStats = db.prepare(`
    SELECT 
      COALESCE(SUM(final_amount), 0) as total_income,
      COUNT(*) as total_bills,
      COALESCE(AVG(final_amount), 0) as avg_amount
    FROM Bills
    WHERE substr(bill_date, 1, 10) = ?
  `).get(todayStr) as { total_income: number; total_bills: number; avg_amount: number };

  // Latest bill number
  const latestBill = db.prepare(`
    SELECT bill_number FROM Bills ORDER BY id DESC LIMIT 1
  `).get() as { bill_number: string } | undefined;

  // Next bill number to be generated
  const nextBillNumber = getNextBillNumber();

  // Hourly income breakdown for today (00:00 to 23:00)
  const todayBills = db.prepare(`
    SELECT bill_date, final_amount, bill_number, payment_method, is_demo
    FROM Bills
    WHERE substr(bill_date, 1, 10) = ?
    ORDER BY bill_date ASC
  `).all(todayStr) as Array<{ bill_date: string; final_amount: number; bill_number: string; payment_method: string; is_demo: number }>;

  // Build 2-hour or hourly buckets for the chart
  const hoursMap: { [hour: string]: number } = {};
  for (let h = 8; h <= 23; h += 2) {
    const label = `${h.toString().padStart(2, '0')}:00`;
    hoursMap[label] = 0;
  }

  for (const b of todayBills) {
    const d = new Date(b.bill_date);
    const hour = d.getHours();
    // Bucket into nearest 2-hour bracket: 8, 10, 12, 14, 16, 18, 20, 22
    const bucketHour = Math.min(22, Math.max(8, Math.floor(hour / 2) * 2));
    const label = `${bucketHour.toString().padStart(2, '0')}:00`;
    hoursMap[label] = (hoursMap[label] || 0) + b.final_amount;
  }

  const hourlyChart = Object.keys(hoursMap).map((time) => ({
    time,
    amount: Math.round(hoursMap[time] * 100) / 100,
  }));

  // Recent 6 bills
  const recentBills = db.prepare(`
    SELECT id, bill_number, bill_date, final_amount, payment_method, customer_name, is_demo
    FROM Bills
    ORDER BY id DESC
    LIMIT 6
  `).all() as Bill[];

  // Demo status check
  const totalBillsCount = db.prepare('SELECT COUNT(*) as count FROM Bills').get() as { count: number };
  const demoBillsCount = db.prepare('SELECT COUNT(*) as count FROM Bills WHERE is_demo = 1').get() as { count: number };
  const liveBillsCount = totalBillsCount.count - demoBillsCount.count;

  return {
    todayIncome: Math.round(todayStats.total_income * 100) / 100,
    todayBillsCount: todayStats.total_bills,
    avgBillAmount: Math.round(todayStats.avg_amount * 100) / 100,
    latestBillNumber: latestBill ? latestBill.bill_number : 'None',
    nextBillNumber,
    hourlyChart,
    recentBills,
    hasDemoData: demoBillsCount.count > 0,
    demoBillsCount: demoBillsCount.count,
    liveBillsCount,
  };
}

export function getReportsData(selectedDate?: string) {
  const db = getDb();
  const now = new Date();
  
  const todayStr = now.toISOString().slice(0, 10);
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const currentMonthStr = todayStr.slice(0, 7); // YYYY-MM

  // 1. Today's total income
  const todayRes = db.prepare(`
    SELECT COALESCE(SUM(final_amount), 0) as income, COUNT(*) as count
    FROM Bills WHERE substr(bill_date, 1, 10) = ?
  `).get(todayStr) as { income: number; count: number };

  // 2. Yesterday's total income
  const yesterdayRes = db.prepare(`
    SELECT COALESCE(SUM(final_amount), 0) as income, COUNT(*) as count
    FROM Bills WHERE substr(bill_date, 1, 10) = ?
  `).get(yesterdayStr) as { income: number; count: number };

  // 3. Current month's total income
  const monthRes = db.prepare(`
    SELECT COALESCE(SUM(final_amount), 0) as income, COUNT(*) as count
    FROM Bills WHERE substr(bill_date, 1, 7) = ?
  `).get(currentMonthStr) as { income: number; count: number };

  // 4. Total number of bills overall
  const totalRes = db.prepare(`
    SELECT COALESCE(SUM(final_amount), 0) as income, COUNT(*) as count FROM Bills
  `).get() as { income: number; count: number };

  // 5. Daily income report (last 14 days)
  const dailyHistory = db.prepare(`
    SELECT 
      substr(bill_date, 1, 10) as date,
      COALESCE(SUM(final_amount), 0) as total_income,
      COUNT(*) as bills_count
    FROM Bills
    GROUP BY substr(bill_date, 1, 10)
    ORDER BY date DESC
    LIMIT 30
  `).all() as Array<{ date: string; total_income: number; bills_count: number }>;

  // 6. Selected date report
  const targetDate = selectedDate || todayStr;
  const selectedDateStats = db.prepare(`
    SELECT 
      COALESCE(SUM(final_amount), 0) as total_income,
      COUNT(*) as bills_count,
      COALESCE(AVG(final_amount), 0) as avg_amount
    FROM Bills
    WHERE substr(bill_date, 1, 10) = ?
  `).get(targetDate) as { total_income: number; bills_count: number; avg_amount: number };

  const selectedDateBills = db.prepare(`
    SELECT * FROM Bills
    WHERE substr(bill_date, 1, 10) = ?
    ORDER BY id DESC
  `).all(targetDate) as Bill[];

  // Populate items for selected date bills
  const getItemsStmt = db.prepare('SELECT * FROM BillItems WHERE bill_id = ?');
  for (const b of selectedDateBills) {
    b.items = getItemsStmt.all(b.id) as BillItem[];
  }

  // 7. Payment method summary ONLY when payment methods are specified!
  // Filter out 'Not Specified'
  const specifiedPaymentStats = db.prepare(`
    SELECT 
      payment_method,
      COUNT(*) as count,
      COALESCE(SUM(final_amount), 0) as total_amount
    FROM Bills
    WHERE payment_method != 'Not Specified' AND payment_method IS NOT NULL AND payment_method != ''
    GROUP BY payment_method
    ORDER BY total_amount DESC
  `).all() as Array<{ payment_method: string; count: number; total_amount: number }>;

  const notSpecifiedCount = db.prepare(`
    SELECT COUNT(*) as count, COALESCE(SUM(final_amount), 0) as total_amount
    FROM Bills
    WHERE payment_method = 'Not Specified' OR payment_method IS NULL OR payment_method = ''
  `).get() as { count: number; total_amount: number };

  return {
    todayIncome: Math.round(todayRes.income * 100) / 100,
    todayCount: todayRes.count,
    yesterdayIncome: Math.round(yesterdayRes.income * 100) / 100,
    yesterdayCount: yesterdayRes.count,
    monthIncome: Math.round(monthRes.income * 100) / 100,
    monthCount: monthRes.count,
    totalBillsCount: totalRes.count,
    allTimeIncome: Math.round(totalRes.income * 100) / 100,
    dailyHistory,
    selectedDate: targetDate,
    selectedDateIncome: Math.round(selectedDateStats.total_income * 100) / 100,
    selectedDateBillsCount: selectedDateStats.bills_count,
    selectedDateAvg: Math.round(selectedDateStats.avg_amount * 100) / 100,
    selectedDateBills,
    specifiedPaymentStats,
    notSpecifiedCount: notSpecifiedCount.count,
    notSpecifiedAmount: Math.round(notSpecifiedCount.total_amount * 100) / 100,
    hasSpecifiedPayments: specifiedPaymentStats.length > 0,
  };
}
