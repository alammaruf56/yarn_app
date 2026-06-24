import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "database.json");

app.use(express.json());

// Type Definitions
interface Party {
  id: string;
  name: string;
  type: "supplier" | "customer";
  phone: string;
  address: string;
  yarn_types: string;
  balance: number; // calculated
}

interface Yarn {
  id: string;
  name: string;
  count: string;
  blend: string;
  stock: number; // calculated
  unit: "KG" | "LBS" | "BAG";
}

interface Transaction {
  id: string;
  invoice_id: string;
  date: string;
  party_id: string;
  party_name: string;
  party_type: "supplier" | "customer";
  particulars: string;
  debit: number;
  credit: number;
  balance_after?: number; // calculated
  yarn_id?: string;
  quantity?: number;
  unit?: "KG" | "LBS" | "BAG";
  rate?: number;
  entry_type: "goods" | "car_rent" | "labour" | "payment";
}

interface DBState {
  parties: Party[];
  yarns: Yarn[];
  transactions: Transaction[];
}

// Ensure database file exists and is initialized properly
function readDB(): DBState {
  if (!fs.existsSync(DB_FILE)) {
    const initialState: DBState = {
      parties: [],
      yarns: [],
      transactions: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialState, null, 2), "utf8");
    return initialState;
  }
  try {
    const data = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading DB file, recreating...", err);
    const initialState: DBState = {
      parties: [],
      yarns: [],
      transactions: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialState, null, 2), "utf8");
    return initialState;
  }
}

function writeDB(data: DBState) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
}

// Core Recalculation Engine
// Recalculates all party running balances and all yarn stock levels from transactions history
function recalculateState(db: DBState): DBState {
  // 1. Reset all yarn stocks to 0
  const yarnStockMap: Record<string, number> = {};
  db.yarns.forEach((y) => {
    yarnStockMap[y.id] = 0;
  });

  // 2. Recalculate yarn stock levels
  // Goods purchase increases stock. Goods sales decreases stock.
  db.transactions.forEach((tx) => {
    if (tx.yarn_id && tx.entry_type === "goods") {
      const qty = tx.quantity || 0;
      if (tx.party_type === "supplier") {
        // Purchase increases stock
        yarnStockMap[tx.yarn_id] = (yarnStockMap[tx.yarn_id] || 0) + qty;
      } else if (tx.party_type === "customer") {
        // Sales decreases stock
        yarnStockMap[tx.yarn_id] = (yarnStockMap[tx.yarn_id] || 0) - qty;
      }
    }
  });

  // Apply stocks back to yarns list
  db.yarns = db.yarns.map((y) => ({
    ...y,
    stock: yarnStockMap[y.id] || 0,
  }));

  // 3. Recalculate party balances
  // We sort transactions chronologically by date and creation order
  // Wait, let's sort transactions by date, and then stable sort or preserve the original array order.
  // To keep it clean and robust:
  const sortedTransactions = [...db.transactions].sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    // Maintain invoice group ordering: put goods first, then rent, then labour, then payment
    const typeOrder = { goods: 1, car_rent: 2, labour: 3, payment: 4 };
    const orderA = typeOrder[a.entry_type] || 5;
    const orderB = typeOrder[b.entry_type] || 5;
    if (orderA !== orderB) return orderA - orderB;
    return a.id.localeCompare(b.id);
  });

  // Track running balance for each party
  const partyRunningBalances: Record<string, number> = {};
  
  // Calculate balance_after for each sorted transaction
  const updatedTransactions = sortedTransactions.map((tx) => {
    const pId = tx.party_id;
    const prevBal = partyRunningBalances[pId] || 0;
    
    // Traditional Khatian running balance formula:
    // New Balance = Previous Balance + Credit (costs/sales/charges) - Debit (payments)
    const nextBal = prevBal + tx.credit - tx.debit;
    
    partyRunningBalances[pId] = nextBal;
    return {
      ...tx,
      balance_after: nextBal,
    };
  });

  // Replace database transactions with the recalculated/sorted transactions
  db.transactions = updatedTransactions;

  // Set current outstanding balance for each party
  db.parties = db.parties.map((p) => ({
    ...p,
    balance: partyRunningBalances[p.id] || 0,
  }));

  return db;
}

// REST API Endpoints

// Get full dashboard & summary stats
app.get("/api/dashboard", (req, res) => {
  const db = readDB();
  
  const totalYarnTypes = db.yarns.length;
  const totalStockKg = db.yarns.reduce((sum, y) => sum + Math.max(0, y.stock), 0); // exclude negative stocks just in case
  
  // Total purchases and sales values from transaction details
  let totalPurchase = 0;
  let totalSales = 0;

  db.transactions.forEach((tx) => {
    if (tx.entry_type === "goods") {
      const amount = tx.credit || 0;
      if (tx.party_type === "supplier") {
        totalPurchase += amount;
      } else if (tx.party_type === "customer") {
        totalSales += amount;
      }
    }
  });

  // Outstanding balances
  // Receivable = customers who owe us (customer balance > 0)
  // Payable = suppliers we owe (supplier balance > 0)
  let totalReceivable = 0;
  let totalPayable = 0;

  db.parties.forEach((p) => {
    if (p.type === "customer" && p.balance > 0) {
      totalReceivable += p.balance;
    } else if (p.type === "supplier" && p.balance > 0) {
      totalPayable += p.balance;
    }
  });

  res.json({
    totalYarnTypes,
    totalStockKg,
    totalPurchase,
    totalSales,
    totalReceivable,
    totalPayable,
  });
});

// PARTIES API
app.get("/api/parties", (req, res) => {
  const db = readDB();
  res.json(db.parties);
});

app.post("/api/parties", (req, res) => {
  const db = readDB();
  const { name, type, phone, address, yarn_types } = req.body;
  if (!name || !type) {
    return res.status(400).json({ error: "Name and type are required" });
  }

  const normalizedName = name.trim();
  // Check if party with same name and type already exists
  const existing = db.parties.find(
    (p) => p.name.toLowerCase() === normalizedName.toLowerCase() && p.type === type
  );

  if (existing) {
    return res.json(existing);
  }

  const newParty: Party = {
    id: "p_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
    name: normalizedName,
    type,
    phone: phone || "",
    address: address || "",
    yarn_types: yarn_types || "",
    balance: 0,
  };

  db.parties.push(newParty);
  writeDB(recalculateState(db));
  res.status(201).json(newParty);
});

app.put("/api/parties/:id", (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const { name, phone, address, yarn_types } = req.body;

  const partyIndex = db.parties.findIndex((p) => p.id === id);
  if (partyIndex === -1) {
    return res.status(404).json({ error: "Party not found" });
  }

  db.parties[partyIndex] = {
    ...db.parties[partyIndex],
    name: name ? name.trim() : db.parties[partyIndex].name,
    phone: phone !== undefined ? phone : db.parties[partyIndex].phone,
    address: address !== undefined ? address : db.parties[partyIndex].address,
    yarn_types: yarn_types !== undefined ? yarn_types : db.parties[partyIndex].yarn_types,
  };

  // Sync party name in transactions
  const updatedName = db.parties[partyIndex].name;
  db.transactions = db.transactions.map((tx) => {
    if (tx.party_id === id) {
      return { ...tx, party_name: updatedName };
    }
    return tx;
  });

  writeDB(recalculateState(db));
  res.json(db.parties[partyIndex]);
});

app.delete("/api/parties/:id", (req, res) => {
  let db = readDB();
  const { id } = req.params;

  db.parties = db.parties.filter((p) => p.id !== id);
  // Also delete associated transactions to keep ledger intact or keep them?
  // Usually, keeping them is dangerous without party. Let's filter out transactions of deleted party
  db.transactions = db.transactions.filter((tx) => tx.party_id !== id);

  writeDB(recalculateState(db));
  res.json({ success: true });
});

// YARNS API
app.get("/api/yarns", (req, res) => {
  const db = readDB();
  res.json(db.yarns);
});

app.post("/api/yarns", (req, res) => {
  const db = readDB();
  const { name, count, blend, unit } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Yarn name is required" });
  }

  const normalizedName = name.trim();
  const existing = db.yarns.find(
    (y) => y.name.toLowerCase() === normalizedName.toLowerCase()
  );

  if (existing) {
    return res.json(existing);
  }

  const newYarn: Yarn = {
    id: "y_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
    name: normalizedName,
    count: count || "",
    blend: blend || "",
    stock: 0,
    unit: unit || "KG",
  };

  db.yarns.push(newYarn);
  writeDB(recalculateState(db));
  res.status(201).json(newYarn);
});

app.put("/api/yarns/:id", (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const { name, count, blend, unit } = req.body;

  const index = db.yarns.findIndex((y) => y.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Yarn not found" });
  }

  db.yarns[index] = {
    ...db.yarns[index],
    name: name ? name.trim() : db.yarns[index].name,
    count: count !== undefined ? count : db.yarns[index].count,
    blend: blend !== undefined ? blend : db.yarns[index].blend,
    unit: unit !== undefined ? unit : db.yarns[index].unit,
  };

  writeDB(recalculateState(db));
  res.json(db.yarns[index]);
});

app.delete("/api/yarns/:id", (req, res) => {
  let db = readDB();
  const { id } = req.params;

  db.yarns = db.yarns.filter((y) => y.id !== id);
  // Re-link or remove yarn associated transactions
  db.transactions = db.transactions.map((tx) => {
    if (tx.yarn_id === id) {
      return { ...tx, yarn_id: undefined };
    }
    return tx;
  });

  writeDB(recalculateState(db));
  res.json({ success: true });
});

// TRANSACTIONS / INVOICES API (Entry API)
app.get("/api/transactions", (req, res) => {
  const db = readDB();
  res.json(db.transactions);
});

// Bulk invoice posting: handles goods entry, car rent, labour charge, and payment in one transaction group
app.post("/api/invoices", (req, res) => {
  const db = readDB();
  const {
    date,
    party_id,
    party_name,
    party_type,
    phone, // For auto-adding
    address, // For auto-adding
    yarn_name,
    yarn_id,
    yarn_count,
    yarn_blend,
    unit,
    quantity,
    rate,
    car_rent,
    labour,
    payment,
    payment_method, // 'Cash', 'RTGS', 'Fund Transfer', 'DBBL', etc.
  } = req.body;

  if (!party_name || !party_type) {
    return res.status(400).json({ error: "Party name and type are required" });
  }

  // 1. Resolve or Auto-Add Party
  let activePartyId = party_id;
  let activePartyName = party_name.trim();

  if (!activePartyId) {
    const existingParty = db.parties.find(
      (p) => p.name.toLowerCase() === activePartyName.toLowerCase() && p.type === party_type
    );
    if (existingParty) {
      activePartyId = existingParty.id;
      activePartyName = existingParty.name;
    } else {
      activePartyId = "p_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5);
      const newParty: Party = {
        id: activePartyId,
        name: activePartyName,
        type: party_type,
        phone: phone || "",
        address: address || "",
        yarn_types: yarn_name ? yarn_name.trim() : "",
        balance: 0,
      };
      db.parties.push(newParty);
    }
  }

  // 2. Resolve or Auto-Add Yarn Product (Only if purchasing/selling goods)
  let activeYarnId = yarn_id;
  let activeYarnName = yarn_name ? yarn_name.trim() : "";

  if (activeYarnName && !activeYarnId) {
    const existingYarn = db.yarns.find(
      (y) => y.name.toLowerCase() === activeYarnName.toLowerCase()
    );
    if (existingYarn) {
      activeYarnId = existingYarn.id;
      activeYarnName = existingYarn.name;
    } else {
      activeYarnId = "y_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5);
      const newYarn: Yarn = {
        id: activeYarnId,
        name: activeYarnName,
        count: yarn_count || "",
        blend: yarn_blend || "",
        stock: 0,
        unit: unit || "KG",
      };
      db.yarns.push(newYarn);
    }
  }

  const invoiceId = "inv_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5);
  const txDate = date || new Date().toISOString().split("T")[0];

  // 3. Create goods transaction
  const qtyNum = parseFloat(quantity) || 0;
  const rateNum = parseFloat(rate) || 0;
  const goodsCost = qtyNum * rateNum;

  if (activeYarnId && qtyNum > 0) {
    const goodsParticulars = `${activeYarnName} (${qtyNum} ${unit || "KG"} x ${rateNum})`;
    const goodsTx: Transaction = {
      id: "tx_" + Date.now() + "_goods",
      invoice_id: invoiceId,
      date: txDate,
      party_id: activePartyId,
      party_name: activePartyName,
      party_type,
      particulars: goodsParticulars,
      debit: 0,
      credit: goodsCost,
      yarn_id: activeYarnId,
      quantity: qtyNum,
      unit: unit || "KG",
      rate: rateNum,
      entry_type: "goods",
    };
    db.transactions.push(goodsTx);
  }

  // 4. Create Car Rent transaction (Credit - added charge)
  const carRentNum = parseFloat(car_rent) || 0;
  if (carRentNum > 0) {
    const rentTx: Transaction = {
      id: "tx_" + Date.now() + "_rent",
      invoice_id: invoiceId,
      date: txDate,
      party_id: activePartyId,
      party_name: activePartyName,
      party_type,
      particulars: "Car Rent",
      debit: 0,
      credit: carRentNum,
      entry_type: "car_rent",
    };
    db.transactions.push(rentTx);
  }

  // 5. Create Labour Charge transaction (Credit - added charge)
  const labourNum = parseFloat(labour) || 0;
  if (labourNum > 0) {
    const labourTx: Transaction = {
      id: "tx_" + Date.now() + "_labour",
      invoice_id: invoiceId,
      date: txDate,
      party_id: activePartyId,
      party_name: activePartyName,
      party_type,
      particulars: "Labour Charge",
      debit: 0,
      credit: labourNum,
      entry_type: "labour",
    };
    db.transactions.push(labourTx);
  }

  // 6. Create Payment transaction (Debit - decreases balance)
  const paymentNum = parseFloat(payment) || 0;
  if (paymentNum > 0) {
    const paymentTx: Transaction = {
      id: "tx_" + Date.now() + "_pay",
      invoice_id: invoiceId,
      date: txDate,
      party_id: activePartyId,
      party_name: activePartyName,
      party_type,
      particulars: payment_method ? `${payment_method}` : "Cash Payment",
      debit: paymentNum,
      credit: 0,
      entry_type: "payment",
    };
    db.transactions.push(paymentTx);
  }

  // Sync state
  writeDB(recalculateState(db));
  res.status(201).json({ success: true, invoice_id: invoiceId });
});

// Delete complete invoice/group of transactions
app.delete("/api/invoices/:invoice_id", (req, res) => {
  const db = readDB();
  const { invoice_id } = req.params;

  db.transactions = db.transactions.filter((tx) => tx.invoice_id !== invoice_id);

  writeDB(recalculateState(db));
  res.json({ success: true });
});

// Single payment transaction entry endpoint
app.post("/api/payments", (req, res) => {
  const db = readDB();
  const { date, party_id, particulars, amount } = req.body;

  if (!party_id || !amount) {
    return res.status(400).json({ error: "Party and amount are required" });
  }

  const party = db.parties.find((p) => p.id === party_id);
  if (!party) {
    return res.status(404).json({ error: "Party not found" });
  }

  const invoiceId = "inv_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5);
  const txDate = date || new Date().toISOString().split("T")[0];

  const payTx: Transaction = {
    id: "tx_" + Date.now() + "_single_pay",
    invoice_id: invoiceId,
    date: txDate,
    party_id: party.id,
    party_name: party.name,
    party_type: party.type,
    particulars: particulars || "Cash Receipt",
    debit: parseFloat(amount),
    credit: 0,
    entry_type: "payment",
  };

  db.transactions.push(payTx);
  writeDB(recalculateState(db));
  res.status(201).json(payTx);
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ABC Yarn House Backend running on http://localhost:${PORT}`);
  });
}

startServer();
