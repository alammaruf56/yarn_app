import React, { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  PlusCircle,
  BookOpen,
  Users,
  Database,
  History,
  Search,
  Printer,
  Download,
  Trash2,
  Edit2,
  Phone,
  MapPin,
  TrendingUp,
  TrendingDown,
  Layers,
  ChevronRight,
  UserPlus,
  RefreshCw,
  Plus,
  Check,
  X
} from "lucide-react";
import { Party, Yarn, Transaction, DashboardStats } from "./types";

export default function App() {
  // Navigation / Tabs
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "purchase" | "sales" | "supplier_ledger" | "customer_ledger" | "directory" | "inventory" | "history"
  >("dashboard");

  // Core Application State
  const [stats, setStats] = useState<DashboardStats>({
    totalYarnTypes: 0,
    totalStockKg: 0,
    totalPurchase: 0,
    totalSales: 0,
    totalReceivable: 0,
    totalPayable: 0,
  });
  const [parties, setParties] = useState<Party[]>([]);
  const [yarns, setYarns] = useState<Yarn[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Search and Filter States
  const [partySearchQuery, setPartySearchQuery] = useState("");
  const [yarnSearchQuery, setYarnSearchQuery] = useState("");
  const [txSearchQuery, setTxSearchQuery] = useState("");
  const [txTypeFilter, setTxTypeFilter] = useState("all");
  const [txPartyFilter, setTxPartyFilter] = useState("all");
  const [txDateFrom, setTxDateFrom] = useState("");
  const [txDateTo, setTxDateTo] = useState("");

  // Directory Sub-tab
  const [directoryTab, setDirectoryTab] = useState<"suppliers" | "customers">("suppliers");

  // Selected Ledger States
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");

  // Edit Modals State
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const [editingYarn, setEditingYarn] = useState<Yarn | null>(null);

  // Quick Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentPartyId, setPaymentPartyId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentParticulars, setPaymentParticulars] = useState("Cash Receipt");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);

  // Form States: Purchase Entry
  const [purchaseForm, setPurchaseForm] = useState({
    date: new Date().toISOString().split("T")[0],
    supplier_name: "",
    supplier_id: "",
    supplier_phone: "",
    supplier_address: "",
    yarn_name: "",
    yarn_id: "",
    yarn_count: "",
    yarn_blend: "",
    unit: "KG" as "KG" | "LBS" | "BAG",
    quantity: "",
    rate: "",
    car_rent: "",
    labour: "",
    payment: "",
    payment_method: "Cash Payment",
  });

  // Form States: Sales Entry
  const [salesForm, setSalesForm] = useState({
    date: new Date().toISOString().split("T")[0],
    customer_name: "",
    customer_id: "",
    customer_phone: "",
    customer_address: "",
    yarn_name: "",
    yarn_id: "",
    yarn_count: "",
    yarn_blend: "",
    unit: "KG" as "KG" | "LBS" | "BAG",
    quantity: "",
    rate: "",
    car_rent: "",
    labour: "",
    payment: "",
    payment_method: "Cash Receipt",
  });

  // Auto-Suggest Dropdown States
  const [supplierSuggestions, setSupplierSuggestions] = useState<Party[]>([]);
  const [customerSuggestions, setCustomerSuggestions] = useState<Party[]>([]);
  const [yarnSuggestions, setYarnSuggestions] = useState<Yarn[]>([]);
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showYarnDropdown, setShowYarnDropdown] = useState(false);

  // Fetch all initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [resDashboard, resParties, resYarns, resTx] = await Promise.all([
        fetch("/api/dashboard").then((r) => r.json()),
        fetch("/api/parties").then((r) => r.json()),
        fetch("/api/yarns").then((r) => r.json()),
        fetch("/api/transactions").then((r) => r.json()),
      ]);

      setStats(resDashboard);
      setParties(resParties);
      setYarns(resYarns);
      setTransactions(resTx);

      // Set default selected ledger parties if available
      const firstSupplier = resParties.find((p: Party) => p.type === "supplier");
      if (firstSupplier && !selectedSupplierId) setSelectedSupplierId(firstSupplier.id);

      const firstCustomer = resParties.find((p: Party) => p.type === "customer");
      if (firstCustomer && !selectedCustomerId) setSelectedCustomerId(firstCustomer.id);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Recalculate stats on key actions
  const triggerRecalculation = async () => {
    await fetchData();
  };

  // Helper function to format money (Tk.)
  const formatTk = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount) + " ৳";
  };

  // Helper to check if negative and format
  const formatBalance = (amount: number) => {
    if (amount < 0) {
      return `(${formatTk(Math.abs(amount))})`;
    }
    return formatTk(amount);
  };

  // -----------------------------------------
  // FORM HANDLERS & AUTO-SUGGEST
  // -----------------------------------------

  // Handle Supplier Input for Purchase
  const handleSupplierInput = (val: string) => {
    setPurchaseForm((prev) => ({ ...prev, supplier_name: val, supplier_id: "" }));
    if (val.trim().length > 0) {
      const filtered = parties.filter(
        (p) => p.type === "supplier" && p.name.toLowerCase().includes(val.toLowerCase())
      );
      setSupplierSuggestions(filtered);
      setShowSupplierDropdown(true);
    } else {
      setSupplierSuggestions([]);
      setShowSupplierDropdown(false);
    }
  };

  const selectSupplierSuggestion = (party: Party) => {
    setPurchaseForm((prev) => ({
      ...prev,
      supplier_name: party.name,
      supplier_id: party.id,
      supplier_phone: party.phone,
      supplier_address: party.address,
    }));
    setShowSupplierDropdown(false);
  };

  // Handle Customer Input for Sales
  const handleCustomerInput = (val: string) => {
    setSalesForm((prev) => ({ ...prev, customer_name: val, customer_id: "" }));
    if (val.trim().length > 0) {
      const filtered = parties.filter(
        (p) => p.type === "customer" && p.name.toLowerCase().includes(val.toLowerCase())
      );
      setCustomerSuggestions(filtered);
      setShowCustomerDropdown(true);
    } else {
      setCustomerSuggestions([]);
      setShowCustomerDropdown(false);
    }
  };

  const selectCustomerSuggestion = (party: Party) => {
    setSalesForm((prev) => ({
      ...prev,
      customer_name: party.name,
      customer_id: party.id,
      customer_phone: party.phone,
      customer_address: party.address,
    }));
    setShowCustomerDropdown(false);
  };

  // Handle Yarn Input
  const handleYarnInput = (val: string, formType: "purchase" | "sales") => {
    const updateForm = formType === "purchase" ? setPurchaseForm : setSalesForm;
    updateForm((prev: any) => ({ ...prev, yarn_name: val, yarn_id: "" }));

    if (val.trim().length > 0) {
      const filtered = yarns.filter((y) => y.name.toLowerCase().includes(val.toLowerCase()));
      setYarnSuggestions(filtered);
      setShowYarnDropdown(true);
    } else {
      setYarnSuggestions([]);
      setShowYarnDropdown(false);
    }
  };

  const selectYarnSuggestion = (yarn: Yarn, formType: "purchase" | "sales") => {
    const updateForm = formType === "purchase" ? setPurchaseForm : setSalesForm;
    updateForm((prev: any) => ({
      ...prev,
      yarn_name: yarn.name,
      yarn_id: yarn.id,
      yarn_count: yarn.count,
      yarn_blend: yarn.blend,
      unit: yarn.unit,
    }));
    setShowYarnDropdown(false);
  };

  // Submit Purchase Entry
  const handlePurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseForm.supplier_name.trim()) return alert("Supplier Name is required");
    if (!purchaseForm.yarn_name.trim()) return alert("Yarn Name is required");

    const payload = {
      date: purchaseForm.date,
      party_id: purchaseForm.supplier_id,
      party_name: purchaseForm.supplier_name,
      party_type: "supplier",
      phone: purchaseForm.supplier_phone,
      address: purchaseForm.supplier_address,
      yarn_name: purchaseForm.yarn_name,
      yarn_id: purchaseForm.yarn_id,
      yarn_count: purchaseForm.yarn_count,
      yarn_blend: purchaseForm.yarn_blend,
      unit: purchaseForm.unit,
      quantity: purchaseForm.quantity,
      rate: purchaseForm.rate,
      car_rent: purchaseForm.car_rent,
      labour: purchaseForm.labour,
      payment: purchaseForm.payment,
      payment_method: purchaseForm.payment_method,
    };

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert("Purchase transaction posted successfully!");
        // Reset Form
        setPurchaseForm({
          date: new Date().toISOString().split("T")[0],
          supplier_name: "",
          supplier_id: "",
          supplier_phone: "",
          supplier_address: "",
          yarn_name: "",
          yarn_id: "",
          yarn_count: "",
          yarn_blend: "",
          unit: "KG",
          quantity: "",
          rate: "",
          car_rent: "",
          labour: "",
          payment: "",
          payment_method: "Cash Payment",
        });
        await triggerRecalculation();
        setActiveTab("supplier_ledger");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Submit Sales Entry
  const handleSalesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salesForm.customer_name.trim()) return alert("Customer Name is required");
    if (!salesForm.yarn_name.trim()) return alert("Yarn Name is required");

    // Check inventory stock warning
    const selectedYarn = yarns.find((y) => y.id === salesForm.yarn_id);
    const saleQty = parseFloat(salesForm.quantity) || 0;
    if (selectedYarn && selectedYarn.stock < saleQty) {
      if (!confirm(`Warning: Sales quantity (${saleQty} ${selectedYarn.unit}) exceeds current available stock (${selectedYarn.stock} ${selectedYarn.unit}). Do you want to continue?`)) {
        return;
      }
    }

    const payload = {
      date: salesForm.date,
      party_id: salesForm.customer_id,
      party_name: salesForm.customer_name,
      party_type: "customer",
      phone: salesForm.customer_phone,
      address: salesForm.customer_address,
      yarn_name: salesForm.yarn_name,
      yarn_id: salesForm.yarn_id,
      yarn_count: salesForm.yarn_count,
      yarn_blend: salesForm.yarn_blend,
      unit: salesForm.unit,
      quantity: salesForm.quantity,
      rate: salesForm.rate,
      car_rent: salesForm.car_rent,
      labour: salesForm.labour,
      payment: salesForm.payment,
      payment_method: salesForm.payment_method,
    };

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert("Sales transaction posted successfully!");
        setSalesForm({
          date: new Date().toISOString().split("T")[0],
          customer_name: "",
          customer_id: "",
          customer_phone: "",
          customer_address: "",
          yarn_name: "",
          yarn_id: "",
          yarn_count: "",
          yarn_blend: "",
          unit: "KG",
          quantity: "",
          rate: "",
          car_rent: "",
          labour: "",
          payment: "",
          payment_method: "Cash Receipt",
        });
        await triggerRecalculation();
        setActiveTab("customer_ledger");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Post single Payment/Receipt Receipt (e.g. Bank/RTGS/Cash)
  const handlePostPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentPartyId) return alert("Please select a party");
    if (!paymentAmount) return alert("Please enter the amount");

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: paymentDate,
          party_id: paymentPartyId,
          particulars: paymentParticulars,
          amount: paymentAmount,
        }),
      });

      if (res.ok) {
        alert("Payment transaction posted successfully!");
        setShowPaymentModal(false);
        setPaymentAmount("");
        await triggerRecalculation();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Delete invoice
  const handleDeleteInvoice = async (invoiceId: string) => {
    if (confirm("Are you sure you want to delete this transaction entry? This will update running balances and stocks automatically.")) {
      try {
        const res = await fetch(`/api/invoices/${invoiceId}`, { method: "DELETE" });
        if (res.ok) {
          alert("Entry deleted successfully.");
          await triggerRecalculation();
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  // Edit Party Handler
  const handleSavePartyEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingParty) return;

    try {
      const res = await fetch(`/api/parties/${editingParty.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingParty),
      });

      if (res.ok) {
        setEditingParty(null);
        await triggerRecalculation();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Edit Yarn Handler
  const handleSaveYarnEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingYarn) return;

    try {
      const res = await fetch(`/api/yarns/${editingYarn.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingYarn),
      });

      if (res.ok) {
        setEditingYarn(null);
        await triggerRecalculation();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Delete Party
  const handleDeleteParty = async (id: string) => {
    if (confirm("Are you sure you want to delete this party? All related transactions will be deleted, and all balances will be recalculated!")) {
      try {
        const res = await fetch(`/api/parties/${id}`, { method: "DELETE" });
        if (res.ok) {
          await triggerRecalculation();
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  // Delete Yarn
  const handleDeleteYarn = async (id: string) => {
    if (confirm("Are you sure you want to delete this yarn? It will be removed from inventory lists.")) {
      try {
        const res = await fetch(`/api/yarns/${id}`, { method: "DELETE" });
        if (res.ok) {
          await triggerRecalculation();
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  // CSV Export utility
  const exportToCSV = (data: any[], fileName: string) => {
    if (!data || !data.length) return alert("No data available to export");
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((item) => {
      return Object.values(item)
        .map((val: any) => {
          let str = String(val);
          if (str.includes(",") || str.includes("\n") || str.includes('"')) {
            str = `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(",");
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter Transactions List
  const filteredTransactions = transactions.filter((tx) => {
    // Search query
    const matchesSearch =
      tx.party_name.toLowerCase().includes(txSearchQuery.toLowerCase()) ||
      tx.particulars.toLowerCase().includes(txSearchQuery.toLowerCase());

    // Type filter
    const matchesType =
      txTypeFilter === "all" ||
      (txTypeFilter === "purchase" && tx.party_type === "supplier" && tx.entry_type === "goods") ||
      (txTypeFilter === "sales" && tx.party_type === "customer" && tx.entry_type === "goods") ||
      (txTypeFilter === "payment" && tx.entry_type === "payment");

    // Party filter
    const matchesParty = txPartyFilter === "all" || tx.party_id === txPartyFilter;

    // Date filters
    const matchesFromDate = !txDateFrom || tx.date >= txDateFrom;
    const matchesToDate = !txDateTo || tx.date <= txDateTo;

    return matchesSearch && matchesType && matchesParty && matchesFromDate && matchesToDate;
  });

  // Calculate Running balance & ledger lines for chosen party (Khatian)
  const getLedgerData = (partyId: string) => {
    return transactions.filter((tx) => tx.party_id === partyId);
  };

  const getLedgerParty = (partyId: string) => {
    return parties.find((p) => p.id === partyId);
  };

  // Live calculations for purchase / sales forms
  const calculateLiveTotals = (form: typeof purchaseForm) => {
    const qty = parseFloat(form.quantity) || 0;
    const rate = parseFloat(form.rate) || 0;
    const goodsTotal = qty * rate;
    const rent = parseFloat(form.car_rent) || 0;
    const lab = parseFloat(form.labour) || 0;
    const netTotal = goodsTotal + rent + lab;
    const pay = parseFloat(form.payment) || 0;
    const dueChange = netTotal - pay;
    return { goodsTotal, netTotal, dueChange };
  };

  const livePurchase = calculateLiveTotals(purchaseForm);
  const liveSales = calculateLiveTotals(salesForm);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans antialiased">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col justify-between shrink-0 shadow-xl border-r border-slate-800">
        <div>
          {/* Brand/Store Name */}
          <div className="p-6 border-b border-slate-800 flex flex-col gap-1 bg-gradient-to-b from-slate-950 to-slate-900">
            <h1 className="font-display text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span className="p-1.5 bg-blue-600 rounded-lg text-white">
                <Layers className="h-5 w-5" />
              </span>
              ABC Yarn House
            </h1>
            <p className="text-xs text-slate-400 font-medium font-mono uppercase tracking-widest mt-1">Yarn Business Ledger</p>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === "dashboard"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/30 font-semibold"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              }`}
            >
              <LayoutDashboard className="h-4.5 w-4.5" />
              Dashboard
            </button>

            <div className="pt-4 pb-1">
              <span className="px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">Transactions</span>
            </div>

            <button
              onClick={() => setActiveTab("purchase")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === "purchase"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/30 font-semibold"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              }`}
            >
              <PlusCircle className="h-4.5 w-4.5 text-emerald-400" />
              Purchase Entry
            </button>

            <button
              onClick={() => setActiveTab("sales")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === "sales"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/30 font-semibold"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              }`}
            >
              <PlusCircle className="h-4.5 w-4.5 text-indigo-400" />
              Sales Entry
            </button>

            <div className="pt-4 pb-1">
              <span className="px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">Khatian Ledgers</span>
            </div>

            <button
              onClick={() => setActiveTab("supplier_ledger")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === "supplier_ledger"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/30 font-semibold"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              }`}
            >
              <BookOpen className="h-4.5 w-4.5 text-amber-400" />
              Supplier Ledger
            </button>

            <button
              onClick={() => setActiveTab("customer_ledger")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === "customer_ledger"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/30 font-semibold"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              }`}
            >
              <BookOpen className="h-4.5 w-4.5 text-sky-400" />
              Customer Ledger
            </button>

            <div className="pt-4 pb-1">
              <span className="px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">Directories</span>
            </div>

            <button
              onClick={() => setActiveTab("directory")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === "directory"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/30 font-semibold"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              }`}
            >
              <Users className="h-4.5 w-4.5" />
              Party Directory
            </button>

            <button
              onClick={() => setActiveTab("inventory")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === "inventory"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/30 font-semibold"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              }`}
            >
              <Database className="h-4.5 w-4.5" />
              Yarn Inventory
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === "history"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/30 font-semibold"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              }`}
            >
              <History className="h-4.5 w-4.5" />
              Transaction Log
            </button>
          </nav>
        </div>

        {/* Quick Payment Button & User Info */}
        <div className="p-4 border-t border-slate-800 space-y-4">
          <button
            onClick={() => {
              setPaymentPartyId(parties[0]?.id || "");
              setShowPaymentModal(true);
            }}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 px-4 rounded-lg text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            Cash Payment / Receipt
          </button>
          <div className="pt-2 flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">A</div>
            <div>
              <p className="text-white text-xs font-semibold">Admin User</p>
              <p className="text-slate-500 text-[10px] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 overflow-y-auto flex flex-col min-w-0">
        {/* TOP BAR / HEADER */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10 shrink-0">
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold font-display text-slate-900 capitalize tracking-tight">
                {activeTab.replace("_", " ")} Overview
              </h2>
              {loading && (
                <RefreshCw className="h-4.5 w-4.5 text-blue-600 animate-spin" />
              )}
            </div>
            <p className="text-slate-500 text-xs mt-0.5">Real-time status tracking for ABC Yarn House</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs font-mono text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg font-semibold border border-slate-200 shadow-xs">
              📅 {new Date().toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </header>

        {/* SCROLLABLE VIEWPORT */}
        <div className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8">
          
          {/* ========================================= */}
          {/* 1. DASHBOARD VIEW */}
          {/* ========================================= */}
          {activeTab === "dashboard" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header Promo Banner */}
              <div className="bg-slate-900 p-8 rounded-2xl text-white shadow-md relative overflow-hidden border border-slate-800">
                <div className="relative z-10 space-y-2">
                  <span className="px-3 py-1 bg-blue-600/30 text-blue-300 rounded-full text-[10px] font-bold uppercase tracking-widest font-mono">Welcome Back</span>
                  <h3 className="font-display text-2xl font-bold tracking-tight">ABC Yarn House Dashboard</h3>
                  <p className="text-slate-400 text-sm max-w-xl">
                    Real-time inventory management and double-entry accounting ledger. Track stock, customer receivables, and supplier payables seamlessly.
                  </p>
                </div>
                <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none transform translate-y-1/4 translate-x-1/10">
                  <Layers className="h-96 w-96 text-slate-300" />
                </div>
              </div>

              {/* Bento Grid: Row 1 (KPI Stats) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {/* 1. Yarn Types */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
                  <div>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2 font-mono">Yarn Types</p>
                    <h3 className="text-3xl font-bold text-slate-900 font-display">{stats.totalYarnTypes}</h3>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium mt-3">Unique inventory codes</p>
                </div>

                {/* 2. Total Stock */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
                  <div>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2 font-mono">Total Stock</p>
                    <h3 className="text-3xl font-bold text-slate-900 font-display flex items-baseline gap-1">
                      {stats.totalStockKg}
                      <span className="text-xs font-normal text-slate-400 font-mono">KG</span>
                    </h3>
                  </div>
                  <p className="text-[10px] text-emerald-600 font-bold mt-3">Available stock</p>
                </div>

                {/* 3. Total Purchase */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
                  <div>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2 font-mono">Total Purchase</p>
                    <h3 className="text-3xl font-bold text-slate-900 font-display">{formatTk(stats.totalPurchase)}</h3>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium mt-3">Goods purchased value</p>
                </div>

                {/* 4. Total Sales */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
                  <div>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2 font-mono">Total Sales</p>
                    <h3 className="text-3xl font-bold text-emerald-600 font-display">{formatTk(stats.totalSales)}</h3>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium mt-3">Goods sold turnover</p>
                </div>

                {/* 5. Total Receivable */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
                  <div>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2 font-mono">Receivable</p>
                    <h3 className="text-3xl font-bold text-indigo-600 font-display">{formatTk(stats.totalReceivable)}</h3>
                  </div>
                  <p className="text-[10px] text-indigo-500 font-bold mt-3 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> Due from customers
                  </p>
                </div>

                {/* 6. Total Payable */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
                  <div>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2 font-mono">Payable</p>
                    <h3 className="text-3xl font-bold text-rose-600 font-display">{formatTk(stats.totalPayable)}</h3>
                  </div>
                  <p className="text-[10px] text-rose-500 font-bold mt-3 flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" /> Due to suppliers
                  </p>
                </div>
              </div>

              {/* Bento Grid: Row 2 (Detailed Cards) */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* 1. Top Customers (Outstanding Receivables) */}
                <div className="col-span-1 lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col">
                  <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                    <h4 className="text-sm font-bold text-slate-900">Top Customers (Outstanding Receivables)</h4>
                    <span className="text-[10px] font-bold font-mono px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md">Receivables</span>
                  </div>
                  <div className="divide-y divide-slate-100 flex-1">
                    {parties
                      .filter((p) => p.type === "customer" && p.balance > 0)
                      .sort((a, b) => b.balance - a.balance)
                      .slice(0, 4)
                      .map((p) => (
                        <div
                          key={p.id}
                          className="py-3 flex justify-between items-center hover:bg-slate-50/50 px-2 rounded-lg cursor-pointer transition-colors"
                          onClick={() => {
                            setSelectedCustomerId(p.id);
                            setActiveTab("customer_ledger");
                          }}
                        >
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm text-slate-800">{p.name}</span>
                            <span className="text-xs text-slate-400 font-mono">{p.phone || "No Phone"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-indigo-600">{formatTk(p.balance)}</span>
                            <ChevronRight className="h-4 w-4 text-slate-400" />
                          </div>
                        </div>
                      ))}
                    {parties.filter((p) => p.type === "customer" && p.balance > 0).length === 0 && (
                      <p className="text-xs text-slate-400 py-8 text-center">No outstanding receivables found.</p>
                    )}
                  </div>
                </div>

                {/* 2. Top Suppliers (Outstanding Payables) */}
                <div className="col-span-1 lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col">
                  <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                    <h4 className="text-sm font-bold text-slate-900">Top Suppliers (Outstanding Payables)</h4>
                    <span className="text-[10px] font-bold font-mono px-2 py-1 bg-rose-50 text-rose-600 rounded-md">Payables</span>
                  </div>
                  <div className="divide-y divide-slate-100 flex-1">
                    {parties
                      .filter((p) => p.type === "supplier" && p.balance > 0)
                      .sort((a, b) => b.balance - a.balance)
                      .slice(0, 4)
                      .map((p) => (
                        <div
                          key={p.id}
                          className="py-3 flex justify-between items-center hover:bg-slate-50/50 px-2 rounded-lg cursor-pointer transition-colors"
                          onClick={() => {
                            setSelectedSupplierId(p.id);
                            setActiveTab("supplier_ledger");
                          }}
                        >
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm text-slate-800">{p.name}</span>
                            <span className="text-xs text-slate-400 font-mono">{p.phone || "No Phone"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-rose-600">{formatTk(p.balance)}</span>
                            <ChevronRight className="h-4 w-4 text-slate-400" />
                          </div>
                        </div>
                      ))}
                    {parties.filter((p) => p.type === "supplier" && p.balance > 0).length === 0 && (
                      <p className="text-xs text-slate-400 py-8 text-center">No outstanding payables found.</p>
                    )}
                  </div>
                </div>

                {/* 3. Recent Khatian Activity */}
                <div className="col-span-1 lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col">
                  <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                    <h4 className="text-sm font-bold text-slate-900">Recent Khatian Activity</h4>
                    <span className="text-[10px] font-bold font-mono px-2 py-1 bg-slate-100 text-slate-600 rounded-md">Ledger Feed</span>
                  </div>
                  <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Party</th>
                          <th className="pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Particulars</th>
                          <th className="pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {transactions.slice(0, 4).map((tx) => {
                          const isDebit = tx.debit > 0;
                          const amount = isDebit ? tx.debit : tx.credit;
                          const amtColor = isDebit ? "text-rose-600" : "text-emerald-600";
                          const amtSign = isDebit ? "Dr" : "Cr";
                          return (
                            <tr key={tx.id} className="text-xs hover:bg-slate-50/40 transition-colors">
                              <td className="py-3 font-semibold text-slate-800">{tx.party_name}</td>
                              <td className="py-3 text-slate-500 max-w-[150px] truncate">{tx.particulars || "N/A"}</td>
                              <td className={`py-3 font-mono text-right ${amtColor} font-bold`}>
                                {formatTk(amount)} <span className="text-[9px] font-bold opacity-75">{amtSign}</span>
                              </td>
                            </tr>
                          );
                        })}
                        {transactions.length === 0 && (
                          <tr>
                            <td colSpan={3} className="py-8 text-center text-xs text-slate-400">
                              No recent activity found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 4. Low Stock Warning Card */}
                <div className="col-span-1 bg-amber-50/70 p-6 rounded-2xl border border-amber-200/60 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
                  <div>
                    <p className="text-amber-800 text-[10px] font-bold uppercase tracking-wider mb-2 font-mono">Low Stock Warning</p>
                    <h4 className="text-xs text-amber-700 font-semibold uppercase tracking-wider">Inventory Check</h4>
                  </div>
                  <div className="space-y-4 my-3 flex-1 flex flex-col justify-center">
                    {yarns.filter((y) => y.stock < 100).length > 0 ? (
                      yarns
                        .filter((y) => y.stock < 100)
                        .slice(0, 2)
                        .map((y) => (
                          <div key={y.id} className="space-y-1">
                            <p className="text-xs text-amber-900 font-semibold truncate">{y.name}</p>
                            <div className="h-1.5 w-full bg-amber-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-600"
                                style={{ width: `${Math.max(5, Math.min(100, (y.stock / 100) * 100))}%` }}
                              ></div>
                            </div>
                            <p className="text-[10px] text-amber-600 font-bold">
                              Only {y.stock} {y.unit} left
                            </p>
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-2">
                        <p className="text-xs font-bold text-amber-800">All Stocks Healthy</p>
                        <p className="text-[10px] text-amber-600 mt-1">No items under 100 units.</p>
                      </div>
                    )}
                  </div>
                  <div className="text-[10px] text-amber-500 font-medium font-mono">
                    Reorder suggested
                  </div>
                </div>

                {/* 5. System Status Card */}
                <div className="col-span-1 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between text-white">
                  <div>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2 font-mono">System Health</p>
                    <p className="text-xs text-white font-semibold">Local Storage Live</p>
                    <p className="text-[10px] text-slate-500 mt-1">Auto-Backup: Stable</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center">
                    <span className="flex h-2 w-2 relative mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">SQLite Engine: Running</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================= */}
          {/* 2. PURCHASE ENTRY VIEW */}
          {/* ========================================= */}
          {activeTab === "purchase" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn max-w-3xl mx-auto">
              <div className="bg-slate-900 p-6 text-white border-b border-slate-800">
                <h3 className="font-display text-lg font-bold">New Supplier Purchase Entry</h3>
                <p className="text-xs text-slate-400 mt-1">Record a batch invoice of goods received from a supplier.</p>
              </div>

              <form onSubmit={handlePurchaseSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Invoice Date</label>
                    <input
                      type="date"
                      required
                      value={purchaseForm.date}
                      onChange={(e) => setPurchaseForm((p) => ({ ...p, date: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 bg-slate-50 text-sm focus:bg-white focus:outline-blue-500"
                    />
                  </div>

                  {/* Supplier Name Auto Suggest */}
                  <div className="relative">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Supplier Name</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Type supplier name..."
                        value={purchaseForm.supplier_name}
                        onChange={(e) => handleSupplierInput(e.target.value)}
                        onBlur={() => setTimeout(() => setShowSupplierDropdown(false), 200)}
                        onFocus={() => purchaseForm.supplier_name.trim().length > 0 && setShowSupplierDropdown(true)}
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 bg-slate-50 text-sm focus:bg-white focus:outline-blue-500"
                      />
                    </div>
                    {showSupplierDropdown && supplierSuggestions.length > 0 && (
                      <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {supplierSuggestions.map((s) => (
                          <div
                            key={s.id}
                            onMouseDown={() => selectSupplierSuggestion(s)}
                            className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm font-medium flex justify-between"
                          >
                            <span>{s.name}</span>
                            <span className="text-xs font-mono text-rose-500">{formatTk(s.balance)} due</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Optional Auto-Add Fields for New Supplier */}
                {!purchaseForm.supplier_id && purchaseForm.supplier_name.trim().length > 0 && (
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 space-y-4">
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4 text-amber-600" />
                      <span className="text-xs font-semibold text-amber-800">
                        "{purchaseForm.supplier_name}" is completely new. It will be auto-saved in Directory.
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <input
                          type="text"
                          placeholder="Supplier Phone (Optional)"
                          value={purchaseForm.supplier_phone}
                          onChange={(e) => setPurchaseForm((p) => ({ ...p, supplier_phone: e.target.value }))}
                          className="w-full border border-amber-300 rounded-lg px-3 py-1.5 bg-white text-xs"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Supplier Address (Optional)"
                          value={purchaseForm.supplier_address}
                          onChange={(e) => setPurchaseForm((p) => ({ ...p, supplier_address: e.target.value }))}
                          className="w-full border border-amber-300 rounded-lg px-3 py-1.5 bg-white text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Yarn Selection Section */}
                <div className="border-t border-slate-100 pt-6 space-y-6">
                  <h4 className="font-semibold text-slate-800 border-l-4 border-emerald-500 pl-2">Yarn Product Details</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Yarn Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Type yarn name or count... (e.g. 30/1 Carded)"
                        value={purchaseForm.yarn_name}
                        onChange={(e) => handleYarnInput(e.target.value, "purchase")}
                        onBlur={() => setTimeout(() => setShowYarnDropdown(false), 200)}
                        onFocus={() => purchaseForm.yarn_name.trim().length > 0 && setShowYarnDropdown(true)}
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 bg-slate-50 text-sm focus:bg-white focus:outline-blue-500"
                      />
                      {showYarnDropdown && yarnSuggestions.length > 0 && (
                        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {yarnSuggestions.map((y) => (
                            <div
                              key={y.id}
                              onMouseDown={() => selectYarnSuggestion(y, "purchase")}
                              className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm font-medium flex justify-between"
                            >
                              <span>{y.name}</span>
                              <span className="text-xs font-mono text-slate-500">{y.stock} {y.unit} in stock</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Inventory Unit</label>
                      <select
                        value={purchaseForm.unit}
                        onChange={(e: any) => setPurchaseForm((p) => ({ ...p, unit: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 bg-slate-50 text-sm focus:bg-white focus:outline-blue-500"
                      >
                        <option value="KG">Kilograms (KG)</option>
                        <option value="LBS">Pounds (LBS)</option>
                        <option value="BAG">Bags (BAG)</option>
                      </select>
                    </div>
                  </div>

                  {/* Auto-Add Fields for New Yarn */}
                  {!purchaseForm.yarn_id && purchaseForm.yarn_name.trim().length > 0 && (
                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 space-y-4">
                      <div className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4 text-emerald-600" />
                        <span className="text-xs font-semibold text-emerald-800">
                          Yarn "{purchaseForm.yarn_name}" is completely new. It will be saved into Inventory.
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <input
                            type="text"
                            placeholder="Yarn Count (e.g. 30/1, 28/1)"
                            value={purchaseForm.yarn_count}
                            onChange={(e) => setPurchaseForm((p) => ({ ...p, yarn_count: e.target.value }))}
                            className="w-full border border-emerald-300 rounded-lg px-3 py-1.5 bg-white text-xs"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Blend / Composition (e.g. Carded, Cvc)"
                            value={purchaseForm.yarn_blend}
                            onChange={(e) => setPurchaseForm((p) => ({ ...p, yarn_blend: e.target.value }))}
                            className="w-full border border-emerald-300 rounded-lg px-3 py-1.5 bg-white text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Financial & Quantities Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Quantity ({purchaseForm.unit})</label>
                      <input
                        type="number"
                        required
                        step="any"
                        placeholder="0.00"
                        value={purchaseForm.quantity}
                        onChange={(e) => setPurchaseForm((p) => ({ ...p, quantity: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-sm focus:bg-white focus:outline-blue-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Rate per Unit (৳)</label>
                      <input
                        type="number"
                        required
                        step="any"
                        placeholder="0.00"
                        value={purchaseForm.rate}
                        onChange={(e) => setPurchaseForm((p) => ({ ...p, rate: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-sm focus:bg-white focus:outline-blue-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Car Rent (৳)</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="0.00"
                        value={purchaseForm.car_rent}
                        onChange={(e) => setPurchaseForm((p) => ({ ...p, car_rent: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-sm focus:bg-white focus:outline-blue-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Labour Charge (৳)</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="0.00"
                        value={purchaseForm.labour}
                        onChange={(e) => setPurchaseForm((p) => ({ ...p, labour: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-sm focus:bg-white focus:outline-blue-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Section */}
                <div className="border-t border-slate-100 pt-6 space-y-4">
                  <h4 className="font-semibold text-slate-800 border-l-4 border-emerald-500 pl-2">Payment Made (Today)</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Amount Paid (৳)</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="0.00"
                        value={purchaseForm.payment}
                        onChange={(e) => setPurchaseForm((p) => ({ ...p, payment: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 bg-slate-50 text-sm focus:bg-white focus:outline-blue-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Payment Method</label>
                      <select
                        value={purchaseForm.payment_method}
                        onChange={(e) => setPurchaseForm((p) => ({ ...p, payment_method: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 bg-slate-50 text-sm focus:bg-white focus:outline-blue-500"
                      >
                        <option value="Cash Payment">Cash Payment</option>
                        <option value="RTGS">RTGS Bank</option>
                        <option value="Fund Transfer">Fund Transfer</option>
                        <option value="Bank Check">Bank Check</option>
                        <option value="DBBL ABC">DBBL ABC Bank</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Auto Calculation Card */}
                <div className="bg-slate-900 text-slate-100 p-6 rounded-xl space-y-4 font-mono shadow-inner">
                  <div className="flex justify-between text-xs border-b border-slate-800 pb-2">
                    <span className="text-slate-400">Goods Total:</span>
                    <span className="text-white font-bold">{formatTk(livePurchase.goodsTotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs border-b border-slate-800 pb-2">
                    <span className="text-slate-400">Extra Charges (Rent + Labour):</span>
                    <span className="text-white font-bold">
                      {formatTk((parseFloat(purchaseForm.car_rent) || 0) + (parseFloat(purchaseForm.labour) || 0))}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-slate-800 pb-2">
                    <span className="text-slate-300 font-semibold">Total Invoice Amount:</span>
                    <span className="text-emerald-400 font-bold">{formatTk(livePurchase.netTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300 font-semibold">Net Due Change:</span>
                    <span className="text-amber-400 font-bold">+{formatTk(livePurchase.dueChange)}</span>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-8 py-3 rounded-xl transition shadow-md shadow-emerald-900/10 cursor-pointer"
                  >
                    Post Purchase Invoice
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================= */}
          {/* 3. SALES ENTRY VIEW */}
          {/* ========================================= */}
          {activeTab === "sales" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn max-w-3xl mx-auto">
              <div className="bg-slate-900 p-6 text-white border-b border-slate-800">
                <h3 className="font-display text-lg font-bold">New Customer Sales Entry</h3>
                <p className="text-xs text-slate-400 mt-1">Record a batch invoice of goods sold to a customer.</p>
              </div>

              <form onSubmit={handleSalesSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Invoice Date</label>
                    <input
                      type="date"
                      required
                      value={salesForm.date}
                      onChange={(e) => setSalesForm((p) => ({ ...p, date: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 bg-slate-50 text-sm focus:bg-white focus:outline-blue-500"
                    />
                  </div>

                  {/* Customer Name Auto Suggest */}
                  <div className="relative">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Customer Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Type customer name..."
                      value={salesForm.customer_name}
                      onChange={(e) => handleCustomerInput(e.target.value)}
                      onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
                      onFocus={() => salesForm.customer_name.trim().length > 0 && setShowCustomerDropdown(true)}
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 bg-slate-50 text-sm focus:bg-white focus:outline-blue-500"
                    />
                    {showCustomerDropdown && customerSuggestions.length > 0 && (
                      <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {customerSuggestions.map((c) => (
                          <div
                            key={c.id}
                            onMouseDown={() => selectCustomerSuggestion(c)}
                            className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm font-medium flex justify-between"
                          >
                            <span>{c.name}</span>
                            <span className="text-xs font-mono text-indigo-600">{formatTk(c.balance)} outstanding</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Optional Auto-Add Fields for New Customer */}
                {!salesForm.customer_id && salesForm.customer_name.trim().length > 0 && (
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 space-y-4">
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4 text-amber-600" />
                      <span className="text-xs font-semibold text-amber-800">
                        "{salesForm.customer_name}" is completely new. It will be auto-saved in Directory.
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <input
                          type="text"
                          placeholder="Customer Phone (Optional)"
                          value={salesForm.customer_phone}
                          onChange={(e) => setSalesForm((p) => ({ ...p, customer_phone: e.target.value }))}
                          className="w-full border border-amber-300 rounded-lg px-3 py-1.5 bg-white text-xs"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Customer Address (Optional)"
                          value={salesForm.customer_address}
                          onChange={(e) => setSalesForm((p) => ({ ...p, customer_address: e.target.value }))}
                          className="w-full border border-amber-300 rounded-lg px-3 py-1.5 bg-white text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Yarn Selection Section */}
                <div className="border-t border-slate-100 pt-6 space-y-6">
                  <h4 className="font-semibold text-indigo-900 border-l-4 border-indigo-500 pl-2">Yarn Product Details</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Yarn Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Type yarn name or count... (e.g. 30/1 Carded)"
                        value={salesForm.yarn_name}
                        onChange={(e) => handleYarnInput(e.target.value, "sales")}
                        onBlur={() => setTimeout(() => setShowYarnDropdown(false), 200)}
                        onFocus={() => salesForm.yarn_name.trim().length > 0 && setShowYarnDropdown(true)}
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 bg-slate-50 text-sm focus:bg-white focus:outline-blue-500"
                      />
                      {showYarnDropdown && yarnSuggestions.length > 0 && (
                        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {yarnSuggestions.map((y) => (
                            <div
                              key={y.id}
                              onMouseDown={() => selectYarnSuggestion(y, "sales")}
                              className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm font-medium flex justify-between"
                            >
                              <span>{y.name}</span>
                              <span className="text-xs font-mono text-slate-500">{y.stock} {y.unit} in stock</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Inventory Unit</label>
                      <select
                        value={salesForm.unit}
                        onChange={(e: any) => setSalesForm((p) => ({ ...p, unit: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 bg-slate-50 text-sm focus:bg-white focus:outline-blue-500"
                      >
                        <option value="KG">Kilograms (KG)</option>
                        <option value="LBS">Pounds (LBS)</option>
                        <option value="BAG">Bags (BAG)</option>
                      </select>
                    </div>
                  </div>

                  {/* Auto-Add Fields for New Yarn */}
                  {!salesForm.yarn_id && salesForm.yarn_name.trim().length > 0 && (
                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 space-y-4">
                      <div className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4 text-emerald-600" />
                        <span className="text-xs font-semibold text-emerald-800">
                          Yarn "{salesForm.yarn_name}" is completely new. It will be saved into Inventory.
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <input
                            type="text"
                            placeholder="Yarn Count (e.g. 30/1, 28/1)"
                            value={salesForm.yarn_count}
                            onChange={(e) => setSalesForm((p) => ({ ...p, yarn_count: e.target.value }))}
                            className="w-full border border-emerald-300 rounded-lg px-3 py-1.5 bg-white text-xs"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Blend / Composition (e.g. Carded, Cvc)"
                            value={salesForm.yarn_blend}
                            onChange={(e) => setSalesForm((p) => ({ ...p, yarn_blend: e.target.value }))}
                            className="w-full border border-emerald-300 rounded-lg px-3 py-1.5 bg-white text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Financial & Quantities Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Quantity ({salesForm.unit})</label>
                      <input
                        type="number"
                        required
                        step="any"
                        placeholder="0.00"
                        value={salesForm.quantity}
                        onChange={(e) => setSalesForm((p) => ({ ...p, quantity: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-sm focus:bg-white focus:outline-blue-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Rate per Unit (৳)</label>
                      <input
                        type="number"
                        required
                        step="any"
                        placeholder="0.00"
                        value={salesForm.rate}
                        onChange={(e) => setSalesForm((p) => ({ ...p, rate: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-sm focus:bg-white focus:outline-blue-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Car Rent (৳)</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="0.00"
                        value={salesForm.car_rent}
                        onChange={(e) => setSalesForm((p) => ({ ...p, car_rent: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-sm focus:bg-white focus:outline-blue-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Labour Charge (৳)</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="0.00"
                        value={salesForm.labour}
                        onChange={(e) => setSalesForm((p) => ({ ...p, labour: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-sm focus:bg-white focus:outline-blue-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Section */}
                <div className="border-t border-slate-100 pt-6 space-y-4">
                  <h4 className="font-semibold text-slate-800 border-l-4 border-indigo-500 pl-2">Payment Received (Today)</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Amount Received (৳)</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="0.00"
                        value={salesForm.payment}
                        onChange={(e) => setSalesForm((p) => ({ ...p, payment: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 bg-slate-50 text-sm focus:bg-white focus:outline-blue-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Payment Method</label>
                      <select
                        value={salesForm.payment_method}
                        onChange={(e) => setSalesForm((p) => ({ ...p, payment_method: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 bg-slate-50 text-sm focus:bg-white focus:outline-blue-500"
                      >
                        <option value="Cash Receipt">Cash Receipt</option>
                        <option value="RTGS">RTGS Bank</option>
                        <option value="Fund Transfer">Fund Transfer</option>
                        <option value="Bank Check">Bank Check</option>
                        <option value="DBBL ABC">DBBL ABC Bank</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Auto Calculation Card */}
                <div className="bg-slate-900 text-slate-100 p-6 rounded-xl space-y-4 font-mono shadow-inner">
                  <div className="flex justify-between text-xs border-b border-slate-800 pb-2">
                    <span className="text-slate-400">Goods Total:</span>
                    <span className="text-white font-bold">{formatTk(liveSales.goodsTotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs border-b border-slate-800 pb-2">
                    <span className="text-slate-400">Extra Charges (Rent + Labour):</span>
                    <span className="text-white font-bold">
                      {formatTk((parseFloat(salesForm.car_rent) || 0) + (parseFloat(salesForm.labour) || 0))}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-slate-800 pb-2">
                    <span className="text-slate-300 font-semibold">Total Invoice Amount:</span>
                    <span className="text-indigo-400 font-bold">{formatTk(liveSales.netTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300 font-semibold">Net Due Change:</span>
                    <span className="text-amber-400 font-bold">+{formatTk(liveSales.dueChange)}</span>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-xl transition shadow-md shadow-blue-900/10 cursor-pointer"
                  >
                    Post Sales Invoice
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================= */}
          {/* 4. SUPPLIER LEDGER (KHATIAN) */}
          {/* ========================================= */}
          {activeTab === "supplier_ledger" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Ledger Selector & Controls */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <span className="font-semibold text-sm text-slate-600 font-mono uppercase tracking-wider shrink-0">Select Supplier:</span>
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 text-sm font-semibold w-full md:w-64 focus:bg-white focus:outline-blue-500"
                  >
                    <option value="">-- Choose Supplier --</option>
                    {parties
                      .filter((p) => p.type === "supplier")
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="flex gap-2 w-full md:w-auto justify-end">
                  <button
                    onClick={() => {
                      const element = document.getElementById("ledger-sheet-print");
                      if (element) {
                        const originalContent = document.body.innerHTML;
                        const printContent = element.outerHTML;
                        document.body.innerHTML = printContent;
                        window.print();
                        document.body.innerHTML = originalContent;
                        // Reload to restore React bindings
                        window.location.reload();
                      }
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-lg text-sm border border-slate-200 transition flex items-center gap-2 cursor-pointer"
                  >
                    <Printer className="h-4.5 w-4.5" />
                    Print Ledger
                  </button>
                  <button
                    onClick={() => {
                      const ledgerPart = getLedgerParty(selectedSupplierId);
                      const rawTx = getLedgerData(selectedSupplierId);
                      const exportData = rawTx.map((t, idx) => ({
                        Date: t.date,
                        Particulars: t.particulars,
                        "Debit (Tk.)": t.debit || 0,
                        "Credit (Tk.)": t.credit || 0,
                        "Balance (Tk.)": t.balance_after || 0,
                      }));
                      exportToCSV(exportData, `${ledgerPart?.name || "Supplier"}_Ledger`);
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="h-4.5 w-4.5" />
                    Export CSV
                  </button>

                </div>
              </div>

              {/* LEDGER REPORT SHEET (Khatian) */}
              {selectedSupplierId ? (
                (() => {
                  const sPart = getLedgerParty(selectedSupplierId);
                  const sTx = getLedgerData(selectedSupplierId);
                  
                  // Audit totals
                  const totalDebit = sTx.reduce((sum, t) => sum + (t.debit || 0), 0);
                  const totalCredit = sTx.reduce((sum, t) => sum + (t.credit || 0), 0);
                  const closingBal = sTx.length > 0 ? sTx[sTx.length - 1].balance_after || 0 : 0;

                  return (
                    <div id="ledger-sheet-print" className="bg-white rounded-xl border border-slate-200/80 shadow-md p-10 space-y-8 print:border-none print:shadow-none font-sans">
                      {/* Bengali styled header */}
                      <div className="text-center space-y-2 border-b-2 border-slate-100 pb-6 relative">
                        <h2 className="font-bengali text-3xl font-extrabold text-slate-800 tracking-tight">খতিয়ান হিসাব বিবরণী</h2>
                        <p className="text-sm font-semibold text-slate-500 font-mono tracking-widest uppercase">Supplier Ledger Statement</p>
                        
                        <div className="mt-4 pt-2">
                          <h3 className="font-bengali text-2xl font-bold text-blue-700">{sPart?.name}</h3>
                          {sPart?.phone && <p className="text-xs text-slate-400 font-mono">📱 Phone: {sPart.phone}</p>}
                          {sPart?.address && <p className="text-xs text-slate-400">📍 Address: {sPart.address}</p>}
                        </div>

                        {/* Top corner credits */}
                        <div className="absolute top-0 right-0 text-right text-xs font-mono text-slate-400 print:hidden">
                          <span>ABC Yarn House</span>
                        </div>
                      </div>

                      {/* Main Ledger Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-900 text-slate-100 uppercase text-xs font-mono border-b border-slate-800">
                              <th className="py-4 px-4 text-center font-bold">তারিখ <br/> (Date)</th>
                              <th className="py-4 px-6 font-bold">বিবরণ <br/> (Particulars)</th>
                              <th className="py-4 px-4 text-right font-bold">জমা / ডেবিট <br/> (Debit Tk.)</th>
                              <th className="py-4 px-4 text-right font-bold">খরচ / ক্রেডিট <br/> (Credit Tk.)</th>
                              <th className="py-4 px-6 text-right font-bold">অবশিষ্ট / ব্যালেন্স <br/> (Balance Tk.)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 text-sm">
                            {sTx.map((tx, idx) => {
                              const isDebitRow = tx.debit > 0;
                              const isCreditRow = tx.credit > 0;

                              return (
                                <tr key={tx.id} className="hover:bg-slate-50/50 print:hover:bg-transparent transition">
                                  <td className="py-3 px-4 text-center font-mono font-medium text-slate-600 shrink-0 whitespace-nowrap">
                                    {tx.date}
                                  </td>
                                  <td className="py-3 px-6 font-semibold text-slate-800">
                                    {tx.particulars}
                                  </td>
                                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-700">
                                    {isDebitRow ? formatTk(tx.debit) : "-"}
                                  </td>
                                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-700">
                                    {isCreditRow ? formatTk(tx.credit) : "-"}
                                  </td>
                                  <td className={`py-3 px-6 text-right font-mono font-extrabold ${
                                    (tx.balance_after || 0) < 0 ? "text-rose-500 font-bold" : "text-slate-900"
                                  }`}>
                                    {formatBalance(tx.balance_after || 0)}
                                  </td>
                                </tr>
                              );
                            })}

                            {sTx.length === 0 && (
                              <tr>
                                <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                                  No ledger records found for this supplier.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Traditional Audit Summary box */}
                      {sTx.length > 0 && (
                        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 max-w-xl ml-auto print:break-inside-avoid">
                          <h4 className="font-bengali text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">
                            চূড়ান্ত নিরীক্ষা সারসংক্ষেপ (Audit Summary)
                          </h4>
                          <div className="space-y-2 font-mono text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-500">সর্বমোট জমা / ডেবিট (Total Debit):</span>
                              <span className="font-bold text-slate-800">{formatTk(totalDebit)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">সর্বমোট খরচ / ক্রেডিট (Total Credit):</span>
                              <span className="font-bold text-slate-800">{formatTk(totalCredit)}</span>
                            </div>
                            <div className="flex justify-between border-t border-slate-200 pt-2 text-base">
                              <span className="text-slate-700 font-bold">সর্বশেষ অবশিষ্ট ব্যালেন্স (Closing Balance):</span>
                              <span className={`font-extrabold ${closingBal < 0 ? "text-rose-600" : "text-blue-700"}`}>
                                {formatBalance(closingBal)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div className="bg-white border border-slate-200 p-12 text-center text-slate-400 rounded-xl">
                  Please select a supplier from the list above to render their complete ledger khatian.
                </div>
              )}
            </div>
          )}

          {/* ========================================= */}
          {/* 5. CUSTOMER LEDGER (KHATIAN) */}
          {/* ========================================= */}
          {activeTab === "customer_ledger" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Ledger Selector & Controls */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <span className="font-semibold text-sm text-slate-600 font-mono uppercase tracking-wider shrink-0">Select Customer:</span>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 text-sm font-semibold w-full md:w-64 focus:bg-white focus:outline-blue-500"
                  >
                    <option value="">-- Choose Customer --</option>
                    {parties
                      .filter((p) => p.type === "customer")
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="flex gap-2 w-full md:w-auto justify-end">
                  <button
                    onClick={() => {
                      const element = document.getElementById("customer-ledger-sheet-print");
                      if (element) {
                        const originalContent = document.body.innerHTML;
                        const printContent = element.outerHTML;
                        document.body.innerHTML = printContent;
                        window.print();
                        document.body.innerHTML = originalContent;
                        window.location.reload();
                      }
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-lg text-sm border border-slate-200 transition flex items-center gap-2 cursor-pointer"
                  >
                    <Printer className="h-4.5 w-4.5" />
                    Print Ledger
                  </button>
                  <button
                    onClick={() => {
                      const ledgerPart = getLedgerParty(selectedCustomerId);
                      const rawTx = getLedgerData(selectedCustomerId);
                      const exportData = rawTx.map((t) => ({
                        Date: t.date,
                        Particulars: t.particulars,
                        "Debit (Tk.)": t.debit || 0,
                        "Credit (Tk.)": t.credit || 0,
                        "Balance (Tk.)": t.balance_after || 0,
                      }));
                      exportToCSV(exportData, `${ledgerPart?.name || "Customer"}_Ledger`);
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="h-4.5 w-4.5" />
                    Export CSV
                  </button>

                </div>
              </div>

              {/* LEDGER REPORT SHEET (Khatian) */}
              {selectedCustomerId ? (
                (() => {
                  const cPart = getLedgerParty(selectedCustomerId);
                  const cTx = getLedgerData(selectedCustomerId);
                  
                  // Audit totals
                  const totalDebit = cTx.reduce((sum, t) => sum + (t.debit || 0), 0);
                  const totalCredit = cTx.reduce((sum, t) => sum + (t.credit || 0), 0);
                  const closingBal = cTx.length > 0 ? cTx[cTx.length - 1].balance_after || 0 : 0;

                  return (
                    <div id="customer-ledger-sheet-print" className="bg-white rounded-xl border border-slate-200/80 shadow-md p-10 space-y-8 print:border-none print:shadow-none font-sans">
                      {/* Bengali styled header */}
                      <div className="text-center space-y-2 border-b-2 border-slate-100 pb-6 relative">
                        <h2 className="font-bengali text-3xl font-extrabold text-slate-800 tracking-tight">খতিয়ান হিসাব বিবরণী</h2>
                        <p className="text-sm font-semibold text-slate-500 font-mono tracking-widest uppercase">Customer Ledger Statement</p>
                        
                        <div className="mt-4 pt-2">
                          <h3 className="font-bengali text-2xl font-bold text-blue-700">{cPart?.name}</h3>
                          {cPart?.phone && <p className="text-xs text-slate-400 font-mono">📱 Phone: {cPart.phone}</p>}
                          {cPart?.address && <p className="text-xs text-slate-400">📍 Address: {cPart.address}</p>}
                        </div>

                        {/* Top corner credits */}
                        <div className="absolute top-0 right-0 text-right text-xs font-mono text-slate-400 print:hidden">
                          <span>ABC Yarn House</span>
                        </div>
                      </div>

                      {/* Main Ledger Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-900 text-slate-100 uppercase text-xs font-mono border-b border-slate-800">
                              <th className="py-4 px-4 text-center font-bold">তারিখ <br/> (Date)</th>
                              <th className="py-4 px-6 font-bold">বিবরণ <br/> (Particulars)</th>
                              <th className="py-4 px-4 text-right font-bold">জما / ডেবিট <br/> (Debit Tk.)</th>
                              <th className="py-4 px-4 text-right font-bold">খরচ / ক্রেডিট <br/> (Credit Tk.)</th>
                              <th className="py-4 px-6 text-right font-bold">অবশিষ্ট / ব্যালেন্স <br/> (Balance Tk.)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 text-sm">
                            {cTx.map((tx) => {
                              const isDebitRow = tx.debit > 0;
                              const isCreditRow = tx.credit > 0;

                              return (
                                <tr key={tx.id} className="hover:bg-slate-50/50 print:hover:bg-transparent transition">
                                  <td className="py-3 px-4 text-center font-mono font-medium text-slate-600 shrink-0 whitespace-nowrap">
                                    {tx.date}
                                  </td>
                                  <td className="py-3 px-6 font-semibold text-slate-800">
                                    {tx.particulars}
                                  </td>
                                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-700">
                                    {isDebitRow ? formatTk(tx.debit) : "-"}
                                  </td>
                                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-700">
                                    {isCreditRow ? formatTk(tx.credit) : "-"}
                                  </td>
                                  <td className={`py-3 px-6 text-right font-mono font-extrabold ${
                                    (tx.balance_after || 0) < 0 ? "text-rose-500 font-bold" : "text-slate-900"
                                  }`}>
                                    {formatBalance(tx.balance_after || 0)}
                                  </td>
                                </tr>
                              );
                            })}

                            {cTx.length === 0 && (
                              <tr>
                                <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                                  No ledger records found for this customer.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Traditional Audit Summary box */}
                      {cTx.length > 0 && (
                        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 max-w-xl ml-auto print:break-inside-avoid">
                          <h4 className="font-bengali text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">
                            চূড়ান্ত নিরীক্ষা সারসংক্ষেপ (Audit Summary)
                          </h4>
                          <div className="space-y-2 font-mono text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-500">সর্বমোট জমা / ডেবিট (Total Debit):</span>
                              <span className="font-bold text-slate-800">{formatTk(totalDebit)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">সর্বমোট খরচ / ক্রেডিট (Total Credit):</span>
                              <span className="font-bold text-slate-800">{formatTk(totalCredit)}</span>
                            </div>
                            <div className="flex justify-between border-t border-slate-200 pt-2 text-base">
                              <span className="text-slate-700 font-bold">সর্বশেষ অবশিষ্ট ব্যালেন্স (Closing Balance):</span>
                              <span className={`font-extrabold ${closingBal < 0 ? "text-rose-600" : "text-blue-700"}`}>
                                {formatBalance(closingBal)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div className="bg-white border border-slate-200 p-12 text-center text-slate-400 rounded-xl">
                  Please select a customer from the list above to render their complete ledger khatian.
                </div>
              )}
            </div>
          )}

          {/* ========================================= */}
          {/* 6. PARTY DIRECTORY VIEW */}
          {/* ========================================= */}
          {activeTab === "directory" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Directory Navigation Tab Headers */}
              <div className="border-b border-slate-200">
                <div className="flex gap-4">
                  <button
                    onClick={() => setDirectoryTab("suppliers")}
                    className={`py-3 px-6 font-bold text-sm tracking-tight border-b-2 transition-all cursor-pointer ${
                      directoryTab === "suppliers"
                        ? "border-blue-600 text-blue-600 font-bold"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    🏢 Suppliers Directory
                  </button>
                  <button
                    onClick={() => setDirectoryTab("customers")}
                    className={`py-3 px-6 font-bold text-sm tracking-tight border-b-2 transition-all cursor-pointer ${
                      directoryTab === "customers"
                        ? "border-blue-600 text-blue-600 font-bold"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    🤝 Customers Directory
                  </button>
                </div>
              </div>

              {/* Directory Toolbar */}
              <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder={`Search ${directoryTab}...`}
                    value={partySearchQuery}
                    onChange={(e) => setPartySearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 w-full focus:bg-white focus:outline-blue-500"
                  />
                </div>

                <div className="flex gap-2 w-full md:w-auto justify-end">
                  <button
                    onClick={() => {
                      const newName = prompt(`Enter new ${directoryTab === "suppliers" ? "Supplier" : "Customer"} Name:`);
                      if (newName && newName.trim()) {
                        fetch("/api/parties", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            name: newName.trim(),
                            type: directoryTab === "suppliers" ? "supplier" : "customer",
                          }),
                        }).then(() => triggerRecalculation());
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="h-4.5 w-4.5" />
                    Add {directoryTab === "suppliers" ? "Supplier" : "Customer"}
                  </button>
                </div>
              </div>

              {/* Directory Grid / Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {parties
                  .filter((p) => p.type === (directoryTab === "suppliers" ? "supplier" : "customer"))
                  .filter((p) => p.name.toLowerCase().includes(partySearchQuery.toLowerCase()))
                  .map((p) => (
                    <div
                      key={p.id}
                      className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-lg text-slate-800 truncate">{p.name}</h4>
                          <span className={`text-xs px-2 py-1 rounded font-mono font-bold ${
                            directoryTab === "suppliers" ? "bg-rose-50 text-rose-600" : "bg-indigo-50 text-indigo-600"
                          }`}>
                            {directoryTab === "suppliers" ? "Supplier" : "Customer"}
                          </span>
                        </div>

                        <div className="space-y-2 text-sm text-slate-600">
                          {p.phone ? (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-slate-400" />
                              <span className="font-mono">{p.phone}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No phone saved</span>
                          )}

                          {p.address ? (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-slate-400" />
                              <span className="truncate">{p.address}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic block">No address saved</span>
                          )}

                          {p.yarn_types && (
                            <div className="text-xs bg-slate-50 border border-slate-100 p-2 rounded block">
                              <strong className="text-slate-500 block uppercase tracking-wider font-mono mb-1">Yarns:</strong>
                              <span className="font-medium text-slate-700">{p.yarn_types}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="text-xs font-mono uppercase text-slate-400 tracking-wider font-bold">Outstanding Balance</span>
                          <span className={`text-lg font-extrabold ${p.balance > 0 ? "text-slate-900" : "text-emerald-600"}`}>
                            {formatBalance(p.balance)}
                          </span>
                        </div>

                        <div className="flex gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedSupplierId(p.id);
                              setSelectedCustomerId(p.id);
                              setActiveTab(directoryTab === "suppliers" ? "supplier_ledger" : "customer_ledger");
                            }}
                            title="View Ledger"
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition border border-slate-200 cursor-pointer"
                          >
                            <BookOpen className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditingParty(p)}
                            title="Edit Details"
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition border border-slate-200 cursor-pointer"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteParty(p.id)}
                            title="Delete Party"
                            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition border border-rose-200 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                {parties.filter((p) => p.type === (directoryTab === "suppliers" ? "supplier" : "customer")).length === 0 && (
                  <div className="col-span-full py-16 text-center text-slate-400">
                    No directory records found. Click "Add Party" to start saving clients.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================= */}
          {/* 7. YARN INVENTORY VIEW */}
          {/* ========================================= */}
          {activeTab === "inventory" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Toolbar */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search yarns..."
                    value={yarnSearchQuery}
                    onChange={(e) => setYarnSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 w-full focus:bg-white focus:outline-blue-500"
                  />
                </div>

                <div className="flex gap-2 w-full md:w-auto justify-end">
                  <button
                    onClick={() => {
                      const newName = prompt("Enter Yarn Name / Code (e.g. 30/1 Carded):");
                      if (newName && newName.trim()) {
                        fetch("/api/yarns", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ name: newName.trim(), unit: "KG" }),
                        }).then(() => triggerRecalculation());
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="h-4.5 w-4.5" />
                    Add Yarn Product
                  </button>
                </div>
              </div>

              {/* Inventory Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {yarns
                  .filter((y) => y.name.toLowerCase().includes(yarnSearchQuery.toLowerCase()))
                  .map((y) => (
                    <div
                      key={y.id}
                      className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-lg text-slate-800 truncate">{y.name}</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-500">
                          <div>
                            <span className="block text-[10px] text-slate-400 uppercase">Count</span>
                            <span className="font-semibold text-slate-700">{y.count || "-"}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-400 uppercase">Composition</span>
                            <span className="font-semibold text-slate-700">{y.blend || "-"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-end">
                        <div className="flex flex-col">
                          <span className="text-xs font-mono uppercase text-slate-400 tracking-wider font-bold">Available Stock</span>
                          <span className={`text-2xl font-black font-display ${y.stock < 100 ? "text-amber-500" : "text-blue-600"}`}>
                            {y.stock} <span className="text-xs font-bold font-mono text-slate-500">{y.unit}</span>
                          </span>
                        </div>

                        <div className="flex gap-1">
                          <button
                            onClick={() => setEditingYarn(y)}
                            title="Edit Yarn details"
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition border border-slate-200 cursor-pointer"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteYarn(y.id)}
                            title="Delete Yarn"
                            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition border border-rose-200 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                {yarns.length === 0 && (
                  <div className="col-span-full py-16 text-center text-slate-400">
                    No yarns saved in inventory yet. Add yarn products above or register them during purchases.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================= */}
          {/* 8. TRANSACTION LOG / HISTORY VIEW */}
          {/* ========================================= */}
          {activeTab === "history" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Comprehensive Filter Bar */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* General search query */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 font-mono">Search Text</label>
                    <input
                      type="text"
                      placeholder="Search details..."
                      value={txSearchQuery}
                      onChange={(e) => setTxSearchQuery(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 text-sm focus:bg-white focus:outline-blue-500"
                    />
                  </div>

                  {/* Transaction type filter */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 font-mono">Category</label>
                    <select
                      value={txTypeFilter}
                      onChange={(e) => setTxTypeFilter(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 text-sm focus:bg-white"
                    >
                      <option value="all">All Entries</option>
                      <option value="purchase">Purchases Goods Only</option>
                      <option value="sales">Sales Goods Only</option>
                      <option value="payment">Payments / Receipts</option>
                    </select>
                  </div>

                  {/* Party Filter */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 font-mono">Specific Party</label>
                    <select
                      value={txPartyFilter}
                      onChange={(e) => setTxPartyFilter(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 text-sm focus:bg-white"
                    >
                      <option value="all">All Parties</option>
                      {parties.map((p) => (
                        <option key={p.id} value={p.id}>
                          [{p.type === "supplier" ? "Supplier" : "Customer"}] {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dates filter */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 font-mono">From Date</label>
                      <input
                        type="date"
                        value={txDateFrom}
                        onChange={(e) => setTxDateFrom(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50 text-xs focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 font-mono">To Date</label>
                      <input
                        type="date"
                        value={txDateTo}
                        onChange={(e) => setTxDateTo(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50 text-xs focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      const csvData = filteredTransactions.map((tx) => ({
                        Date: tx.date,
                        InvoiceId: tx.invoice_id,
                        Party: tx.party_name,
                        PartyType: tx.party_type,
                        Particulars: tx.particulars,
                        Debit: tx.debit,
                        Credit: tx.credit,
                      }));
                      exportToCSV(csvData, "ABC_Yarn_House_Transactions");
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="h-4.5 w-4.5" />
                    Export Filtered CSV
                  </button>
                </div>
              </div>

              {/* Transactions List */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-slate-100 text-xs font-mono uppercase border-b border-slate-800">
                        <th className="py-4 px-4 text-center">Date</th>
                        <th className="py-4 px-4">Party</th>
                        <th className="py-4 px-6">Particulars</th>
                        <th className="py-4 px-4 text-right">Debit (৳)</th>
                        <th className="py-4 px-4 text-right">Credit (৳)</th>
                        <th className="py-4 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {filteredTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3 px-4 text-center font-mono font-medium text-slate-600 shrink-0 whitespace-nowrap">
                            {tx.date}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-800 block">{tx.party_name}</span>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">
                              {tx.party_type}
                            </span>
                          </td>
                          <td className="py-3 px-6 font-medium text-slate-700">
                            {tx.particulars}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                            {tx.debit > 0 ? formatTk(tx.debit) : "-"}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                            {tx.credit > 0 ? formatTk(tx.credit) : "-"}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleDeleteInvoice(tx.invoice_id)}
                              className="p-1.5 hover:bg-rose-50 text-rose-500 rounded hover:text-rose-600 transition cursor-pointer"
                              title="Delete complete invoice entry"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          </td>
                        </tr>
                      ))}

                      {filteredTransactions.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                            No transactions fit selected filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ========================================= */}
      {/* 9. MODALS & SLIDE-OVERS */}
      {/* ========================================= */}

      {/* CASH PAYMENT/RECEIPT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 overflow-hidden shadow-2xl animate-scaleIn">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <div>
                <h4 className="font-display font-bold text-lg">Post Ledger Payment</h4>
                <p className="text-xs text-slate-400">Post non-invoice cash receipt, RTGS, check payments.</p>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handlePostPayment} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Select Party</label>
                <select
                  required
                  value={paymentPartyId}
                  onChange={(e) => setPaymentPartyId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 text-sm focus:bg-white focus:outline-blue-500"
                >
                  {parties.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.type === "supplier" ? "Supplier" : "Customer"}] {p.name} (Bal: {formatTk(p.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Date</label>
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 text-sm focus:bg-white focus:outline-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Amount (৳)</label>
                <input
                  type="number"
                  required
                  step="any"
                  placeholder="0.00"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 text-sm focus:bg-white focus:outline-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Particulars / Payment Mode</label>
                <select
                  value={paymentParticulars}
                  onChange={(e) => setPaymentParticulars(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 text-sm focus:bg-white focus:outline-blue-500"
                >
                  <option value="Cash Receipt">Cash Receipt</option>
                  <option value="Cash Payment">Cash Payment</option>
                  <option value="RTGS">RTGS Bank</option>
                  <option value="Fund Transfer">Fund Transfer</option>
                  <option value="Bank Check">Bank Check</option>
                  <option value="DBBL ABC">DBBL ABC Bank</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-800 text-sm font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2 rounded-lg text-sm transition cursor-pointer"
                >
                  Post Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PARTY DETAILS MODAL */}
      {editingParty && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 overflow-hidden shadow-2xl animate-scaleIn">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <div>
                <h4 className="font-display font-bold text-lg">Edit Party Details</h4>
                <p className="text-xs text-slate-400">Update phone, address, and client tags.</p>
              </div>
              <button
                onClick={() => setEditingParty(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePartyEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Party Name</label>
                <input
                  type="text"
                  required
                  value={editingParty.name}
                  onChange={(e) => setEditingParty((p: any) => ({ ...p, name: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 text-sm focus:bg-white focus:outline-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Phone Number</label>
                <input
                  type="text"
                  value={editingParty.phone}
                  onChange={(e) => setEditingParty((p: any) => ({ ...p, phone: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 text-sm focus:bg-white focus:outline-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Address</label>
                <input
                  type="text"
                  value={editingParty.address}
                  onChange={(e) => setEditingParty((p: any) => ({ ...p, address: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 text-sm focus:bg-white focus:outline-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Yarn Products / Tags</label>
                <input
                  type="text"
                  placeholder="e.g. 30/1 Carded, 26/1 Cvc"
                  value={editingParty.yarn_types}
                  onChange={(e) => setEditingParty((p: any) => ({ ...p, yarn_types: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 text-sm focus:bg-white focus:outline-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingParty(null)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-800 text-sm font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2 rounded-lg text-sm transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT YARN INVENTORY DETAILS MODAL */}
      {editingYarn && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 overflow-hidden shadow-2xl animate-scaleIn">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <div>
                <h4 className="font-display font-bold text-lg">Edit Yarn Product</h4>
                <p className="text-xs text-slate-400">Update yarn name, counts, blends, and units.</p>
              </div>
              <button
                onClick={() => setEditingYarn(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveYarnEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Yarn Name</label>
                <input
                  type="text"
                  required
                  value={editingYarn.name}
                  onChange={(e) => setEditingYarn((y: any) => ({ ...y, name: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 text-sm focus:bg-white focus:outline-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Count Code</label>
                <input
                  type="text"
                  placeholder="e.g. 30/1, 26/1"
                  value={editingYarn.count}
                  onChange={(e) => setEditingYarn((y: any) => ({ ...y, count: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 text-sm focus:bg-white focus:outline-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Blend composition</label>
                <input
                  type="text"
                  placeholder="e.g. Carded, Combed, PC"
                  value={editingYarn.blend}
                  onChange={(e) => setEditingYarn((y: any) => ({ ...y, blend: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 text-sm focus:bg-white focus:outline-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Unit</label>
                <select
                  value={editingYarn.unit}
                  onChange={(e: any) => setEditingYarn((y: any) => ({ ...y, unit: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 text-sm focus:bg-white focus:outline-blue-500"
                >
                  <option value="KG">Kilograms (KG)</option>
                  <option value="LBS">Pounds (LBS)</option>
                  <option value="BAG">Bags (BAG)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingYarn(null)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-800 text-sm font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2 rounded-lg text-sm transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
