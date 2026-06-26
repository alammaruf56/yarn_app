export interface Party {
  id: string;
  name: string;
  type: "supplier" | "customer";
  phone: string;
  address: string;
  yarn_types: string;
  balance: number;
}

export interface Yarn {
  id: string;
  name: string;
  count: string;
  blend: string;
  stock: number;
  unit: "KG" | "LBS" | "BAG";
}

export interface Transaction {
  id: string;
  invoice_id: string;
  date: string;
  party_id: string;
  party_name: string;
  party_type: "supplier" | "customer";
  particulars: string;
  debit: number;
  credit: number;
  balance_after?: number;
  yarn_id?: string;
  quantity?: number;
  unit?: "KG" | "LBS" | "BAG";
  rate?: number;
  entry_type: "goods" | "car_rent" | "labour" | "payment" | "return";
}

export interface DashboardStats {
  totalYarnTypes: number;
  totalStockKg: number;
  totalPurchase: number;
  totalSales: number;
  totalReceivable: number;
  totalPayable: number;
}
