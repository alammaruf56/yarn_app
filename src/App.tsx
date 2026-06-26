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
  X,
  RotateCcw,
  UploadCloud,
  FileImage,
  Brain,
  Sparkles,
  Camera,
  AlertCircle
} from "lucide-react";
import { Party, Yarn, Transaction, DashboardStats } from "./types";

export default function App() {
  // Navigation / Tabs
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "purchase" | "sales" | "product_return" | "supplier_ledger" | "customer_ledger" | "directory" | "inventory" | "history" | "dues"
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
  const [duesSearchQuery, setDuesSearchQuery] = useState("");
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

  // AI OCR Hand-Note Scanner States
  const [scanImage, setScanImage] = useState<string | null>(null);
  const [scanImageName, setScanImageName] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<any | null>(null);

  // Transaction Edit Modal States
  const [editingTransaction, setEditingTransaction] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    date: "",
    particulars: "",
    debit: "",
    credit: "",
    quantity: "",
    rate: "",
    entry_type: "" as any,
  });

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

  // Payment Type helper states for Purchase form
  const [purchasePayType, setPurchasePayType] = useState<"cash" | "bank">("cash");
  const [purchaseBankType, setPurchaseBankType] = useState<"Bank Check" | "Fund Transfer">("Bank Check");
  const [purchaseBankName, setPurchaseBankName] = useState("");

  // Payment Type helper states for Sales form
  const [salesPayType, setSalesPayType] = useState<"cash" | "bank">("cash");
  const [salesBankType, setSalesBankType] = useState<"Bank Check" | "Fund Transfer">("Bank Check");
  const [salesBankName, setSalesBankName] = useState("");

  // Payment Type helper states for Post Payment modal
  const [modalDirection, setModalDirection] = useState<"receipt" | "payment">("receipt");
  const [modalPayType, setModalPayType] = useState<"cash" | "bank">("cash");
  const [modalBankType, setModalBankType] = useState<"Bank Check" | "Fund Transfer">("Bank Check");
  const [modalBankName, setModalBankName] = useState("");

  useEffect(() => {
    if (paymentPartyId) {
      const p = parties.find((party) => party.id === paymentPartyId);
      if (p) {
        setModalDirection(p.type === "supplier" ? "payment" : "receipt");
      }
    }
  }, [paymentPartyId, parties]);

  // Form States: Product Return Entry
  const [returnForm, setReturnForm] = useState({
    date: new Date().toISOString().split("T")[0],
    party_type: "customer" as "supplier" | "customer",
    party_name: "",
    party_id: "",
    party_phone: "",
    party_address: "",
    yarn_name: "",
    yarn_id: "",
    yarn_count: "",
    yarn_blend: "",
    unit: "KG" as "KG" | "LBS" | "BAG",
    quantity: "",
    rate: "",
    reason: "",
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
  // AI OCR HAND-NOTE SCANNER HANDLERS
  // -----------------------------------------
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setScanError("Please upload an image file (PNG, JPG, JPEG, WEBP).");
      return;
    }
    setScanImageName(file.name);
    setScanError(null);
    setScanResult(null);

    const reader = new FileReader();
    reader.onload = () => {
      setScanImage(reader.result as string);
    };
    reader.onerror = () => {
      setScanError("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  };

  const handleScanWithAI = async () => {
    if (!scanImage) return;
    setIsScanning(true);
    setScanError(null);
    setScanResult(null);

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: scanImage }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "An error occurred during scanning.");
      }
      setScanResult(data);
    } catch (err: any) {
      console.error(err);
      setScanError(err.message || "Failed to analyze handwritten note with Gemini.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleAutofill = (result: any) => {
    if (!result) return;
    const entryType = result.entry_type || "sales";
    
    // Find matching party in local state
    let matchedParty = parties.find(
      (p) => p.name.toLowerCase() === (result.party_name || "").toLowerCase().trim()
    );
    if (!matchedParty && result.party_name) {
      matchedParty = parties.find((p) =>
        p.name.toLowerCase().includes(result.party_name.toLowerCase())
      );
    }

    // Find matching yarn in local state
    let matchedYarn = yarns.find(
      (y) => y.name.toLowerCase() === (result.yarn_name || "").toLowerCase().trim()
    );
    if (!matchedYarn && result.yarn_name) {
      matchedYarn = yarns.find((y) =>
        y.name.toLowerCase().includes(result.yarn_name.toLowerCase())
      );
    }

    const dateValue = result.date || new Date().toISOString().split("T")[0];

    if (entryType === "purchase" || result.party_type === "supplier") {
      setPurchaseForm({
        date: dateValue,
        supplier_name: matchedParty ? matchedParty.name : (result.party_name || ""),
        supplier_id: matchedParty ? matchedParty.id : "",
        supplier_phone: matchedParty ? matchedParty.phone : "",
        supplier_address: matchedParty ? matchedParty.address : "",
        yarn_name: matchedYarn ? matchedYarn.name : (result.yarn_name || ""),
        yarn_id: matchedYarn ? matchedYarn.id : "",
        yarn_count: result.yarn_count || "",
        yarn_blend: result.yarn_blend || "",
        unit: (result.unit || "KG") as "KG" | "LBS" | "BAG",
        quantity: result.quantity ? String(result.quantity) : "",
        rate: result.rate ? String(result.rate) : "",
        car_rent: result.car_rent ? String(result.car_rent) : "",
        labour: result.labour ? String(result.labour) : "",
        payment: result.payment ? String(result.payment) : "",
        payment_method: result.payment_method || "Cash Payment",
      });
      setActiveTab("purchase");
    } else if (entryType === "return") {
      setReturnForm({
        date: dateValue,
        party_type: (result.party_type || "customer") as "supplier" | "customer",
        party_name: matchedParty ? matchedParty.name : (result.party_name || ""),
        party_id: matchedParty ? matchedParty.id : "",
        party_phone: matchedParty ? matchedParty.phone : "",
        party_address: matchedParty ? matchedParty.address : "",
        yarn_name: matchedYarn ? matchedYarn.name : (result.yarn_name || ""),
        yarn_id: matchedYarn ? matchedYarn.id : "",
        yarn_count: result.yarn_count || "",
        yarn_blend: result.yarn_blend || "",
        unit: (result.unit || "KG") as "KG" | "LBS" | "BAG",
        quantity: result.quantity ? String(result.quantity) : "",
        rate: result.rate ? String(result.rate) : "",
        reason: result.reason || "",
      });
      setActiveTab("product_return");
    } else if (entryType === "payment") {
      setPaymentPartyId(matchedParty ? matchedParty.id : "");
      setPaymentAmount(result.payment ? String(result.payment) : "");
      setPaymentParticulars(result.payment_method ? `${result.payment_method} Receipt` : "Cash Receipt");
      setPaymentDate(dateValue);
      setShowPaymentModal(true);
      if (matchedParty) {
        if (matchedParty.type === "supplier") setActiveTab("supplier_ledger");
        else setActiveTab("customer_ledger");
      } else {
        setActiveTab("customers");
      }
    } else {
      setSalesForm({
        date: dateValue,
        customer_name: matchedParty ? matchedParty.name : (result.party_name || ""),
        customer_id: matchedParty ? matchedParty.id : "",
        customer_phone: matchedParty ? matchedParty.phone : "",
        customer_address: matchedParty ? matchedParty.address : "",
        yarn_name: matchedYarn ? matchedYarn.name : (result.yarn_name || ""),
        yarn_id: matchedYarn ? matchedYarn.id : "",
        yarn_count: result.yarn_count || "",
        yarn_blend: result.yarn_blend || "",
        unit: (result.unit || "KG") as "KG" | "LBS" | "BAG",
        quantity: result.quantity ? String(result.quantity) : "",
        rate: result.rate ? String(result.rate) : "",
        car_rent: result.car_rent ? String(result.car_rent) : "",
        labour: result.labour ? String(result.labour) : "",
        payment: result.payment ? String(result.payment) : "",
        payment_method: result.payment_method || "Cash Receipt",
      });
      setActiveTab("sales");
    }

    // Reset scanner states
    setScanImage(null);
    setScanImageName(null);
    setScanResult(null);
    setScanError(null);
  };

  const handleBulkImport = async () => {
    if (!scanResult || !scanResult.ledger_entries) return;
    setIsImporting(true);
    try {
      const res = await fetch("/api/scan-bulk-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          party_name: scanResult.party_name,
          party_type: scanResult.party_type || "customer",
          entries: scanResult.ledger_entries,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to import ledger entries.");
      }

      alert(`Successfully imported ${scanResult.ledger_entries.length} transactions into ${scanResult.party_name}'s Ledger!`);
      
      // Trigger full state recalculation
      await triggerRecalculation();

      // Navigate to the correct ledger
      if (scanResult.party_type === "supplier") {
        setSelectedSupplierId(data.party_id || "");
        setActiveTab("supplier_ledger");
      } else {
        setSelectedCustomerId(data.party_id || "");
        setActiveTab("customer_ledger");
      }

      // Reset Scanner
      setScanImage(null);
      setScanImageName(null);
      setScanResult(null);
      setScanError(null);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to bulk import entries.");
    } finally {
      setIsImporting(false);
    }
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

  // Handle Party Input for Returns
  const handleReturnPartyInput = (val: string, type: "supplier" | "customer") => {
    setReturnForm((prev) => ({ ...prev, party_name: val, party_id: "" }));
    if (val.trim().length > 0) {
      const filtered = parties.filter(
        (p) => p.type === type && p.name.toLowerCase().includes(val.toLowerCase())
      );
      if (type === "supplier") {
        setSupplierSuggestions(filtered);
        setShowSupplierDropdown(true);
      } else {
        setCustomerSuggestions(filtered);
        setShowCustomerDropdown(true);
      }
    } else {
      setSupplierSuggestions([]);
      setCustomerSuggestions([]);
      setShowSupplierDropdown(false);
      setShowCustomerDropdown(false);
    }
  };

  const selectReturnPartySuggestion = (party: Party) => {
    setReturnForm((prev) => ({
      ...prev,
      party_name: party.name,
      party_id: party.id,
      party_phone: party.phone,
      party_address: party.address,
    }));
    setShowSupplierDropdown(false);
    setShowCustomerDropdown(false);
  };

  // Handle Yarn Input
  const handleYarnInput = (val: string, formType: "purchase" | "sales" | "return") => {
    const updateForm = formType === "purchase"
      ? setPurchaseForm
      : formType === "sales"
        ? setSalesForm
        : setReturnForm;
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

  const selectYarnSuggestion = (yarn: Yarn, formType: "purchase" | "sales" | "return") => {
    const updateForm = formType === "purchase"
      ? setPurchaseForm
      : formType === "sales"
        ? setSalesForm
        : setReturnForm;
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

    const finalPaymentMethod = purchasePayType === "cash" 
      ? "Cash Payment" 
      : `${purchaseBankName.trim() || "Bank"} - ${purchaseBankType} Payment`;

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
      payment_method: finalPaymentMethod,
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
        setPurchasePayType("cash");
        setPurchaseBankType("Bank Check");
        setPurchaseBankName("");
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

    const finalPaymentMethod = salesPayType === "cash" 
      ? "Cash Receipt" 
      : `${salesBankName.trim() || "Bank"} - ${salesBankType} Receipt`;

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
      payment_method: finalPaymentMethod,
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
        setSalesPayType("cash");
        setSalesBankType("Bank Check");
        setSalesBankName("");
        await triggerRecalculation();
        setActiveTab("customer_ledger");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Submit Product Return Entry
  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnForm.party_name.trim()) return alert("Party Name is required");
    if (!returnForm.yarn_name.trim()) return alert("Yarn Name is required");
    if (!returnForm.quantity.trim()) return alert("Quantity is required");
    if (!returnForm.rate.trim()) return alert("Rate is required");

    const payload = {
      date: returnForm.date,
      party_id: returnForm.party_id,
      party_name: returnForm.party_name,
      party_type: returnForm.party_type,
      phone: returnForm.party_phone,
      address: returnForm.party_address,
      yarn_name: returnForm.yarn_name,
      yarn_id: returnForm.yarn_id,
      yarn_count: returnForm.yarn_count,
      yarn_blend: returnForm.yarn_blend,
      unit: returnForm.unit,
      quantity: returnForm.quantity,
      rate: returnForm.rate,
      reason: returnForm.reason,
    };

    try {
      const res = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert("Product return transaction posted successfully!");
        setReturnForm({
          date: new Date().toISOString().split("T")[0],
          party_type: returnForm.party_type,
          party_name: "",
          party_id: "",
          party_phone: "",
          party_address: "",
          yarn_name: "",
          yarn_id: "",
          yarn_count: "",
          yarn_blend: "",
          unit: "KG",
          quantity: "",
          rate: "",
          reason: "",
        });
        await triggerRecalculation();
        setActiveTab(returnForm.party_type === "supplier" ? "supplier_ledger" : "customer_ledger");
      } else {
        const errData = await res.json();
        alert(`Error: ${errData.error || "Failed to post product return"}`);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to submit product return.");
    }
  };

  const handleQuickPayForParty = (partyId: string) => {
    setPaymentPartyId(partyId);
    setShowPaymentModal(true);
  };

  // Post single Payment/Receipt Receipt (e.g. Bank/RTGS/Cash)
  const handlePostPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentPartyId) return alert("Please select a party");
    if (!paymentAmount) return alert("Please enter the amount");

    const calculatedParticulars = modalPayType === "cash"
      ? (modalDirection === "receipt" ? "Cash Receipt" : "Cash Payment")
      : `${modalBankName.trim() || "Bank"} - ${modalBankType} ${modalDirection === "receipt" ? "Receipt" : "Payment"}`;

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: paymentDate,
          party_id: paymentPartyId,
          particulars: calculatedParticulars,
          amount: paymentAmount,
        }),
      });

      if (res.ok) {
        alert("Payment transaction posted successfully!");
        setShowPaymentModal(false);
        setPaymentAmount("");
        setModalPayType("cash");
        setModalBankType("Bank Check");
        setModalBankName("");
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

  // Open Edit Transaction Dialog
  const handleOpenEdit = (tx: any) => {
    setEditingTransaction(tx);
    setEditForm({
      date: tx.date || "",
      particulars: tx.particulars || "",
      debit: tx.debit !== undefined ? String(tx.debit) : "0",
      credit: tx.credit !== undefined ? String(tx.credit) : "0",
      quantity: tx.quantity !== undefined ? String(tx.quantity) : "",
      rate: tx.rate !== undefined ? String(tx.rate) : "",
      entry_type: tx.entry_type || "goods",
    });
    setShowEditModal(true);
  };

  // Save Edited Transaction
  const handleSaveEdit = async () => {
    if (!editingTransaction) return;
    try {
      const res = await fetch(`/api/transactions/${editingTransaction.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: editForm.date,
          particulars: editForm.particulars,
          debit: parseFloat(editForm.debit) || 0,
          credit: parseFloat(editForm.credit) || 0,
          quantity: editForm.quantity ? parseFloat(editForm.quantity) : 0,
          rate: editForm.rate ? parseFloat(editForm.rate) : 0,
          entry_type: editForm.entry_type,
        }),
      });

      if (res.ok) {
        alert("Transaction updated successfully!");
        setShowEditModal(false);
        setEditingTransaction(null);
        await triggerRecalculation();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update transaction.");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating transaction.");
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
      (txTypeFilter === "payment" && tx.entry_type === "payment") ||
      (txTypeFilter === "return" && tx.entry_type === "return");

    // Party filter
    const matchesParty = txPartyFilter === "all" || tx.party_id === txPartyFilter;

    // Date filters
    const matchesFromDate = !txDateFrom || tx.date >= txDateFrom;
    const matchesToDate = !txDateTo || tx.date <= txDateTo;

    return matchesSearch && matchesType && matchesParty && matchesFromDate && matchesToDate;
  });

  // Calculate Running balance & ledger lines for chosen party (Ledger)
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

  // Daily, Weekly, Monthly calculations for Transaction Log
  const getPeriodStats = () => {
    const getFormattedDateStr = (date: Date) => {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };

    const todayStr = getFormattedDateStr(new Date());
    
    const getPastDateStr = (daysAgo: number) => {
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      return getFormattedDateStr(d);
    };
    
    const sevenDaysAgoStr = getPastDateStr(6); // last 7 days inclusive of today
    const thirtyDaysAgoStr = getPastDateStr(29); // last 30 days inclusive of today

    let todayPaid = 0;
    let todayReceived = 0;
    let todaySales = 0;

    let weekPaid = 0;
    let weekReceived = 0;
    let weekSales = 0;

    let monthPaid = 0;
    let monthReceived = 0;
    let monthSales = 0;

    transactions.forEach((tx) => {
      const isToday = tx.date === todayStr;
      const isThisWeek = tx.date >= sevenDaysAgoStr && tx.date <= todayStr;
      const isThisMonth = tx.date >= thirtyDaysAgoStr && tx.date <= todayStr;

      // Money Paid: supplier payment (debit)
      if (tx.entry_type === "payment" && tx.party_type === "supplier") {
        if (isToday) todayPaid += tx.debit;
        if (isThisWeek) weekPaid += tx.debit;
        if (isThisMonth) monthPaid += tx.debit;
      }

      // Money Received: customer payment (debit)
      if (tx.entry_type === "payment" && tx.party_type === "customer") {
        if (isToday) todayReceived += tx.debit;
        if (isThisWeek) weekReceived += tx.debit;
        if (isThisMonth) monthReceived += tx.debit;
      }

      // Total Sales: customer goods (credit)
      if (tx.entry_type === "goods" && tx.party_type === "customer") {
        if (isToday) todaySales += tx.credit;
        if (isThisWeek) weekSales += tx.credit;
        if (isThisMonth) monthSales += tx.credit;
      }
    });

    return {
      today: { paid: todayPaid, received: todayReceived, sales: todaySales },
      week: { paid: weekPaid, received: weekReceived, sales: weekSales },
      month: { paid: monthPaid, received: monthReceived, sales: monthSales },
    };
  };

  const periodStats = getPeriodStats();

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

            <button
              onClick={() => setActiveTab("product_return")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === "product_return"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/30 font-semibold"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              }`}
            >
              <RotateCcw className="h-4.5 w-4.5 text-rose-400" />
              Product Return
            </button>

            <div className="pt-4 pb-1">
              <span className="px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">Ledgers</span>
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

            <button
              onClick={() => setActiveTab("dues")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === "dues"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/30 font-semibold"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              }`}
            >
              <AlertCircle className="h-4.5 w-4.5 text-rose-400" />
              Outstanding Dues
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

              {/* ========================================= */}
              {/* AI HAND-NOTE OCR SLIP SCANNER */}
              {/* ========================================= */}
              <div className="bg-gradient-to-br from-indigo-900/95 via-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-xl border border-indigo-500/20 relative overflow-hidden">
                {/* Background decorative glows */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-400/30 text-indigo-300">
                        <Brain className="h-5 w-5 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-base flex items-center gap-2">
                          AI Hand-Note Slip Scanner
                          <span className="px-2 py-0.5 bg-blue-500 text-white text-[9px] font-bold uppercase rounded-md tracking-widest font-mono">Gemini 3.5 Flash</span>
                        </h4>
                        <p className="text-slate-400 text-xs">Snap or upload handwritten bazar slips, katha memos, or client logs to auto-create entries.</p>
                      </div>
                    </div>
                    {scanImage && (
                      <button
                        onClick={() => {
                          setScanImage(null);
                          setScanImageName(null);
                          setScanResult(null);
                          setScanError(null);
                        }}
                        className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1 transition-colors px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10"
                      >
                        <X className="h-3.5 w-3.5" /> Clear / Reset
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    {/* LEFT COLUMN: Upload & Preview Zone */}
                    <div className="lg:col-span-5 flex flex-col justify-between">
                      {!scanImage ? (
                        <div
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                          onClick={() => document.getElementById("ai-scan-file-input")?.click()}
                          className="border-2 border-dashed border-indigo-500/30 hover:border-indigo-400/60 bg-white/5 hover:bg-indigo-950/20 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all h-64 group"
                        >
                          <input
                            id="ai-scan-file-input"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <UploadCloud className="h-10 w-10 text-indigo-400 group-hover:scale-110 transition-transform mb-3" />
                          <p className="text-sm font-semibold text-slate-200">Drag & drop photo here</p>
                          <p className="text-[10px] text-slate-400 mt-1">or click to browse local files / use camera</p>
                          <div className="mt-4 inline-flex items-center gap-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] px-2.5 py-1 rounded-full font-mono font-medium">
                            <Camera className="h-3 w-3" /> Mobile Camera Friendly
                          </div>
                        </div>
                      ) : (
                        <div className="relative border border-indigo-500/30 rounded-xl overflow-hidden bg-slate-950 h-64 flex items-center justify-center">
                          <img
                            src={scanImage}
                            alt="Hand Note Scan Preview"
                            className="max-h-full max-w-full object-contain"
                          />
                          {/* Animated Scan Line */}
                          {isScanning && (
                            <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_12px_#3b82f6] animate-scan-line z-20"></div>
                          )}
                          {/* Image Tag / Badge */}
                          <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-black/75 text-[10px] font-mono text-slate-300 rounded-md truncate max-w-[90%] border border-white/5">
                            📄 {scanImageName || "Uploaded Slip"}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* RIGHT COLUMN: Extraction Results or Guidance */}
                    <div className="lg:col-span-7 bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col justify-between">
                      {/* Scenario 1: Ready to Scan */}
                      {scanImage && !isScanning && !scanResult && !scanError && (
                        <div className="h-full flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="inline-flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
                              Image Ready
                            </div>
                            <h5 className="font-display font-semibold text-slate-100 text-sm">Review image and start scanning</h5>
                            <p className="text-xs text-slate-300 leading-relaxed">
                              Gemini will automatically extract Yarn Quality/Brand, count, supplier/customer names, and amounts. It handles typical handwritten slips, market notes, and local textile receipts.
                            </p>
                          </div>
                          <button
                            onClick={handleScanWithAI}
                            className="w-full mt-6 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-indigo-600/20 font-sans border border-indigo-500"
                          >
                            <Sparkles className="h-4 w-4 text-blue-200" /> Start Intelligent OCR Scan
                          </button>
                        </div>
                      )}

                      {/* Scenario 2: Scanning Loader */}
                      {isScanning && (
                        <div className="h-full flex flex-col items-center justify-center text-center py-8">
                          <div className="relative mb-4">
                            <div className="h-12 w-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
                            <Brain className="h-5 w-5 text-indigo-400 absolute top-1/2 left-1/2 transform -translate-x-1/10 -translate-y-1/2 animate-pulse" />
                          </div>
                          <h5 className="font-semibold text-slate-100 text-sm mb-1 animate-pulse">Scanning Handwritten note...</h5>
                          <p className="text-slate-400 text-xs max-w-sm">
                            Gemini is OCR-ing handwritten text, cross-referencing yarn counts, and matching party names against your database.
                          </p>
                          <div className="mt-4 flex flex-wrap justify-center gap-2">
                            <span className="text-[10px] font-mono px-2 py-0.5 bg-indigo-500/10 text-indigo-300 rounded border border-indigo-500/20">Digitizing Handwriting</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 bg-indigo-500/10 text-indigo-300 rounded border border-indigo-500/20">Mapping Balances</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 bg-indigo-500/10 text-indigo-300 rounded border border-indigo-500/20">Calculating Rates</span>
                          </div>
                        </div>
                      )}

                      {/* Scenario 3: Scan Completed Successfully */}
                      {scanResult && (
                        <div className="h-full flex flex-col justify-between">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
                                <Check className="h-3 w-3" /> Scan Complete
                              </span>
                              <span className="text-xs font-mono uppercase font-bold bg-white/10 text-slate-200 px-2 py-0.5 rounded border border-white/15">
                                {scanResult.document_type === "ledger_sheet" ? "Ledger Sheet" : "Single Memo"}
                              </span>
                            </div>

                            <p className="text-xs text-slate-300 italic bg-white/5 p-2.5 rounded-lg border border-white/5">
                              "{scanResult.summary || 'Scan parsed successfully.'}"
                            </p>

                             {scanResult.document_type === "ledger_sheet" && scanResult.ledger_entries ? (
                              /* Multi-row Ledger Sheet Table */
                              <div className="space-y-3">
                                <div className="bg-white/5 p-3 rounded-lg border border-white/5 space-y-2">
                                  <p className="text-[10px] text-slate-400 font-mono font-bold">Account Owner / Party & Type</p>
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      value={scanResult.party_name || ""}
                                      onChange={(e) => setScanResult({ ...scanResult, party_name: e.target.value })}
                                      className="flex-1 bg-white/5 border border-white/10 rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-hidden focus:border-indigo-500"
                                      placeholder="Party Name"
                                    />
                                    <select
                                      value={scanResult.party_type || "customer"}
                                      onChange={(e) => setScanResult({ ...scanResult, party_type: e.target.value })}
                                      className="bg-slate-900 border border-white/10 rounded px-2 py-1 text-slate-200 text-xs focus:outline-hidden"
                                    >
                                      <option value="customer">Customer</option>
                                      <option value="supplier">Supplier</option>
                                    </select>
                                  </div>
                                </div>

                                <div className="max-h-60 overflow-y-auto border border-white/10 rounded-lg text-[11px]">
                                  <table className="w-full text-left border-collapse">
                                    <thead>
                                      <tr className="bg-white/5 text-slate-300 font-mono border-b border-white/10">
                                        <th className="p-2">Date</th>
                                        <th className="p-2">Particulars</th>
                                        <th className="p-2 text-right">Debit</th>
                                        <th className="p-2 text-right">Credit</th>
                                        <th className="p-2 text-center w-8"></th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-slate-300">
                                      {scanResult.ledger_entries.map((entry: any, index: number) => (
                                        <tr key={index} className="hover:bg-white/5">
                                          <td className="p-1">
                                            <input
                                              type="text"
                                              value={entry.date || ""}
                                              onChange={(e) => {
                                                const updated = [...scanResult.ledger_entries];
                                                updated[index].date = e.target.value;
                                                setScanResult({ ...scanResult, ledger_entries: updated });
                                              }}
                                              className="w-full bg-transparent text-slate-200 border-none px-1 py-0.5 focus:bg-slate-800 focus:outline-hidden font-mono text-[11px]"
                                            />
                                          </td>
                                          <td className="p-1">
                                            <input
                                              type="text"
                                              value={entry.particulars || ""}
                                              onChange={(e) => {
                                                const updated = [...scanResult.ledger_entries];
                                                updated[index].particulars = e.target.value;
                                                setScanResult({ ...scanResult, ledger_entries: updated });
                                              }}
                                              className="w-full bg-transparent text-slate-200 border-none px-1 py-0.5 focus:bg-slate-800 focus:outline-hidden text-[11px]"
                                            />
                                          </td>
                                          <td className="p-1 text-right">
                                            <input
                                              type="number"
                                              step="any"
                                              value={entry.debit || ""}
                                              onChange={(e) => {
                                                const updated = [...scanResult.ledger_entries];
                                                updated[index].debit = e.target.value;
                                                setScanResult({ ...scanResult, ledger_entries: updated });
                                              }}
                                              placeholder="-"
                                              className="w-full bg-transparent text-emerald-400 text-right border-none px-1 py-0.5 focus:bg-slate-800 focus:outline-hidden font-mono text-[11px]"
                                            />
                                          </td>
                                          <td className="p-1 text-right">
                                            <input
                                              type="number"
                                              step="any"
                                              value={entry.credit || ""}
                                              onChange={(e) => {
                                                const updated = [...scanResult.ledger_entries];
                                                updated[index].credit = e.target.value;
                                                setScanResult({ ...scanResult, ledger_entries: updated });
                                              }}
                                              placeholder="-"
                                              className="w-full bg-transparent text-amber-400 text-right border-none px-1 py-0.5 focus:bg-slate-800 focus:outline-hidden font-mono text-[11px]"
                                            />
                                          </td>
                                          <td className="p-1 text-center">
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const updated = scanResult.ledger_entries.filter((_: any, i: number) => i !== index);
                                                setScanResult({ ...scanResult, ledger_entries: updated });
                                              }}
                                              className="text-rose-400 hover:text-rose-300 p-0.5 rounded hover:bg-white/5 transition"
                                              title="Delete Row"
                                            >
                                              <X className="h-3.5 w-3.5" />
                                            </button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                                <div className="flex justify-end pt-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const todayStr = new Date().toISOString().split("T")[0];
                                      const newEntry = { date: todayStr, particulars: "Goods Cargo", debit: "", credit: "", entry_type: "goods" };
                                      setScanResult({ ...scanResult, ledger_entries: [...(scanResult.ledger_entries || []), newEntry] });
                                    }}
                                    className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 border border-indigo-500/30 px-2 py-1 rounded bg-indigo-500/5 hover:bg-indigo-500/10 cursor-pointer"
                                  >
                                    <Plus className="h-3 w-3" /> Add Ledger Row
                                  </button>
                                </div>
                              </div>
                            ) : (
                              /* Details Breakdown (Editable!) */
                              <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="bg-white/5 p-2.5 rounded border border-white/5 space-y-1">
                                  <p className="text-[10px] text-slate-400 font-mono font-bold">Party Name</p>
                                  <input
                                    type="text"
                                    value={scanResult.party_name || ""}
                                    onChange={(e) => setScanResult({ ...scanResult, party_name: e.target.value })}
                                    className="w-full bg-slate-900/60 text-slate-100 border border-white/10 rounded px-2 py-1 text-xs focus:outline-hidden focus:border-indigo-500"
                                    placeholder="Unspecified"
                                  />
                                  <select
                                    value={scanResult.party_type || "customer"}
                                    onChange={(e) => setScanResult({ ...scanResult, party_type: e.target.value })}
                                    className="w-full bg-slate-900/60 text-slate-300 border border-white/10 rounded px-2 py-0.5 text-[10px] focus:outline-hidden"
                                  >
                                    <option value="customer">Customer</option>
                                    <option value="supplier">Supplier</option>
                                  </select>
                                </div>
                                <div className="bg-white/5 p-2.5 rounded border border-white/5 space-y-1">
                                  <p className="text-[10px] text-slate-400 font-mono font-bold">Yarn Info (Brand & Count)</p>
                                  <input
                                    type="text"
                                    value={scanResult.yarn_name || ""}
                                    onChange={(e) => setScanResult({ ...scanResult, yarn_name: e.target.value })}
                                    className="w-full bg-slate-900/60 text-slate-100 border border-white/10 rounded px-2 py-1 text-xs mb-1 focus:outline-hidden focus:border-indigo-500"
                                    placeholder="Name/Brand"
                                  />
                                  <input
                                    type="text"
                                    value={scanResult.yarn_count || ""}
                                    onChange={(e) => setScanResult({ ...scanResult, yarn_count: e.target.value })}
                                    className="w-full bg-slate-900/60 text-slate-100 border border-white/10 rounded px-2 py-1 text-xs focus:outline-hidden focus:border-indigo-500 font-mono"
                                    placeholder="Count e.g. 30/1"
                                  />
                                </div>
                                <div className="bg-white/5 p-2.5 rounded border border-white/5 space-y-1">
                                  <p className="text-[10px] text-slate-400 font-mono font-bold">Quantity & Rate</p>
                                  <input
                                    type="number"
                                    step="any"
                                    value={scanResult.quantity || ""}
                                    onChange={(e) => setScanResult({ ...scanResult, quantity: e.target.value })}
                                    className="w-full bg-slate-900/60 text-slate-100 border border-white/10 rounded px-2 py-1 text-xs mb-1 font-mono focus:outline-hidden focus:border-indigo-500"
                                    placeholder="Qty (KG)"
                                  />
                                  <input
                                    type="number"
                                    step="any"
                                    value={scanResult.rate || ""}
                                    onChange={(e) => setScanResult({ ...scanResult, rate: e.target.value })}
                                    className="w-full bg-slate-900/60 text-slate-100 border border-white/10 rounded px-2 py-1 text-xs font-mono focus:outline-hidden focus:border-indigo-500"
                                    placeholder="Rate ৳"
                                  />
                                </div>
                                <div className="bg-white/5 p-2.5 rounded border border-white/5 space-y-1">
                                  <p className="text-[10px] text-slate-400 font-mono font-bold">Payment & Expenses</p>
                                  <div className="flex gap-1.5">
                                    <input
                                      type="number"
                                      step="any"
                                      value={scanResult.payment || ""}
                                      onChange={(e) => setScanResult({ ...scanResult, payment: e.target.value })}
                                      className="w-1/2 bg-slate-900/60 text-slate-100 border border-white/10 rounded px-1 py-1 text-xs font-mono focus:outline-hidden focus:border-indigo-500"
                                      placeholder="Pay ৳"
                                    />
                                    <input
                                      type="number"
                                      step="any"
                                      value={scanResult.car_rent || ""}
                                      onChange={(e) => setScanResult({ ...scanResult, car_rent: e.target.value })}
                                      className="w-1/4 bg-slate-900/60 text-slate-100 border border-white/10 rounded px-1 py-1 text-[10px] font-mono focus:outline-hidden focus:border-indigo-500"
                                      placeholder="Rent"
                                      title="Transport Rent"
                                    />
                                    <input
                                      type="number"
                                      step="any"
                                      value={scanResult.labour || ""}
                                      onChange={(e) => setScanResult({ ...scanResult, labour: e.target.value })}
                                      className="w-1/4 bg-slate-900/60 text-slate-100 border border-white/10 rounded px-1 py-1 text-[10px] font-mono focus:outline-hidden focus:border-indigo-500"
                                      placeholder="Lab"
                                      title="Labour charges"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="mt-4 flex gap-2">
                            {scanResult.document_type === "ledger_sheet" && scanResult.ledger_entries ? (
                              <button
                                onClick={handleBulkImport}
                                disabled={isImporting}
                                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-emerald-500 shadow-md shadow-emerald-600/10"
                              >
                                {isImporting ? (
                                  <>
                                    <div className="h-3 w-3 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                                    Importing Ledger Records...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="h-4 w-4" /> Bulk Import {scanResult.ledger_entries.length} Ledger Records
                                  </>
                                )}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleAutofill(scanResult)}
                                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-emerald-500 shadow-md shadow-emerald-600/10"
                              >
                                <Sparkles className="h-4 w-4" /> Approve & Autofill Entry Form
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setScanResult(null);
                                setScanImage(null);
                                setScanImageName(null);
                              }}
                              className="py-2.5 px-3 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg border border-white/10 text-xs transition-colors cursor-pointer flex items-center gap-1 font-semibold"
                              title="Go back to upload screen"
                            >
                              ← Back / Rescan
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Scenario 4: Error State */}
                      {scanError && (
                        <div className="h-full flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="inline-flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
                              <AlertCircle className="h-3 w-3" /> Scan Error
                            </div>
                            <h5 className="font-semibold text-slate-100 text-sm">Failed to extract text from slip</h5>
                            <p className="text-xs text-rose-300 leading-relaxed bg-rose-500/5 p-3 rounded-lg border border-rose-500/10 font-mono">
                              {scanError}
                            </p>
                          </div>
                          <div className="mt-6 flex gap-2">
                            <button
                              onClick={handleScanWithAI}
                              className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer border border-indigo-500"
                            >
                              <RefreshCw className="h-3.5 w-3.5" /> Try Scanning Again
                            </button>
                            <button
                              onClick={() => {
                                setScanImage(null);
                                setScanImageName(null);
                                setScanResult(null);
                                setScanError(null);
                              }}
                              className="py-2.5 px-3 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg border border-white/10 text-xs transition-colors"
                            >
                              Select Different Image
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Scenario 5: Welcome / Guidance State */}
                      {!scanImage && (
                        <div className="h-full flex flex-col justify-between">
                          <div className="space-y-3">
                            <h5 className="font-display font-semibold text-slate-200 text-sm">How AI Scanning Works:</h5>
                            <ul className="text-xs text-slate-400 space-y-2 leading-relaxed">
                              <li className="flex items-start gap-2">
                                <span className="text-indigo-400 font-mono">1.</span>
                                <span>Upload any photo of handwritten market notes, daily katha slips, or mill receipts.</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-indigo-400 font-mono">2.</span>
                                <span>Our **Gemini 3.5 Flash** OCR engine scans Bengali/English market handwriting.</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-indigo-400 font-mono">3.</span>
                                <span>It cross-checks your database to auto-match existing Customers, Suppliers, and Yarn.</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-indigo-400 font-mono">4.</span>
                                <span>Approve the extracted values to automatically fill & navigate to the correct entry form!</span>
                              </li>
                            </ul>
                          </div>
                          <div className="text-[10px] text-indigo-400 font-mono mt-4">
                            ⚡ Powered by Google Gemini Multi-Modal Intelligence
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
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

                {/* 3. Recent Ledger Activity */}
                <div className="col-span-1 lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col">
                  <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                    <h4 className="text-sm font-bold text-slate-900">Recent Ledger Activity</h4>
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

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Payment Mode</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setPurchasePayType("cash")}
                            className={`py-2 px-3 text-sm font-semibold rounded-lg border transition cursor-pointer ${
                              purchasePayType === "cash"
                                ? "bg-emerald-600 border-emerald-600 text-white"
                                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            Cash
                          </button>
                          <button
                            type="button"
                            onClick={() => setPurchasePayType("bank")}
                            className={`py-2 px-3 text-sm font-semibold rounded-lg border transition cursor-pointer ${
                              purchasePayType === "bank"
                                ? "bg-emerald-600 border-emerald-600 text-white"
                                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            Bank
                          </button>
                        </div>
                      </div>

                      {purchasePayType === "bank" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 animate-fadeIn">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Transfer Type</label>
                            <select
                              value={purchaseBankType}
                              onChange={(e) => setPurchaseBankType(e.target.value as any)}
                              className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-white text-sm focus:outline-blue-500"
                            >
                              <option value="Bank Check">Bank Check</option>
                              <option value="Fund Transfer">Fund Transfer</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Bank Name</label>
                            <input
                              type="text"
                              placeholder="e.g. DBBL, EBL, City Bank"
                              value={purchaseBankName}
                              onChange={(e) => setPurchaseBankName(e.target.value)}
                              className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-white text-sm focus:outline-blue-500"
                            />
                          </div>
                        </div>
                      )}
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

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Payment Mode</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setSalesPayType("cash")}
                            className={`py-2 px-3 text-sm font-semibold rounded-lg border transition cursor-pointer ${
                              salesPayType === "cash"
                                ? "bg-indigo-600 border-indigo-600 text-white"
                                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            Cash
                          </button>
                          <button
                            type="button"
                            onClick={() => setSalesPayType("bank")}
                            className={`py-2 px-3 text-sm font-semibold rounded-lg border transition cursor-pointer ${
                              salesPayType === "bank"
                                ? "bg-indigo-600 border-indigo-600 text-white"
                                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            Bank
                          </button>
                        </div>
                      </div>

                      {salesPayType === "bank" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 animate-fadeIn">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Transfer Type</label>
                            <select
                              value={salesBankType}
                              onChange={(e) => setSalesBankType(e.target.value as any)}
                              className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-white text-sm focus:outline-blue-500"
                            >
                              <option value="Bank Check">Bank Check</option>
                              <option value="Fund Transfer">Fund Transfer</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Bank Name</label>
                            <input
                              type="text"
                              placeholder="e.g. DBBL, EBL, City Bank"
                              value={salesBankName}
                              onChange={(e) => setSalesBankName(e.target.value)}
                              className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-white text-sm focus:outline-blue-500"
                            />
                          </div>
                        </div>
                      )}
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
          {/* 3.1. PRODUCT RETURN VIEW */}
          {/* ========================================= */}
          {activeTab === "product_return" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn max-w-3xl mx-auto">
              <div className="bg-slate-900 p-6 text-white border-b border-slate-800">
                <h3 className="font-display text-lg font-bold">New Product Return Entry</h3>
                <p className="text-xs text-slate-400 mt-1">Record yarn product returns to back-calculate inventory and ledger balances.</p>
              </div>

              <form onSubmit={handleReturnSubmit} className="p-8 space-y-6">
                {/* Return Type Toggle */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 font-mono">Return Type</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setReturnForm(prev => ({ ...prev, party_type: "customer", party_id: "", party_name: "" }))}
                      className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                        returnForm.party_type === "customer"
                          ? "bg-rose-50 border-rose-300 text-rose-700 shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <TrendingDown className="h-4.5 w-4.5" />
                      Customer Return (Sales Return)
                    </button>
                    <button
                      type="button"
                      onClick={() => setReturnForm(prev => ({ ...prev, party_type: "supplier", party_id: "", party_name: "" }))}
                      className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                        returnForm.party_type === "supplier"
                          ? "bg-amber-50 border-amber-300 text-amber-700 shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <TrendingUp className="h-4.5 w-4.5" />
                      Supplier Return (Purchase Return)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Return Date</label>
                    <input
                      type="date"
                      required
                      value={returnForm.date}
                      onChange={(e) => setReturnForm((p) => ({ ...p, date: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 bg-slate-50 text-sm focus:bg-white focus:outline-blue-500"
                    />
                  </div>

                  {/* Party Suggest Input */}
                  <div className="relative">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">
                      {returnForm.party_type === "customer" ? "Customer Name" : "Supplier Name"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={`Type ${returnForm.party_type} name...`}
                      value={returnForm.party_name}
                      onChange={(e) => handleReturnPartyInput(e.target.value, returnForm.party_type)}
                      onBlur={() => setTimeout(() => { setShowCustomerDropdown(false); setShowSupplierDropdown(false); }, 200)}
                      onFocus={() => returnForm.party_name.trim().length > 0 && (returnForm.party_type === "supplier" ? setShowSupplierDropdown(true) : setShowCustomerDropdown(true))}
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 bg-slate-50 text-sm focus:bg-white focus:outline-blue-500"
                    />
                    
                    {/* Customer Dropdown Suggestions */}
                    {returnForm.party_type === "customer" && showCustomerDropdown && customerSuggestions.length > 0 && (
                      <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {customerSuggestions.map((c) => (
                          <div
                            key={c.id}
                            onMouseDown={() => selectReturnPartySuggestion(c)}
                            className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm font-medium flex justify-between"
                          >
                            <span>{c.name}</span>
                            <span className="text-xs font-mono text-indigo-500">{formatTk(c.balance)} balance</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Supplier Dropdown Suggestions */}
                    {returnForm.party_type === "supplier" && showSupplierDropdown && supplierSuggestions.length > 0 && (
                      <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {supplierSuggestions.map((s) => (
                          <div
                            key={s.id}
                            onMouseDown={() => selectReturnPartySuggestion(s)}
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

                {/* Optional Auto-Add Fields for New Party */}
                {!returnForm.party_id && returnForm.party_name.trim().length > 0 && (
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 space-y-4">
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4 text-amber-600" />
                      <span className="text-xs font-semibold text-amber-800">
                        "{returnForm.party_name}" is completely new. It will be auto-saved in Directory as a {returnForm.party_type}.
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <input
                          type="text"
                          placeholder="Phone (Optional)"
                          value={returnForm.party_phone}
                          onChange={(e) => setReturnForm((p) => ({ ...p, party_phone: e.target.value }))}
                          className="w-full border border-amber-300 rounded-lg px-3 py-1.5 bg-white text-xs"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Address (Optional)"
                          value={returnForm.party_address}
                          onChange={(e) => setReturnForm((p) => ({ ...p, party_address: e.target.value }))}
                          className="w-full border border-amber-300 rounded-lg px-3 py-1.5 bg-white text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Yarn Product Selection */}
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-6">
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest font-mono">Yarn Product Returned</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">Yarn Brand/Type Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Search or enter yarn name..."
                        value={returnForm.yarn_name}
                        onChange={(e) => handleYarnInput(e.target.value, "return")}
                        onBlur={() => setTimeout(() => setShowYarnDropdown(false), 200)}
                        onFocus={() => returnForm.yarn_name.trim().length > 0 && setShowYarnDropdown(true)}
                        className="w-full border border-slate-200 rounded-lg px-3.5 py-2 bg-white text-sm focus:outline-blue-500"
                      />
                      {showYarnDropdown && yarnSuggestions.length > 0 && (
                        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {yarnSuggestions.map((y) => (
                            <div
                              key={y.id}
                              onMouseDown={() => selectYarnSuggestion(y, "return")}
                              className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm font-medium flex justify-between"
                            >
                              <span>{y.name} ({y.count} {y.blend})</span>
                              <span className="text-xs font-mono text-slate-400">Stock: {y.stock} {y.unit}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Count</label>
                        <input
                          type="text"
                          placeholder="e.g. 32s"
                          value={returnForm.yarn_count}
                          onChange={(e) => setReturnForm((p) => ({ ...p, yarn_count: e.target.value }))}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Blend</label>
                        <input
                          type="text"
                          placeholder="e.g. Cotton"
                          value={returnForm.yarn_blend}
                          onChange={(e) => setReturnForm((p) => ({ ...p, yarn_blend: e.target.value }))}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Unit</label>
                        <select
                          value={returnForm.unit}
                          onChange={(e) => setReturnForm((p) => ({ ...p, unit: e.target.value as any }))}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-white text-sm"
                        >
                          <option value="KG">KG</option>
                          <option value="LBS">LBS</option>
                          <option value="BAG">BAG</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">Returned Quantity</label>
                      <input
                        type="number"
                        step="any"
                        required
                        placeholder="0.00"
                        value={returnForm.quantity}
                        onChange={(e) => setReturnForm((p) => ({ ...p, quantity: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-3.5 py-2 bg-white text-sm focus:outline-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">Rate (per Unit)</label>
                      <input
                        type="number"
                        step="any"
                        required
                        placeholder="0.00 ৳"
                        value={returnForm.rate}
                        onChange={(e) => setReturnForm((p) => ({ ...p, rate: e.target.value }))}
                        className="w-full border border-slate-200 rounded-lg px-3.5 py-2 bg-white text-sm focus:outline-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Reason for Return (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Defective package, weight mismatch, excess shipment"
                      value={returnForm.reason}
                      onChange={(e) => setReturnForm((p) => ({ ...p, reason: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3.5 py-2 bg-white text-sm focus:outline-blue-500"
                    />
                  </div>
                </div>

                {/* Return Dynamic Summary Card */}
                <div className="bg-slate-900 text-slate-100 p-6 rounded-xl space-y-4 font-mono shadow-inner">
                  <div className="flex justify-between text-xs border-b border-slate-800 pb-2">
                    <span className="text-slate-400">Total Return Value:</span>
                    <span className="text-white font-bold">
                      {formatTk((parseFloat(returnForm.quantity) || 0) * (parseFloat(returnForm.rate) || 0))}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs border-b border-slate-800 pb-2">
                    <span className="text-slate-400">Inventory Stock Change:</span>
                    <span className={returnForm.party_type === "customer" ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                      {returnForm.party_type === "customer" 
                        ? `+${parseFloat(returnForm.quantity) || 0} ${returnForm.unit} (Increases Stock)` 
                        : `-${parseFloat(returnForm.quantity) || 0} ${returnForm.unit} (Decreases Stock)`}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Ledger Balance Change:</span>
                    <span className="text-amber-400 font-bold">
                      -{formatTk((parseFloat(returnForm.quantity) || 0) * (parseFloat(returnForm.rate) || 0))} (Reduces Outstanding Balance)
                    </span>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-xl transition shadow-md shadow-blue-900/10 cursor-pointer"
                  >
                    Post Product Return
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================= */}
          {/* 4. SUPPLIER LEDGER */}
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

              {/* LEDGER REPORT SHEET */}
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
                        <h2 className="font-bengali text-3xl font-extrabold text-slate-800 tracking-tight">লেজার হিসাব বিবরণী</h2>
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
                                <tr 
                                  key={tx.id} 
                                  onClick={() => handleOpenEdit(tx)}
                                  className="hover:bg-slate-100/80 print:hover:bg-transparent transition cursor-pointer group"
                                  title="Click to edit individual transaction details"
                                >
                                  <td className="py-3 px-4 text-center font-mono font-medium text-slate-600 shrink-0 whitespace-nowrap">
                                    {tx.date}
                                  </td>
                                  <td className="py-3 px-6 font-semibold text-slate-800 flex items-center justify-between gap-2">
                                    <span>{tx.particulars}</span>
                                    <span className="opacity-0 group-hover:opacity-100 text-blue-600 transition text-[10px] flex items-center gap-1 font-sans font-normal bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 shrink-0">
                                      <Edit2 className="h-3 w-3" /> Edit
                                    </span>
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
                  Please select a supplier from the list above to render their complete ledger statement.
                </div>
              )}
            </div>
          )}

          {/* ========================================= */}
          {/* 5. CUSTOMER LEDGER */}
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

              {/* LEDGER REPORT SHEET */}
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
                        <h2 className="font-bengali text-3xl font-extrabold text-slate-800 tracking-tight">লেজার হিসাব বিবরণী</h2>
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
                                <tr 
                                  key={tx.id} 
                                  onClick={() => handleOpenEdit(tx)}
                                  className="hover:bg-slate-100/80 print:hover:bg-transparent transition cursor-pointer group"
                                  title="Click to edit individual transaction details"
                                >
                                  <td className="py-3 px-4 text-center font-mono font-medium text-slate-600 shrink-0 whitespace-nowrap">
                                    {tx.date}
                                  </td>
                                  <td className="py-3 px-6 font-semibold text-slate-800 flex items-center justify-between gap-2">
                                    <span>{tx.particulars}</span>
                                    <span className="opacity-0 group-hover:opacity-100 text-blue-600 transition text-[10px] flex items-center gap-1 font-sans font-normal bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 shrink-0">
                                      <Edit2 className="h-3 w-3" /> Edit
                                    </span>
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
                  Please select a customer from the list above to render their complete ledger statement.
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
              {/* Daily, Weekly, Monthly Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* TODAY */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition duration-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Today's Summary</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-500">Total Sales Today:</span>
                      <span className="text-sm font-bold text-indigo-600 font-mono">{formatTk(periodStats.today.sales)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-500">Received from Customer:</span>
                      <span className="text-sm font-bold text-emerald-600 font-mono">{formatTk(periodStats.today.received)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-500">Paid to Suppliers:</span>
                      <span className="text-sm font-bold text-rose-500 font-mono">{formatTk(periodStats.today.paid)}</span>
                    </div>
                  </div>
                </div>

                {/* WEEK */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition duration-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Weekly Summary (7 Days)</span>
                    <TrendingUp className="h-4.5 w-4.5 text-blue-500" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-500">Total Sales:</span>
                      <span className="text-sm font-bold text-indigo-600 font-mono">{formatTk(periodStats.week.sales)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-500">Received from Customer:</span>
                      <span className="text-sm font-bold text-emerald-600 font-mono">{formatTk(periodStats.week.received)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-500">Paid to Suppliers:</span>
                      <span className="text-sm font-bold text-rose-500 font-mono">{formatTk(periodStats.week.paid)}</span>
                    </div>
                  </div>
                </div>

                {/* MONTH */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition duration-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Monthly Summary (30 Days)</span>
                    <Database className="h-4.5 w-4.5 text-slate-400" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-500">Total Sales:</span>
                      <span className="text-sm font-bold text-indigo-600 font-mono">{formatTk(periodStats.month.sales)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-500">Received from Customer:</span>
                      <span className="text-sm font-bold text-emerald-600 font-mono">{formatTk(periodStats.month.received)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-500">Paid to Suppliers:</span>
                      <span className="text-sm font-bold text-rose-500 font-mono">{formatTk(periodStats.month.paid)}</span>
                    </div>
                  </div>
                </div>
              </div>

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
                      <option value="return">Product Returns</option>
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
                        <tr 
                          key={tx.id} 
                          onClick={() => handleOpenEdit(tx)}
                          className="hover:bg-slate-100/85 transition cursor-pointer group"
                          title="Click to edit individual transaction details"
                        >
                          <td className="py-3 px-4 text-center font-mono font-medium text-slate-600 shrink-0 whitespace-nowrap">
                            {tx.date}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-800 block">{tx.party_name}</span>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">
                              {tx.party_type}
                            </span>
                          </td>
                          <td className="py-3 px-6 font-medium text-slate-700 flex items-center justify-between gap-2">
                            <span>{tx.particulars}</span>
                            <span className="opacity-0 group-hover:opacity-100 text-blue-600 transition text-[10px] flex items-center gap-1 font-sans font-normal bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 shrink-0">
                              <Edit2 className="h-3 w-3" /> Click to Edit
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                            {tx.debit > 0 ? formatTk(tx.debit) : "-"}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                            {tx.credit > 0 ? formatTk(tx.credit) : "-"}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEdit(tx);
                                }}
                                className="p-1.5 hover:bg-blue-50 text-blue-600 rounded hover:text-blue-700 transition cursor-pointer"
                                title="Edit individual transaction"
                              >
                                <Edit2 className="h-4.5 w-4.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteInvoice(tx.invoice_id);
                                }}
                                className="p-1.5 hover:bg-rose-50 text-rose-500 rounded hover:text-rose-600 transition cursor-pointer"
                                title="Delete complete invoice entry"
                              >
                                <Trash2 className="h-4.5 w-4.5" />
                              </button>
                            </div>
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

          {/* ========================================= */}
          {/* 8.5 OUTSTANDING DUES DASHBOARD */}
          {/* ========================================= */}
          {activeTab === "dues" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Top Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Total Receivables Card */}
                <div className="bg-white p-6 rounded-xl border border-rose-100 shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-rose-500 font-mono">Total Receivable from Customers</p>
                    <h3 className="text-3xl font-extrabold font-display text-rose-600 mt-2 font-mono">
                      {formatTk(parties.filter(p => p.type === "customer" && p.balance > 0).reduce((sum, p) => sum + p.balance, 0))}
                    </h3>
                    <p className="text-slate-400 text-xs mt-1">Outstanding collections due from buyers</p>
                  </div>
                  <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
                    <TrendingUp className="h-8 w-8 text-rose-500" />
                  </div>
                </div>

                {/* Total Payables Card */}
                <div className="bg-white p-6 rounded-xl border border-amber-100 shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-500 font-mono">Total Payable to Suppliers</p>
                    <h3 className="text-3xl font-extrabold font-display text-amber-600 mt-2 font-mono">
                      {formatTk(parties.filter(p => p.type === "supplier" && p.balance > 0).reduce((sum, p) => sum + p.balance, 0))}
                    </h3>
                    <p className="text-slate-400 text-xs mt-1">Outstanding liabilities we owe to sellers</p>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                    <TrendingDown className="h-8 w-8 text-amber-500" />
                  </div>
                </div>
              </div>

              {/* Global search */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search outstanding accounts by name or phone..."
                  value={duesSearchQuery}
                  onChange={(e) => setDuesSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-0 outline-hidden text-sm placeholder-slate-400 text-slate-800 focus:outline-none"
                />
                {duesSearchQuery && (
                  <button onClick={() => setDuesSearchQuery("")} className="text-slate-400 hover:text-slate-600 font-semibold text-xs">Clear</button>
                )}
              </div>

              {/* Grid lists */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Customers Column */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col">
                  <div className="bg-rose-50/50 p-4 border-b border-slate-200 flex justify-between items-center">
                    <div>
                      <h4 className="font-display font-bold text-slate-800 text-base">Customers Dues List</h4>
                      <p className="text-xs text-rose-600/80 font-medium">Money we will get from customers</p>
                    </div>
                    <span className="bg-rose-100 text-rose-800 text-xs font-bold font-mono px-2.5 py-1 rounded-full border border-rose-200">
                      {parties.filter(p => p.type === "customer" && p.balance > 0).length} parties
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[550px]">
                    {parties
                      .filter(p => p.type === "customer" && p.balance > 0 && (
                        p.name.toLowerCase().includes(duesSearchQuery.toLowerCase()) ||
                        p.phone.includes(duesSearchQuery)
                      ))
                      .sort((a, b) => b.balance - a.balance)
                      .map((p) => (
                        <div key={p.id} className="p-4 hover:bg-slate-50 transition flex justify-between items-center gap-4">
                          <div className="space-y-1">
                            <span className="font-semibold text-slate-800 block text-sm">{p.name}</span>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-slate-500 text-xs">
                              <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {p.phone || "No phone"}</span>
                              {p.address && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {p.address}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            <div className="text-right">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block font-mono">Due Balance</span>
                              <span className="text-sm font-extrabold text-rose-600 font-mono">{formatTk(p.balance)}</span>
                            </div>
                            <button
                              onClick={() => handleQuickPayForParty(p.id)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer flex items-center gap-1 border border-emerald-700 shadow-xs"
                              title="Update cash receipt from customer"
                            >
                              <Plus className="h-3.5 w-3.5" /> Collect
                            </button>
                          </div>
                        </div>
                      ))}

                    {parties.filter(p => p.type === "customer" && p.balance > 0 && (
                      p.name.toLowerCase().includes(duesSearchQuery.toLowerCase()) ||
                      p.phone.includes(duesSearchQuery)
                    )).length === 0 && (
                      <div className="py-12 text-center text-slate-400 text-sm font-medium">
                        No outstanding customer dues found.
                      </div>
                    )}
                  </div>
                </div>

                {/* Suppliers Column */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col">
                  <div className="bg-amber-50/50 p-4 border-b border-slate-200 flex justify-between items-center">
                    <div>
                      <h4 className="font-display font-bold text-slate-800 text-base">Suppliers Payables List</h4>
                      <p className="text-xs text-amber-600/80 font-medium">Money they getting from me</p>
                    </div>
                    <span className="bg-amber-100 text-amber-800 text-xs font-bold font-mono px-2.5 py-1 rounded-full border border-amber-200">
                      {parties.filter(p => p.type === "supplier" && p.balance > 0).length} parties
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[550px]">
                    {parties
                      .filter(p => p.type === "supplier" && p.balance > 0 && (
                        p.name.toLowerCase().includes(duesSearchQuery.toLowerCase()) ||
                        p.phone.includes(duesSearchQuery)
                      ))
                      .sort((a, b) => b.balance - a.balance)
                      .map((p) => (
                        <div key={p.id} className="p-4 hover:bg-slate-50 transition flex justify-between items-center gap-4">
                          <div className="space-y-1">
                            <span className="font-semibold text-slate-800 block text-sm">{p.name}</span>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-slate-500 text-xs">
                              <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {p.phone || "No phone"}</span>
                              {p.address && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {p.address}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            <div className="text-right">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block font-mono">We Owe</span>
                              <span className="text-sm font-extrabold text-amber-600 font-mono">{formatTk(p.balance)}</span>
                            </div>
                            <button
                              onClick={() => handleQuickPayForParty(p.id)}
                              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer flex items-center gap-1 border border-blue-700 shadow-xs"
                              title="Update cash payment to supplier"
                            >
                              <Plus className="h-3.5 w-3.5" /> Pay
                            </button>
                          </div>
                        </div>
                      ))}

                    {parties.filter(p => p.type === "supplier" && p.balance > 0 && (
                      p.name.toLowerCase().includes(duesSearchQuery.toLowerCase()) ||
                      p.phone.includes(duesSearchQuery)
                    )).length === 0 && (
                      <div className="py-12 text-center text-slate-400 text-sm font-medium">
                        No outstanding supplier payables found.
                      </div>
                    )}
                  </div>
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

              {/* Payment Mode Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Payment Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setModalPayType("cash")}
                    className={`py-2 px-3 text-sm font-semibold rounded-lg border transition cursor-pointer ${
                      modalPayType === "cash"
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalPayType("bank")}
                    className={`py-2 px-3 text-sm font-semibold rounded-lg border transition cursor-pointer ${
                      modalPayType === "bank"
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    Bank
                  </button>
                </div>
              </div>

              {/* Dynamic Bank Fields */}
              {modalPayType === "bank" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-150 animate-fadeIn">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Transfer Type</label>
                    <select
                      value={modalBankType}
                      onChange={(e) => setModalBankType(e.target.value as any)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-white text-sm focus:outline-blue-500"
                    >
                      <option value="Bank Check">Bank Check</option>
                      <option value="Fund Transfer">Fund Transfer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Bank Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. DBBL, EBL, City Bank"
                      value={modalBankName}
                      onChange={(e) => setModalBankName(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-white text-sm focus:outline-blue-500"
                    />
                  </div>
                </div>
              )}

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

      {/* EDIT TRANSACTION MODAL */}
      {showEditModal && editingTransaction && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 overflow-hidden shadow-2xl animate-scaleIn">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <div>
                <h4 className="font-display font-bold text-lg">Edit Transaction</h4>
                <p className="text-xs text-slate-400">
                  Modifying entry for <span className="text-blue-300 font-semibold">{editingTransaction.party_name}</span>
                </p>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingTransaction(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Transaction Date</label>
                <input
                  type="date"
                  required
                  value={editForm.date}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 text-sm focus:bg-white focus:outline-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Particulars (Description)</label>
                <input
                  type="text"
                  required
                  value={editForm.particulars}
                  onChange={(e) => setEditForm({ ...editForm, particulars: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 text-sm focus:bg-white focus:outline-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Debit Amount (৳)</label>
                  <input
                    type="number"
                    step="any"
                    value={editForm.debit}
                    onChange={(e) => setEditForm({ ...editForm, debit: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 text-sm focus:bg-white focus:outline-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Credit Amount (৳)</label>
                  <input
                    type="number"
                    step="any"
                    value={editForm.credit}
                    onChange={(e) => setEditForm({ ...editForm, credit: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 text-sm focus:bg-white focus:outline-blue-500 font-mono"
                  />
                </div>
              </div>

              {(editingTransaction.entry_type === "goods" || editingTransaction.entry_type === "return" || editForm.quantity || editForm.rate) && (
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Quantity</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="Optional"
                      value={editForm.quantity}
                      onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-white text-sm focus:outline-blue-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Rate (৳)</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="Optional"
                      value={editForm.rate}
                      onChange={(e) => setEditForm({ ...editForm, rate: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-white text-sm focus:outline-blue-500 font-mono"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Category / Entry Type</label>
                <select
                  value={editForm.entry_type}
                  onChange={(e) => setEditForm({ ...editForm, entry_type: e.target.value as any })}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 text-sm focus:bg-white focus:outline-blue-500"
                >
                  <option value="goods">Yarn Cargo / Goods</option>
                  <option value="payment">Cash / Bank Payment</option>
                  <option value="car_rent">Transport Rent</option>
                  <option value="labour">Labour / Handling</option>
                  <option value="return">Returned Yarn Goods</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingTransaction(null);
                  }}
                  className="px-4 py-2 text-slate-500 hover:text-slate-800 text-sm font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2 rounded-lg text-sm transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
