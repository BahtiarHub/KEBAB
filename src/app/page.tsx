"use client";

import Image from "next/image";
import {
  Activity,
  Archive,
  Calculator,
  Check,
  ChevronDown,
  DollarSign,
  Download,
  Eye,
  EyeOff,
  FileSpreadsheet,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageCheck,
  PackageMinus,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  ReceiptText,
  ShieldCheck,
  ShoppingCart,
  Store,
  Truck,
  Utensils
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

type View =
  | "Dashboard"
  | "Penjualan"
  | "Belanja"
  | "Distribusi"
  | "Biaya Lain lain"
  | "Kupat Tahu Belanja"
  | "Kupat Tahu Penjualan"
  | "Kupat Tahu Report Belanja"
  | "Kupat Tahu Report Penjualan"
  | "Report"
  | "Semua Penjualan"
  | "Neraca Keuangan"
  | "Opname Stok"
  | "Parameter"
  | "Maintenance User"
  | "Monitoring Stok";

type ReportType =
  | "Penjualan"
  | "Belanja"
  | "Distribusi"
  | "Biaya Lain Lain"
  | "Opname Stok";
type LocationKey = "gudang" | "wadas" | "ciherang" | "bubulak";
type KioskKey = Exclude<LocationKey, "gudang">;
type NumberMap = Record<string, number>;
type UserRole = "Admin" | "Operator";
type TransactionType =
  | "Penjualan"
  | "Belanja"
  | "Distribusi"
  | "Biaya Lain Lain";
type AppTransactionType =
  | TransactionType
  | "Kupat Tahu Belanja"
  | "Kupat Tahu Penjualan";

type BackendBootstrap = {
  databaseSource: string;
  dailyPerformance: DailyPerformanceRow[];
  materials: Material[];
  monthlyParameters: Array<{
    amount: number;
    key: string;
    name: string;
    note: string | null;
    type: "cost" | "income";
  }>;
  reports: TransactionReportRow[];
  stockOpnames: StockOpnameReportRow[];
  users: Array<{
    email: string;
    id: string;
    name: string;
    role: UserRole;
  }>;
};

type DailyPerformanceRow = {
  date: string;
  kiosk: string;
  laba: number;
  omset: number;
};

type TransactionReportRow = {
  date: string;
  details: Array<{
    activity: string;
    item: string;
    price: number;
    qty: number;
  }>;
  location: string;
  note: string;
  number: string;
  total: number;
  type: AppTransactionType;
};

type StockOpnameReportRow = {
  date: string;
  difference: number;
  location: string;
  material: string;
  number: string;
  officer: string;
  physicalStock: number;
  systemStock: number;
};

type Material = {
  code: string;
  name: string;
  buy: number;
  sell: number | null;
  stock: Record<LocationKey, number>;
  min: Record<LocationKey, number | null>;
};

const locations: Array<{
  key: LocationKey;
  name: string;
  type: "Gudang" | "Kios";
  address: string;
}> = [
  {
    key: "gudang",
    name: "Gudang Utama",
    type: "Gudang",
    address: "Tempat pembelian dan penyimpanan awal"
  },
  {
    key: "wadas",
    name: "Kios Wadas",
    type: "Kios",
    address: "Bunderan Wadas"
  },
  {
    key: "ciherang",
    name: "Kios Ciherang",
    type: "Kios",
    address: "Jalan Ciherang"
  },
  {
    key: "bubulak",
    name: "Kios Bubulak",
    type: "Kios",
    address: "Dusun Bubulak"
  }
];

const kiosks = locations.filter(
  (location): location is (typeof locations)[number] & { key: KioskKey } =>
    location.type === "Kios"
);

const materials: Material[] = [
  {
    code: "BB-001",
    name: "TORTILLA BESAR",
    buy: 1450,
    sell: 15000,
    stock: { gudang: 128, wadas: 48, ciherang: 8, bubulak: 15 },
    min: { gudang: 80, wadas: 60, ciherang: 10, bubulak: 10 }
  },
  {
    code: "BB-002",
    name: "TORTILLA SEDANG",
    buy: 1350,
    sell: 12000,
    stock: { gudang: 72, wadas: 44, ciherang: 14, bubulak: 9 },
    min: { gudang: 60, wadas: 40, ciherang: 10, bubulak: 10 }
  },
  {
    code: "BB-003",
    name: "ROTI BURGER",
    buy: 1750,
    sell: 10000,
    stock: { gudang: 36, wadas: 12, ciherang: 5, bubulak: 0 },
    min: { gudang: 25, wadas: 15, ciherang: 5, bubulak: 5 }
  },
  {
    code: "BB-004",
    name: "MOZZARELLA",
    buy: 4250,
    sell: 5000,
    stock: { gudang: 14, wadas: 7, ciherang: 2, bubulak: 3 },
    min: { gudang: 12, wadas: 8, ciherang: 2, bubulak: 2 }
  },
  {
    code: "BB-005",
    name: "CHICKEN BULAT",
    buy: 2500,
    sell: 5000,
    stock: { gudang: 31, wadas: 18, ciherang: 4, bubulak: 7 },
    min: { gudang: 25, wadas: 15, ciherang: 5, bubulak: 5 }
  },
  {
    code: "BB-006",
    name: "TELOR",
    buy: 2500,
    sell: 4000,
    stock: { gudang: 18, wadas: 9, ciherang: 3, bubulak: 2 },
    min: { gudang: 14, wadas: 10, ciherang: 2, bubulak: 2 }
  },
  {
    code: "BB-007",
    name: "KEJU",
    buy: 1500,
    sell: 3000,
    stock: { gudang: 16, wadas: 6, ciherang: 5, bubulak: 4 },
    min: { gudang: 15, wadas: 5, ciherang: 5, bubulak: 5 }
  },
  {
    code: "BB-008",
    name: "SOSIS",
    buy: 1500,
    sell: 3000,
    stock: { gudang: 42, wadas: 21, ciherang: 4, bubulak: 8 },
    min: { gudang: 30, wadas: 20, ciherang: 5, bubulak: 5 }
  },
  {
    code: "BB-009",
    name: "PATTIES BURGER",
    buy: 3800,
    sell: null,
    stock: { gudang: 28, wadas: 12, ciherang: 5, bubulak: 6 },
    min: { gudang: 20, wadas: 10, ciherang: 5, bubulak: 5 }
  },
  {
    code: "BB-010",
    name: "LETTUCE",
    buy: 13000,
    sell: null,
    stock: { gudang: 16, wadas: 9, ciherang: 2, bubulak: 3 },
    min: { gudang: 14, wadas: 10, ciherang: 2, bubulak: 2 }
  },
  {
    code: "BB-011",
    name: "MAYONESE",
    buy: 25000,
    sell: null,
    stock: { gudang: 7, wadas: 3, ciherang: 1, bubulak: 1 },
    min: { gudang: 5, wadas: 3, ciherang: 1, bubulak: 1 }
  },
  {
    code: "BB-012",
    name: "SAOS CABE",
    buy: 16000,
    sell: null,
    stock: { gudang: 6, wadas: 2, ciherang: 1, bubulak: 1 },
    min: { gudang: 4, wadas: 2, ciherang: 1, bubulak: 1 }
  },
  {
    code: "BB-013",
    name: "SAOS TOMAT",
    buy: 16000,
    sell: null,
    stock: { gudang: 6, wadas: 2, ciherang: 1, bubulak: 1 },
    min: { gudang: 4, wadas: 2, ciherang: 1, bubulak: 1 }
  },
  {
    code: "BB-014",
    name: "PLASTIK KEBAB",
    buy: 5000,
    sell: null,
    stock: { gudang: 5, wadas: 1, ciherang: 1, bubulak: 1 },
    min: { gudang: 3, wadas: 1, ciherang: 1, bubulak: 1 }
  },
  {
    code: "BB-015",
    name: "PLASTIK BURGER",
    buy: 10000,
    sell: null,
    stock: { gudang: 5, wadas: 1, ciherang: 1, bubulak: 1 },
    min: { gudang: 3, wadas: 1, ciherang: 1, bubulak: 1 }
  },
  {
    code: "BB-016",
    name: "CUTTER",
    buy: 10000,
    sell: null,
    stock: { gudang: 4, wadas: 1, ciherang: 1, bubulak: 1 },
    min: { gudang: 3, wadas: 1, ciherang: 1, bubulak: 1 }
  },
  {
    code: "BB-017",
    name: "TISSUE",
    buy: 7500,
    sell: null,
    stock: { gudang: 4, wadas: 1, ciherang: 1, bubulak: 1 },
    min: { gudang: 3, wadas: 1, ciherang: 1, bubulak: 1 }
  },
  {
    code: "BB-018",
    name: "MINYAK SAYUR",
    buy: 34000,
    sell: null,
    stock: { gudang: 4, wadas: 1, ciherang: 1, bubulak: 1 },
    min: { gudang: 3, wadas: 1, ciherang: 1, bubulak: 1 }
  },
  {
    code: "BB-019",
    name: "GAS",
    buy: 20000,
    sell: null,
    stock: { gudang: 6, wadas: 3, ciherang: 1, bubulak: 1 },
    min: { gudang: 5, wadas: 3, ciherang: 1, bubulak: 1 }
  },
  {
    code: "BB-020",
    name: "DAGING KEBAB",
    buy: 140000,
    sell: null,
    stock: { gudang: 7, wadas: 3, ciherang: 1, bubulak: 1 },
    min: { gudang: 5, wadas: 3, ciherang: 1, bubulak: 1 }
  },
  {
    code: "BB-021",
    name: "PACK KEBAB",
    buy: 660,
    sell: null,
    stock: { gudang: 210, wadas: 88, ciherang: 18, bubulak: 27 },
    min: { gudang: 140, wadas: 100, ciherang: 20, bubulak: 20 }
  },
  {
    code: "BB-022",
    name: "PACK BURGER",
    buy: 540,
    sell: null,
    stock: { gudang: 34, wadas: 13, ciherang: 5, bubulak: 4 },
    min: { gudang: 25, wadas: 15, ciherang: 5, bubulak: 5 }
  },
  {
    code: "BB-023",
    name: "PLATIK BESAR",
    buy: 10000,
    sell: null,
    stock: { gudang: 4, wadas: 1, ciherang: 1, bubulak: 1 },
    min: { gudang: 3, wadas: 1, ciherang: 1, bubulak: 1 }
  },
  {
    code: "BB-024",
    name: "KERTAS KEBAB",
    buy: 57000,
    sell: null,
    stock: { gudang: 3, wadas: 1, ciherang: 1, bubulak: 1 },
    min: { gudang: null, wadas: null, ciherang: null, bubulak: null }
  },
  {
    code: "BB-025",
    name: "MENTEGA",
    buy: 250000,
    sell: null,
    stock: { gudang: 2, wadas: 1, ciherang: 0, bubulak: 0 },
    min: { gudang: null, wadas: null, ciherang: null, bubulak: null }
  },
  {
    code: "BB-026",
    name: "SARUNG TANGAN",
    buy: 7000,
    sell: null,
    stock: { gudang: 4, wadas: 1, ciherang: 1, bubulak: 1 },
    min: { gudang: null, wadas: null, ciherang: null, bubulak: null }
  }
];

const monthlyFinance = {
  omset: 4625000,
  modal: 1648000,
  gaji: 540000,
  grabGofood: 310000,
  biayaLain: 180000
};

const monthlyCostParameters = [
  { key: "sewa_wadas", name: "SEWA KIOS WADAS", amount: 600000 },
  { key: "sewa_bubulak", name: "SEWA KIOS BUBULAK", amount: 550000 },
  { key: "kontrakan_mj", name: "KONTRAKAN MJ", amount: 1500000 },
  { key: "sewa_guro", name: "SEWA KIOS GURO", amount: 600000 },
  { key: "listrik_mj", name: "LISTRIK KONTRAKAN MJ", amount: 250000 },
  { key: "air_mj", name: "AIR KONTRAKAN MJ", amount: 58000 },
  { key: "iuran_mj", name: "IURAN BULANAN MJ", amount: 100000 },
  { key: "beras", name: "BERAS", amount: 200000 },
  { key: "pajak", name: "PAJAK", amount: 250000 },
  {
    key: "biaya_lain_lain",
    name: "BIAYA LAIN LAIN",
    amount: monthlyFinance.biayaLain,
    note: "Total kumulatif biaya lain lain dalam sebulan"
  }
];

const additionalIncomeParameters = [
  {
    key: "brilink",
    name: "PENDAPATAN USAHA LAIN (BRILINK)",
    amount: 1000000,
    note: "Diinput manual sebagai penambah laba bersih"
  }
];

const dailyKioskPerformance = [
  { date: "22 Jun", kiosk: "Kios Wadas", omset: 545000, laba: 238000 },
  { date: "22 Jun", kiosk: "Kios Ciherang", omset: 318000, laba: 126000 },
  { date: "22 Jun", kiosk: "Kios Bubulak", omset: 244000, laba: 96000 },
  { date: "23 Jun", kiosk: "Kios Wadas", omset: 590000, laba: 261000 },
  { date: "23 Jun", kiosk: "Kios Ciherang", omset: 336000, laba: 141000 },
  { date: "23 Jun", kiosk: "Kios Bubulak", omset: 258000, laba: 108000 },
  { date: "24 Jun", kiosk: "Kios Wadas", omset: 612000, laba: 278000 },
  { date: "24 Jun", kiosk: "Kios Ciherang", omset: 352000, laba: 149000 },
  { date: "24 Jun", kiosk: "Kios Bubulak", omset: 276000, laba: 114000 },
  { date: "25 Jun", kiosk: "Kios Wadas", omset: 575000, laba: 252000 },
  { date: "25 Jun", kiosk: "Kios Ciherang", omset: 341000, laba: 136000 },
  { date: "25 Jun", kiosk: "Kios Bubulak", omset: 263000, laba: 104000 },
  { date: "26 Jun", kiosk: "Kios Wadas", omset: 628000, laba: 286000 },
  { date: "26 Jun", kiosk: "Kios Ciherang", omset: 375000, laba: 158000 },
  { date: "26 Jun", kiosk: "Kios Bubulak", omset: 298000, laba: 122000 },
  { date: "27 Jun", kiosk: "Kios Wadas", omset: 665000, laba: 241000 },
  { date: "27 Jun", kiosk: "Kios Ciherang", omset: 364000, laba: 69000 },
  { date: "27 Jun", kiosk: "Kios Bubulak", omset: 298000, laba: 60000 },
  { date: "28 Jun", kiosk: "Kios Wadas", omset: 720000, laba: 274000 },
  { date: "28 Jun", kiosk: "Kios Ciherang", omset: 438000, laba: 118000 },
  { date: "28 Jun", kiosk: "Kios Bubulak", omset: 315000, laba: 61000 }
];

type DailySalesReportRow = {
  date: string;
  location: string;
  orderCount: number;
  sales: number;
  modal: number;
  salary: number;
  grabGofood: number;
  qris: number;
  otherCost: number;
};

const dailySalesReports: DailySalesReportRow[] = [
  {
    date: "28 Jun 2026",
    location: "Kios Wadas",
    orderCount: 27,
    sales: 720000,
    modal: 236000,
    salary: 180000,
    grabGofood: 95000,
    qris: 0,
    otherCost: 30000
  },
  {
    date: "28 Jun 2026",
    location: "Kios Ciherang",
    orderCount: 18,
    sales: 438000,
    modal: 152000,
    salary: 150000,
    grabGofood: 72000,
    qris: 0,
    otherCost: 18000
  },
  {
    date: "28 Jun 2026",
    location: "Kios Bubulak",
    orderCount: 14,
    sales: 315000,
    modal: 119000,
    salary: 120000,
    grabGofood: 42000,
    qris: 0,
    otherCost: 15000
  },
  {
    date: "27 Jun 2026",
    location: "Kios Wadas",
    orderCount: 24,
    sales: 665000,
    modal: 218000,
    salary: 180000,
    grabGofood: 88000,
    qris: 0,
    otherCost: 26000
  },
  {
    date: "27 Jun 2026",
    location: "Kios Ciherang",
    orderCount: 15,
    sales: 364000,
    modal: 133000,
    salary: 150000,
    grabGofood: 60000,
    qris: 0,
    otherCost: 12000
  },
  {
    date: "27 Jun 2026",
    location: "Kios Bubulak",
    orderCount: 13,
    sales: 298000,
    modal: 107000,
    salary: 120000,
    grabGofood: 39000,
    qris: 0,
    otherCost: 11000
  }
];

const transactionReports: Partial<Record<
  AppTransactionType,
  Array<{
    date: string;
    number: string;
    location: string;
    note: string;
    total: number;
    details: Array<{ item: string; qty: number; price: number; activity: string }>;
  }>
>> = {
  Belanja: [
    {
      date: "28 Jun",
      number: "BLJ-001",
      location: "Gudang Utama",
      note: "Belanja TORTILLA BESAR dan Roti Burger",
      total: 357500,
      details: [
        { item: "TORTILLA BESAR", qty: 100, price: 1450, activity: "Stok gudang bertambah" },
        { item: "ROTI BURGER", qty: 100, price: 1750, activity: "Stok gudang bertambah" },
        { item: "Ongkir", qty: 1, price: 37500, activity: "Tercatat sebagai biaya belanja" }
      ]
    },
    {
      date: "27 Jun",
      number: "BLJ-002",
      location: "Gudang Utama",
      note: "Belanja Daging Kebab",
      total: 280000,
      details: [
        { item: "DAGING KEBAB", qty: 2, price: 140000, activity: "Stok gudang bertambah" }
      ]
    }
  ],
  Distribusi: [
    {
      date: "28 Jun",
      number: "DST-001",
      location: "Kios Wadas",
      note: "Distribusi bahan dari Gudang Utama",
      total: 0,
      details: [
        { item: "TORTILLA BESAR", qty: 40, price: 0, activity: "Gudang berkurang, kios bertambah" },
        { item: "PACK KEBAB", qty: 40, price: 0, activity: "Gudang berkurang, kios bertambah" }
      ]
    },
    {
      date: "27 Jun",
      number: "DST-002",
      location: "Kios Ciherang",
      note: "Distribusi roti burger dan pack",
      total: 0,
      details: [
        { item: "ROTI BURGER", qty: 20, price: 0, activity: "Gudang berkurang, kios bertambah" },
        { item: "PACK BURGER", qty: 20, price: 0, activity: "Gudang berkurang, kios bertambah" }
      ]
    }
  ],
  "Biaya Lain Lain": [
    {
      date: "28 Jun",
      number: "BYA-001",
      location: "Umum",
      note: "Bensin operasional",
      total: 30000,
      details: [
        { item: "Bensin", qty: 1, price: 30000, activity: "Pengurang laba bulanan" }
      ]
    },
    {
      date: "27 Jun",
      number: "BYA-002",
      location: "Gudang Utama",
      note: "Ongkos kirim belanja",
      total: 15000,
      details: [
        { item: "Ongkos Kirim", qty: 1, price: 15000, activity: "Pengurang laba bulanan" }
      ]
    }
  ]
};

const stockOpnameReports = [
  {
    date: "28 Jun 2026",
    number: "OPN-001",
    location: "Gudang Utama",
    material: "TORTILLA BESAR",
    systemStock: 128,
    physicalStock: 126,
    difference: -2,
    officer: "Admin"
  },
  {
    date: "28 Jun 2026",
    number: "OPN-002",
    location: "Kios Wadas",
    material: "ROTI BURGER",
    systemStock: 12,
    physicalStock: 12,
    difference: 0,
    officer: "Operator"
  },
  {
    date: "27 Jun 2026",
    number: "OPN-003",
    location: "Kios Ciherang",
    material: "PACK KEBAB",
    systemStock: 18,
    physicalStock: 17,
    difference: -1,
    officer: "Operator"
  }
];

const activityLog = [
  {
    time: "09:20",
    user: "Operator Wadas",
    module: "Penjualan",
    action: "Input 18 tortilla besar, PACK KEBAB terhitung -18"
  },
  {
    time: "08:55",
    user: "Admin",
    module: "Distribusi",
    action: "Kirim 40 PACK KEBAB ke Kios Wadas"
  },
  {
    time: "08:10",
    user: "Operator Gudang",
    module: "Belanja",
    action: "Belanja roti burger 50 pcs, ongkir Rp 15.000"
  }
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0
  }).format(value);
}

function getTodayInputDate() {
  return new Date().toLocaleDateString("en-CA");
}

function TransactionDateGate({
  date,
  onConfirm,
  title
}: {
  date: string;
  onConfirm: (date: string) => void;
  title: string;
}) {
  const [draftDate, setDraftDate] = useState(getTodayInputDate);

  if (date) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-amber-950/40 px-4 backdrop-blur-sm">
      <Card className="w-full max-w-md border-amber-300 bg-white shadow-2xl">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            Pilih tanggal pengisian terlebih dahulu sebelum melakukan transaksi.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Tanggal Transaksi">
            <Input
              autoFocus
              type="date"
              value={draftDate}
              onChange={(event) => setDraftDate(event.target.value)}
            />
          </Field>
          <Button
            className="w-full"
            disabled={!draftDate}
            onClick={() => onConfirm(draftDate)}
          >
            <Check />
            Gunakan Tanggal
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

const monthOptions = [
  "Januari 2026",
  "Februari 2026",
  "Maret 2026",
  "April 2026",
  "Mei 2026",
  "Juni 2026",
  "Juli 2026",
  "Agustus 2026",
  "September 2026",
  "Oktober 2026",
  "November 2026",
  "Desember 2026"
];

const shortMonthMap: Record<string, string> = {
  Agu: "Agustus",
  Apr: "April",
  Des: "Desember",
  Feb: "Februari",
  Jan: "Januari",
  Jul: "Juli",
  Jun: "Juni",
  Mar: "Maret",
  Mei: "Mei",
  Nov: "November",
  Okt: "Oktober",
  Sep: "September"
};

const monthOrder = monthOptions.map((month) => month.split(" ")[0]);

function compareMonthLabels(first: string, second: string) {
  const [firstMonth, firstYear] = first.split(" ");
  const [secondMonth, secondYear] = second.split(" ");
  const yearDiff = Number(firstYear) - Number(secondYear);

  if (yearDiff !== 0) {
    return yearDiff;
  }

  return monthOrder.indexOf(firstMonth) - monthOrder.indexOf(secondMonth);
}

function getCurrentMonthLabel() {
  const [month, year] = new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric"
  }).format(new Date()).split(" ");

  return `${month} ${year}`;
}

function getMonthLabelFromDate(date: string) {
  const parts = date.split(" ").filter(Boolean);
  const shortMonth = parts.find((part) => shortMonthMap[part]);
  const year = parts.find((part) => /^\d{4}$/.test(part)) ?? "2026";

  if (!shortMonth) {
    return monthOptions[5];
  }

  return `${shortMonthMap[shortMonth]} ${year}`;
}

function filterByMonth<T extends { date: string }>(rows: T[], selectedMonth: string) {
  return rows.filter((row) => getMonthLabelFromDate(row.date) === selectedMonth);
}

function getAvailableMonths(rows: Array<{ date: string }>) {
  const months = Array.from(
    new Set(rows.map((row) => getMonthLabelFromDate(row.date)))
  );

  return months.sort(compareMonthLabels);
}

function getDefaultReportMonth(rows: Array<{ date: string }>) {
  const availableMonths = getAvailableMonths(rows);
  return availableMonths[availableMonths.length - 1] ?? getCurrentMonthLabel();
}

function stockStatus(stock: number, minimum: number | null) {
  if (stock <= 0) {
    return { label: "Habis", variant: "danger" as const, className: "stock-empty" };
  }

  if (minimum !== null && stock <= minimum) {
    return {
      label: "Hampir Habis",
      variant: "warning" as const,
      className: "stock-low"
    };
  }

  return { label: "Aman", variant: "success" as const, className: "stock-safe" };
}

function getTotalStockValue(location: LocationKey, materialRows = materials) {
  return materialRows.reduce(
    (total, item) => total + item.stock[location] * item.buy,
    0
  );
}

function getNumberMapTotal(values: NumberMap) {
  return Object.values(values).reduce((total, value) => total + value, 0);
}

function getGrossProfit() {
  return monthlyFinance.omset - monthlyFinance.modal;
}

function getNetProfit(monthlyCostTotal: number, additionalIncomeTotal: number) {
  return (
    monthlyFinance.omset -
    monthlyFinance.modal -
    monthlyFinance.gaji -
    monthlyCostTotal +
    additionalIncomeTotal
  );
}

function toNumber(value: string) {
  return Number(value.replace(/\D/g, "")) || 0;
}

function updateNumberMap(
  setter: React.Dispatch<React.SetStateAction<NumberMap>>,
  key: string,
  value: number
) {
  setter((current) => ({ ...current, [key]: value }));
}

async function downloadExport(type: string) {
  const response = await fetch(`/api/export?type=${encodeURIComponent(type)}`, {
    cache: "no-store"
  });

  if (!response.ok) {
    return;
  }

  const payload = await response.json();
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${type.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function Home() {
  const [activeView, setActiveView] = useState<View>("Dashboard");
  const [selectedKiosk, setSelectedKiosk] = useState<KioskKey>("wadas");
  const [reportType, setReportType] = useState<ReportType>("Penjualan");
  const [currentRole, setCurrentRole] = useState<UserRole>("Admin");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [backendData, setBackendData] = useState<BackendBootstrap | null>(null);
  const [monthlyCostValues, setMonthlyCostValues] = useState<NumberMap>(() =>
    Object.fromEntries(
      monthlyCostParameters.map((item) => [item.key, item.amount])
    ) as NumberMap
  );
  const [additionalIncomeValues, setAdditionalIncomeValues] = useState<NumberMap>(() =>
    Object.fromEntries(
      additionalIncomeParameters.map((item) => [item.key, item.amount])
    ) as NumberMap
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState({
    kupatTahu: false,
    report: false,
    sales: false
  });
  const appMaterials = backendData?.materials?.length ? backendData.materials : materials;

  const criticalItems = useMemo(
    () =>
      appMaterials.flatMap((item) =>
        locations
          .map((location) => {
            const status = stockStatus(
              item.stock[location.key],
              item.min[location.key]
            );
            return {
              item,
              location,
              status,
              stock: item.stock[location.key]
            };
          })
          .filter(({ status }) => status.label !== "Aman")
      ),
    [appMaterials]
  );
  const totalMonthlyCost = getNumberMapTotal(monthlyCostValues);
  const totalAdditionalIncome = getNumberMapTotal(additionalIncomeValues);

  function setRole(role: UserRole) {
    setCurrentRole(role);
    if (role === "Operator" && activeView === "Parameter") {
      setActiveView("Dashboard");
    }
  }

  async function loadBootstrap() {
    const response = await fetch("/api/bootstrap", { cache: "no-store" });
    if (response.ok) {
      const payload = (await response.json()) as BackendBootstrap;
      setBackendData(payload);
      setMonthlyCostValues(
        Object.fromEntries(
          payload.monthlyParameters
            .filter((item) => item.type === "cost")
            .map((item) => [item.key, item.amount])
        ) as NumberMap
      );
      setAdditionalIncomeValues(
        Object.fromEntries(
          payload.monthlyParameters
            .filter((item) => item.type === "income")
            .map((item) => [item.key, item.amount])
        ) as NumberMap
      );
    }
  }

  async function handleLogin(username: string, role: UserRole, password: string) {
    const normalizedUsername = username.trim().toLowerCase();

    if (!normalizedUsername) {
      throw new Error("Username wajib diisi.");
    }

    const fallbackEmail = normalizedUsername.includes("@")
      ? normalizedUsername
      : `${normalizedUsername.replace(/[^a-z0-9]+/g, ".").replace(/^\.+|\.+$/g, "")}@yudhistira.local`;
    let loginEmail = fallbackEmail;

    try {
      const usersResponse = await fetch("/api/users", { cache: "no-store" });

      if (usersResponse.ok) {
        const usersPayload = (await usersResponse.json()) as {
          users?: Array<{ email: string; name: string; role: UserRole }>;
        };
        const targetUser = usersPayload.users?.find(
          (user) =>
            user.role === role &&
            (user.name.trim().toLowerCase() === normalizedUsername ||
              user.email.trim().toLowerCase() === normalizedUsername)
        );

        loginEmail = targetUser?.email ?? fallbackEmail;
      }
    } catch {
      loginEmail = fallbackEmail;
    }

    const response = await fetch("/api/auth/sign-in/email", {
      body: JSON.stringify({
        email: loginEmail,
        password,
        rememberMe: true
      }),
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST"
    });

    if (!response.ok) {
      throw new Error("Login gagal. Periksa role dan password.");
    }

    const result = (await response.json()) as { user?: { role?: UserRole } };
    if (result.user?.role && result.user.role !== role) {
      await fetch("/api/auth/sign-out", { method: "POST" }).catch(() => undefined);
      throw new Error("Role user tidak sesuai.");
    }

    setRole(result.user?.role ?? role);
    setIsAuthenticated(true);
    setOpenGroups({ kupatTahu: false, report: false, sales: false });
    setActiveView("Dashboard");
    await loadBootstrap();
  }

  async function handleLogout() {
    await fetch("/api/auth/sign-out", { method: "POST" }).catch(() => undefined);
    setIsAuthenticated(false);
    setBackendData(null);
    setSidebarOpen(false);
    setOpenGroups({ kupatTahu: false, report: false, sales: false });
    setActiveView("Dashboard");
  }

  const title =
    activeView === "Penjualan"
      ? `Penjualan ${locations.find((item) => item.key === selectedKiosk)?.name}`
      : activeView === "Kupat Tahu Belanja"
        ? "Belanja Kupat Tahu"
        : activeView === "Kupat Tahu Penjualan"
          ? "Penjualan Kupat Tahu"
          : activeView === "Kupat Tahu Report Belanja"
            ? "Report Belanja Kupat Tahu"
            : activeView === "Kupat Tahu Report Penjualan"
              ? "Report Penjualan Kupat Tahu"
              : activeView === "Semua Penjualan"
                ? "Report Total Penjualan"
      : activeView === "Report"
        ? `Report ${reportType}`
        : activeView;

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[linear-gradient(135deg,#fffbea_0%,#facc15_52%,#b45309_100%)] px-4 py-8 md:px-6">
        <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-6xl items-center">
          <div className="grid w-full items-center gap-8 lg:grid-cols-[1.08fr_0.92fr]">
            <section className="text-amber-950">
              <div className="mb-6 flex items-center gap-3">
                <Image
                  src="/brand-logo.jpg"
                  alt="Yudhistira F&B"
                  width={64}
                  height={64}
                  className="rounded-lg border border-white/70 bg-white object-cover shadow-md"
                />
                <div>
                  <p className="text-2xl font-black tracking-normal">Yudhistira F&B</p>
                  <p className="text-sm font-medium text-amber-900">
                    Sistem stok, penjualan, dan keuangan kebab
                  </p>
                </div>
              </div>
              <h1 className="max-w-xl text-4xl font-black tracking-normal md:text-5xl">
                Masuk ke dashboard operasional harian.
              </h1>
              <p className="mt-4 max-w-lg text-base font-medium leading-7 text-amber-950/80">
                Pantau stok, transaksi kios, belanja bahan baku, distribusi, dan laporan
                keuangan dalam satu aplikasi.
              </p>
              <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
                {[
                  ["26", "Bahan baku"],
                  ["3", "Kios aktif"],
                  ["Realtime", "Stok & report"]
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-lg border border-white/70 bg-white/75 p-4 shadow-sm backdrop-blur"
                  >
                    <p className="text-2xl font-black">{value}</p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-normal text-amber-800">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </section>
            <LoginUserView currentRole={currentRole} onLogin={handleLogin} />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-amber-50/70">
      <header className="sticky top-0 z-40 border-b border-amber-300 bg-amber-300/95 px-4 py-3 text-amber-950 shadow-sm backdrop-blur md:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              aria-label="Buka tutup sidebar"
              size="icon"
              variant="secondary"
              onClick={() => setSidebarOpen((value) => !value)}
            >
              <Menu />
            </Button>
            <Image
              src="/brand-logo.jpg"
              alt="Yudhistira F&B"
              width={44}
              height={44}
              className="rounded-md border bg-white object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">Yudhistira F&B</p>
              <p className="truncate text-xs text-muted-foreground">
                Manajemen stok dan keuangan kebab
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {backendData?.databaseSource ? (
              <Badge className="hidden md:inline-flex" variant="success">
                {backendData.databaseSource}
              </Badge>
            ) : null}
            <Badge className="hidden sm:inline-flex" variant="warning">
              {currentRole}
            </Badge>
            <Button
              className="bg-amber-950 text-amber-50 hover:bg-amber-900"
              onClick={handleLogout}
            >
              <LogOut />
              Keluar
            </Button>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-73px)]">
        {sidebarOpen ? (
          <button
            aria-label="Tutup sidebar"
            className="fixed inset-0 z-40 bg-amber-950/30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}

        <aside
          className={`fixed inset-y-0 left-0 z-50 shrink-0 border-r border-amber-200 bg-white/95 shadow-xl backdrop-blur transition-all duration-200 lg:sticky lg:top-[73px] lg:z-20 lg:h-[calc(100vh-73px)] lg:shadow-none ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          } ${sidebarCollapsed ? "w-[88px]" : "w-[292px]"}`}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-amber-200 bg-amber-50 p-3">
              {!sidebarCollapsed ? (
                <div>
                  <p className="text-sm font-bold">Menu Operasional</p>
                  <p className="text-xs text-muted-foreground">Stok dan keuangan</p>
                </div>
              ) : null}
              <Button
                aria-label="Ciutkan sidebar"
                size="icon"
                variant="ghost"
                onClick={() => setSidebarCollapsed((value) => !value)}
              >
                {sidebarCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
              </Button>
            </div>
            <nav className="space-y-2 overflow-auto p-4">
              <NavButton
                active={activeView === "Dashboard"}
                collapsed={sidebarCollapsed}
                icon={LayoutDashboard}
                label="Dashboard"
                onClick={() => setActiveView("Dashboard")}
              />

              <NavGroup
                collapsed={sidebarCollapsed}
                icon={Store}
                isOpen={openGroups.sales}
                label="Penjualan Kebab"
                onToggle={() =>
                  setOpenGroups((current) => ({
                    ...current,
                    sales: !current.sales
                  }))
                }
              >
                {kiosks.map((kiosk) => (
                  <SubNavButton
                    key={kiosk.key}
                    active={activeView === "Penjualan" && selectedKiosk === kiosk.key}
                    label={kiosk.name}
                    onClick={() => {
                      setSelectedKiosk(kiosk.key);
                      setActiveView("Penjualan");
                    }}
                  />
                ))}
              </NavGroup>

              <NavGroup
                collapsed={sidebarCollapsed}
                icon={Utensils}
                isOpen={openGroups.kupatTahu}
                label="Kupat Tahu"
                onToggle={() =>
                  setOpenGroups((current) => ({
                    ...current,
                    kupatTahu: !current.kupatTahu
                  }))
                }
              >
                {[
                  ["Kupat Tahu Belanja", "Belanja"],
                  ["Kupat Tahu Penjualan", "Penjualan"],
                  ["Kupat Tahu Report Belanja", "Report Belanja"],
                  ["Kupat Tahu Report Penjualan", "Report Penjualan"]
                ].map(([view, label]) => (
                  <SubNavButton
                    key={view}
                    active={activeView === view}
                    label={label}
                    onClick={() => setActiveView(view as View)}
                  />
                ))}
              </NavGroup>

              <NavButton
                active={activeView === "Belanja"}
                collapsed={sidebarCollapsed}
                icon={ShoppingCart}
                label="Belanja"
                onClick={() => setActiveView("Belanja")}
              />
              <NavButton
                active={activeView === "Distribusi"}
                collapsed={sidebarCollapsed}
                icon={Truck}
                label="Distribusi"
                onClick={() => setActiveView("Distribusi")}
              />
              <NavButton
                active={activeView === "Biaya Lain lain"}
                collapsed={sidebarCollapsed}
                icon={ReceiptText}
                label="Biaya Lain lain"
                onClick={() => setActiveView("Biaya Lain lain")}
              />
              <NavButton
                active={activeView === "Opname Stok"}
                collapsed={sidebarCollapsed}
                icon={PackageMinus}
                label="Opname Stok"
                onClick={() => setActiveView("Opname Stok")}
              />

              <NavGroup
                collapsed={sidebarCollapsed}
                icon={FileSpreadsheet}
                isOpen={openGroups.report}
                label="Report"
                onToggle={() =>
                  setOpenGroups((current) => ({
                    ...current,
                    report: !current.report
                  }))
                }
              >
                {(
                  [
                    "Penjualan",
                    "Belanja",
                    "Distribusi",
                    "Biaya Lain Lain",
                    "Opname Stok"
                  ] as ReportType[]
                ).map((item) => (
                  <SubNavButton
                    key={item}
                    active={activeView === "Report" && reportType === item}
                    label={item}
                    onClick={() => {
                      setReportType(item);
                      setActiveView("Report");
                    }}
                  />
                ))}
              </NavGroup>

              <NavButton
                active={activeView === "Semua Penjualan"}
                collapsed={sidebarCollapsed}
                icon={FileSpreadsheet}
                label="Report Total Penjualan"
                onClick={() => setActiveView("Semua Penjualan")}
              />

              <NavButton
                active={activeView === "Neraca Keuangan"}
                collapsed={sidebarCollapsed}
                icon={Calculator}
                label="Neraca Keuangan"
                onClick={() => setActiveView("Neraca Keuangan")}
              />
              <NavButton
                active={activeView === "Monitoring Stok"}
                collapsed={sidebarCollapsed}
                icon={PackageCheck}
                label="Monitoring Stok"
                onClick={() => setActiveView("Monitoring Stok")}
              />
              {currentRole === "Admin" ? (
                <>
                  <NavButton
                    active={activeView === "Parameter"}
                    collapsed={sidebarCollapsed}
                    icon={ShieldCheck}
                    label="Parameter"
                    onClick={() => setActiveView("Parameter")}
                  />
                  <NavButton
                    active={activeView === "Maintenance User"}
                    collapsed={sidebarCollapsed}
                    icon={ShieldCheck}
                    label="Maintenance User"
                    onClick={() => setActiveView("Maintenance User")}
                  />
                </>
              ) : null}
            </nav>

            <div className="mt-auto border-t p-4" />
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <div className="border-b border-amber-200 bg-white/80 px-4 py-4 shadow-sm backdrop-blur md:px-6">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    Senin, 29 Juni 2026
                  </p>
                  {backendData?.databaseSource ? (
                    <Badge variant="success">{backendData.databaseSource}</Badge>
                  ) : null}
                </div>
                <h1 className="mt-1 text-2xl font-bold tracking-normal md:text-3xl">
                  {title}
                </h1>
              </div>

              <div className="grid gap-2 min-[520px]:hidden sm:grid-cols-2">
                <MobileSelect
                  activeView={activeView}
                  currentRole={currentRole}
                  reportType={reportType}
                  selectedKiosk={selectedKiosk}
                  setActiveView={setActiveView}
                  setReportType={setReportType}
                  setSelectedKiosk={setSelectedKiosk}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6 p-4 md:p-6">
            {activeView === "Dashboard" ? (
              <DashboardView
                criticalItems={criticalItems}
                dailyPerformance={backendData?.dailyPerformance ?? dailyKioskPerformance}
                materials={appMaterials}
                reports={backendData?.reports}
                totalAdditionalIncome={totalAdditionalIncome}
                totalMonthlyCost={totalMonthlyCost}
              />
            ) : null}
            {activeView === "Penjualan" ? (
              <SalesView
                materials={appMaterials}
                onSaved={loadBootstrap}
                selectedKiosk={selectedKiosk}
              />
            ) : null}
            {activeView === "Belanja" ? (
              <PurchaseView materials={appMaterials} onSaved={loadBootstrap} />
            ) : null}
            {activeView === "Distribusi" ? (
              <DistributionView materials={appMaterials} onSaved={loadBootstrap} />
            ) : null}
            {activeView === "Biaya Lain lain" ? (
              <ExpenseView onSaved={loadBootstrap} />
            ) : null}
            {activeView === "Kupat Tahu Belanja" ? (
              <KupatTahuPurchaseView onSaved={loadBootstrap} />
            ) : null}
            {activeView === "Kupat Tahu Penjualan" ? (
              <KupatTahuSalesView onSaved={loadBootstrap} />
            ) : null}
            {activeView === "Kupat Tahu Report Belanja" ? (
              <SimpleReport
                icon={ShoppingCart}
                rows={backendData?.reports?.filter(
                  (report) => report.type === "Kupat Tahu Belanja"
                )}
                title="Report Belanja Kupat Tahu"
                type="Kupat Tahu Belanja"
              />
            ) : null}
            {activeView === "Kupat Tahu Report Penjualan" ? (
              <SalesReport
                mode="kupatTahu"
                reports={backendData?.reports?.filter(
                  (report) => report.type === "Kupat Tahu Penjualan"
                )}
              />
            ) : null}
            {activeView === "Opname Stok" ? (
              <StockOpnameView materials={appMaterials} onSaved={loadBootstrap} />
            ) : null}
            {activeView === "Report" ? (
              <ReportView
                reportType={reportType}
                reports={backendData?.reports}
                stockOpnames={backendData?.stockOpnames}
              />
            ) : null}
            {activeView === "Semua Penjualan" ? (
              <AllSalesDailyReport reports={backendData?.reports} />
            ) : null}
            {activeView === "Neraca Keuangan" ? (
              <FinanceView
                reports={backendData?.reports}
                totalAdditionalIncome={totalAdditionalIncome}
                totalMonthlyCost={totalMonthlyCost}
              />
            ) : null}
            {activeView === "Monitoring Stok" ? (
              <StockView materials={appMaterials} />
            ) : null}
            {activeView === "Parameter" && currentRole === "Admin" ? (
              <ParameterView
                additionalIncomeValues={additionalIncomeValues}
                monthlyCostValues={monthlyCostValues}
                onSaved={loadBootstrap}
                setAdditionalIncomeValues={setAdditionalIncomeValues}
                setMonthlyCostValues={setMonthlyCostValues}
              />
            ) : null}
            {activeView === "Maintenance User" && currentRole === "Admin" ? (
              <MaintenanceUserView
                onChanged={loadBootstrap}
                users={backendData?.users}
              />
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}

function FinancialMetricCard({
  icon: Icon,
  label,
  note,
  tone = "amber",
  value
}: {
  icon: React.ElementType;
  label: string;
  note: string;
  tone?: "amber" | "emerald" | "rose";
  value: string;
}) {
  const toneClass = {
    amber: "bg-amber-100 text-amber-900 ring-amber-200",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    rose: "bg-rose-50 text-rose-700 ring-rose-200"
  }[tone];

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-normal text-amber-800">
              {label}
            </p>
            <p className="mt-2 truncate text-2xl font-black tracking-normal text-amber-950">
              {value}
            </p>
          </div>
          <div className={`rounded-md p-2 ring-1 ${toneClass}`}>
            <Icon className="size-4" />
          </div>
        </div>
        <p className="mt-3 min-h-8 text-xs leading-4 text-muted-foreground">
          {note}
        </p>
      </CardContent>
    </Card>
  );
}

function DashboardView({
  criticalItems,
  dailyPerformance,
  materials,
  reports,
  totalAdditionalIncome,
  totalMonthlyCost
}: {
  criticalItems: Array<{
    item: Material;
    location: (typeof locations)[number];
    status: ReturnType<typeof stockStatus>;
    stock: number;
  }>;
  dailyPerformance: DailyPerformanceRow[];
  materials: Material[];
  reports?: TransactionReportRow[];
  totalAdditionalIncome: number;
  totalMonthlyCost: number;
}) {
  const [selectedChartKiosk, setSelectedChartKiosk] = useState("Kios Wadas");
  const salesReports = reports?.filter((report) => report.type === "Penjualan");
  const kupatTahuSalesReports = reports?.filter(
    (report) => report.type === "Kupat Tahu Penjualan"
  );
  const expenseReports =
    reports?.filter((report) => report.type === "Biaya Lain Lain") ?? [];
  const dashboardDailyRows =
    salesReports === undefined
      ? dailyPerformance
      : [
          ...salesReports.map((report) => {
            const modal = sumDetailsByItem(report, "Modal Penjualan");
            const salary = sumDetailsByItem(report, "Gaji Karyawan");
            const otherCost = sumDetailsByItem(report, "Lain lain");

            return {
              date: report.date,
              kiosk: report.location,
              laba: report.total - modal - salary - otherCost,
              omset: report.total
            };
          }),
          ...(kupatTahuSalesReports ?? []).map((report) => ({
            date: report.date,
            kiosk: "Kupat Tahu",
            laba: sumDetailsByItem(report, "Pendapatan Bersih Kupat Tahu"),
            omset: report.total
          }))
        ];
  const dailyLabels = Array.from(
    new Set(dashboardDailyRows.map((item) => item.date))
  );
  const chartLocations = Array.from(new Set(dashboardDailyRows.map((item) => item.kiosk)));
  const selectedDailyRows = dashboardDailyRows.filter(
    (item) => item.kiosk === selectedChartKiosk
  );
  const totalDailyRows = dailyLabels.map((date) => {
    const rows = dashboardDailyRows.filter((item) => item.date === date);

    return {
      date,
      laba: rows.reduce((sum, row) => sum + row.laba, 0),
      omset: rows.reduce((sum, row) => sum + row.omset, 0)
    };
  });
  const dashboardOmset = dashboardDailyRows.reduce((sum, row) => sum + row.omset, 0);
  const dashboardModal =
    salesReports === undefined
      ? monthlyFinance.modal
      : salesReports.reduce(
          (sum, report) => sum + sumDetailsByItem(report, "Modal Penjualan"),
          0
        ) +
        (kupatTahuSalesReports ?? []).reduce(
          (sum, report) => sum + sumDetailsByItem(report, "Modal Kupat Tahu"),
          0
        );
  const dashboardGaji =
    salesReports === undefined
      ? monthlyFinance.gaji
      : salesReports.reduce(
          (sum, report) => sum + sumDetailsByItem(report, "Gaji Karyawan"),
          0
        ) +
        (kupatTahuSalesReports ?? []).reduce(
          (sum, report) => sum + sumDetailsByItem(report, "Gaji Kupat Tahu"),
          0
        );
  const dashboardGrabGofood =
    salesReports?.reduce(
      (sum, report) => sum + sumDetailsByItem(report, "Grab/GoFood"),
      0
    ) ?? monthlyFinance.grabGofood;
  const dashboardQris =
    (salesReports?.reduce(
      (sum, report) => sum + sumDetailsByItem(report, "QRIS"),
      0
    ) ?? 0) +
    (kupatTahuSalesReports ?? []).reduce(
      (sum, report) => sum + sumDetailsByItem(report, "QRIS Kupat Tahu"),
      0
    );
  const dashboardOtherCost =
    (salesReports?.reduce(
      (sum, report) => sum + sumDetailsByItem(report, "Lain lain"),
      0
    ) ?? 0) +
    (kupatTahuSalesReports ?? []).reduce(
      (sum, report) => sum + sumDetailsByItem(report, "Lain lain Kupat Tahu"),
      0
    ) +
    expenseReports.reduce((sum, report) => sum + report.total, 0);
  const dashboardLaba =
    dashboardOmset -
    dashboardModal -
    dashboardGaji -
    dashboardOtherCost -
    totalMonthlyCost +
    totalAdditionalIncome;
  const dashboardActivities =
    reports === undefined
      ? activityLog.map((log) => ({
          activity: log.action,
          module: log.module,
          time: log.time,
          user: log.user
        }))
      : reports.slice(0, 5).map((report) => ({
          activity: report.note,
          module: report.type,
          time: report.date,
          user: report.location
        }));
  const kpis = [
    {
      title: "Omset Bulanan",
      value: formatCurrency(dashboardOmset),
      icon: Store,
      note: "Akumulasi penjualan semua kios"
    },
    {
      title: "Laba Bersih",
      value: formatCurrency(dashboardLaba),
      icon: DollarSign,
      note: "Omset dikurangi modal, gaji, biaya, plus pendapatan tambahan"
    },
    {
      title: "Modal Bahan",
      value: formatCurrency(dashboardModal),
      icon: Archive,
      note: "Modal bahan dari transaksi Turso"
    },
    {
      title: "Nilai Stok Gudang",
      value: formatCurrency(getTotalStockValue("gudang", materials)),
      icon: PackageCheck,
      note: "Berdasarkan harga beli"
    },
    {
      title: "Stok Bermasalah",
      value: `${criticalItems.length} item`,
      icon: Activity,
      note: "Hampir habis atau habis"
    }
  ];

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {kpis.map(({ title, value, icon: Icon, note }) => (
          <FinancialMetricCard
            key={title}
            icon={Icon}
            label={title}
            note={note}
            value={value}
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Omset dan Laba Harian per Kios</CardTitle>
              <CardDescription>
                Line chart periode harian untuk kios yang dipilih.
              </CardDescription>
            </div>
            <Select
              className="w-full lg:w-[180px]"
              value={selectedChartKiosk}
              onChange={(event) => setSelectedChartKiosk(event.target.value)}
            >
              {(chartLocations.length
                ? chartLocations
                : kiosks.map((kiosk) => kiosk.name)
              ).map((location) => (
                <option key={location}>{location}</option>
              ))}
            </Select>
          </CardHeader>
          <CardContent>
            <LineChart
              labels={dailyLabels}
              series={[
                {
                  color: "#ca8a04",
                  label: "Omset",
                  values: selectedDailyRows.map((item) => item.omset)
                },
                {
                  color: "#16a34a",
                  label: "Laba",
                  values: selectedDailyRows.map((item) => item.laba)
                }
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Omset dan Laba Total Harian</CardTitle>
              <CardDescription>
                Akumulasi semua kios dalam periode harian.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <LineChart
              labels={dailyLabels}
              series={[
                {
                  color: "#ca8a04",
                  label: "Total Omset",
                  values: totalDailyRows.map((item) => item.omset)
                },
                {
                  color: "#16a34a",
                  label: "Total Laba",
                  values: totalDailyRows.map((item) => item.laba)
                }
              ]}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <FinancialMetricCard
          icon={ReceiptText}
          label="Gaji"
          note="Pengurang laba operasional"
          tone="rose"
          value={formatCurrency(dashboardGaji)}
        />
        <FinancialMetricCard
          icon={Store}
          label="Grab/GoFood"
          note="Pengurang cash yang diterima owner"
          value={formatCurrency(dashboardGrabGofood)}
        />
        <FinancialMetricCard
          icon={ReceiptText}
          label="QRIS"
          note="Pengurang cash yang diterima owner"
          value={formatCurrency(dashboardQris)}
        />
        <FinancialMetricCard
          icon={Calculator}
          label="Parameter Biaya"
          note="Pengurang laba bulanan"
          tone="rose"
          value={formatCurrency(totalMonthlyCost)}
        />
        <FinancialMetricCard
          icon={DollarSign}
          label="Pendapatan Tambahan"
          note="Penambah laba bersih"
          tone="emerald"
          value={formatCurrency(totalAdditionalIncome)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Peringatan Stok</CardTitle>
          <CardDescription>
            Angka hijau aman, kuning hampir habis, merah habis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {criticalItems.slice(0, 6).map(({ item, location, status, stock }) => (
              <div
                key={`${item.code}-${location.key}`}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div>
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{location.name}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${status.className}`}>{stock}</p>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Terakhir</CardTitle>
          <CardDescription>
            Transaksi dan perubahan penting tersimpan di histori sistem.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Modul</TableHead>
                <TableHead>Aktivitas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dashboardActivities.length === 0 ? (
                <TableRow>
                  <TableCell
                    className="py-8 text-center text-sm font-medium text-muted-foreground"
                    colSpan={4}
                  >
                    Belum ada aktivitas transaksi di Turso.
                  </TableCell>
                </TableRow>
              ) : null}
              {dashboardActivities.map((log) => (
                <TableRow key={`${log.time}-${log.module}-${log.activity}`}>
                  <TableCell className="font-medium">{log.time}</TableCell>
                  <TableCell>{log.user}</TableCell>
                  <TableCell>{log.module}</TableCell>
                  <TableCell>{log.activity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

function LineChart({
  labels,
  series
}: {
  labels: string[];
  series: Array<{ color: string; label: string; values: number[] }>;
}) {
  const width = 720;
  const height = 300;
  const padding = { bottom: 34, left: 46, right: 18, top: 20 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const maxValue =
    Math.max(...series.flatMap((item) => item.values), 1) * 1.12;

  function getPoint(value: number, index: number) {
    const x =
      padding.left +
      (labels.length <= 1 ? 0 : (index / (labels.length - 1)) * chartWidth);
    const y = padding.top + (1 - value / maxValue) * chartHeight;

    return { x, y };
  }

  return (
    <div className="space-y-4">
      <div className="h-[300px] w-full overflow-hidden rounded-md bg-amber-50/60">
        <svg
          aria-label="Line chart harian"
          className="h-full w-full"
          preserveAspectRatio="none"
          viewBox={`0 0 ${width} ${height}`}
        >
          {[0, 1, 2, 3].map((line) => {
            const y = padding.top + (line / 3) * chartHeight;
            return (
              <line
                key={line}
                stroke="#f3d47a"
                strokeDasharray="5 5"
                strokeWidth="1"
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
              />
            );
          })}
          {labels.map((label, index) => {
            const point = getPoint(0, index);
            return (
              <text
                key={label}
                fill="#92400e"
                fontSize="13"
                textAnchor="middle"
                x={point.x}
                y={height - 10}
              >
                {label}
              </text>
            );
          })}
          {series.map((item) => {
            const points = item.values.map((value, index) => getPoint(value, index));
            const path = points
              .map((point, index) =>
                `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`
              )
              .join(" ");

            return (
              <g key={item.label}>
                <path
                  d={path}
                  fill="none"
                  stroke={item.color}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="4"
                />
                {points.map((point, index) => (
                  <circle
                    key={`${item.label}-${labels[index]}`}
                    cx={point.x}
                    cy={point.y}
                    fill="#fff8db"
                    r="4"
                    stroke={item.color}
                    strokeWidth="3"
                  />
                ))}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        {series.map((item) => (
          <span key={item.label} className="flex items-center gap-2">
            <span
              className="size-3 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function SalesView({
  materials,
  onSaved,
  selectedKiosk
}: {
  materials: Material[];
  onSaved: () => Promise<void>;
  selectedKiosk: KioskKey;
}) {
  const [saleQtyByKiosk, setSaleQtyByKiosk] = useState<Record<KioskKey, NumberMap>>({
    bubulak: {},
    ciherang: {},
    wadas: {}
  });
  const [salesCostsByKiosk, setSalesCostsByKiosk] = useState<
    Record<KioskKey, { grabGofood: number; otherCost: number; qris: number; salary: number }>
  >({
    bubulak: { grabGofood: 0, otherCost: 0, qris: 0, salary: 0 },
    ciherang: { grabGofood: 0, otherCost: 0, qris: 0, salary: 0 },
    wadas: { grabGofood: 0, otherCost: 0, qris: 0, salary: 0 }
  });
  const [salesDate, setSalesDate] = useState("");

  const saleQty = saleQtyByKiosk[selectedKiosk];
  const salesCosts = salesCostsByKiosk[selectedKiosk];
  const packKebab =
    (saleQty["BB-001"] ?? 0) + (saleQty["BB-002"] ?? 0);
  const packBurger = saleQty["BB-003"] ?? 0;
  const effectiveSaleQty: NumberMap = {
    ...saleQty,
    "BB-021": packKebab,
    "BB-022": packBurger
  };
  const totalSales = materials.reduce(
    (total, item) => total + (effectiveSaleQty[item.code] ?? 0) * (item.sell ?? 0),
    0
  );
  const totalSalesModal = materials.reduce(
    (total, item) => total + (effectiveSaleQty[item.code] ?? 0) * item.buy,
    0
  );
  const profitDeductions = totalSalesModal + salesCosts.salary + salesCosts.otherCost;
  const ownerCashReceived =
    totalSales -
    salesCosts.grabGofood -
    salesCosts.qris -
    salesCosts.salary -
    salesCosts.otherCost;
  const [saveStatus, setSaveStatus] = useState("");

  function setKioskSaleQty(code: string, value: number) {
    setSaleQtyByKiosk((current) => ({
      ...current,
      [selectedKiosk]: {
        ...current[selectedKiosk],
        [code]: value
      }
    }));
  }

  function setKioskCost(
    key: keyof typeof salesCosts,
    value: number
  ) {
    setSalesCostsByKiosk((current) => ({
      ...current,
      [selectedKiosk]: {
        ...current[selectedKiosk],
        [key]: value
      }
    }));
  }

  async function saveSales() {
    setSaveStatus("Menyimpan penjualan ke database...");
    const kioskName = locations.find((item) => item.key === selectedKiosk)?.name ?? selectedKiosk;
    const response = await fetch("/api/sales", {
      body: JSON.stringify({
        cashOwner: ownerCashReceived,
        costs: salesCosts,
        date: salesDate,
        items: materials.map((item) => ({
          buy: item.buy,
          code: item.code,
          name: item.name,
          qty: effectiveSaleQty[item.code] ?? 0,
          sell: item.sell
        })),
        kiosk: kioskName,
        kioskKey: selectedKiosk,
        modal: totalSalesModal,
        totalSales
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    });

    if (!response.ok) {
      setSaveStatus("Penjualan gagal disimpan.");
      return;
    }

    const result = (await response.json()) as { number: string };
    setSaveStatus(`Penjualan tersimpan ke backend dengan nomor ${result.number}.`);
    setSalesDate("");
    await onSaved();
  }

  return (
    <>
      <TransactionDateGate
        date={salesDate}
        onConfirm={setSalesDate}
        title="Tanggal Penjualan Kios"
      />
      <Card>
        <CardHeader>
          <CardTitle>Input Penjualan Kios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="max-w-xs">
            <Field label="Tanggal">
              <Input
                type="date"
                value={salesDate}
                onChange={(event) => setSalesDate(event.target.value)}
              />
            </Field>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bahan Baku</TableHead>
                <TableHead>Stok Kios</TableHead>
                <TableHead>Harga Beli</TableHead>
                <TableHead>Harga Jual</TableHead>
                <TableHead>Jumlah Keluar</TableHead>
                <TableHead>Nilai Penjualan Otomatis</TableHead>
                <TableHead>Modal Otomatis</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map((item) => {
                const isAutoPack = item.code === "BB-021" || item.code === "BB-022";
                const qty = effectiveSaleQty[item.code] ?? 0;
                return (
                  <TableRow key={item.code} className={isAutoPack ? "bg-amber-50/70" : ""}>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{item.name}</p>
                        {isAutoPack ? <Badge variant="warning">Otomatis</Badge> : null}
                      </div>
                      <p className="text-xs text-muted-foreground">{item.code}</p>
                    </TableCell>
                    <TableCell>{formatNumber(item.stock[selectedKiosk])}</TableCell>
                    <TableCell>{formatNumber(item.buy)}</TableCell>
                    <TableCell>{item.sell ? formatNumber(item.sell) : "-"}</TableCell>
                    <TableCell>
                      {isAutoPack ? (
                        <div className="min-w-[120px] rounded-md border border-amber-200 bg-white px-3 py-2 text-sm font-semibold">
                          {formatNumber(qty)}
                        </div>
                      ) : (
                        <NumberInput
                          className="min-w-[120px]"
                          value={qty}
                          onValueChange={(value) => setKioskSaleQty(item.code, value)}
                        />
                      )}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {item.sell ? formatNumber(qty * item.sell) : "-"}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatNumber(qty * item.buy)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <div className="grid gap-4 md:grid-cols-4">
            <Field label="Gaji Karyawan">
              <NumberInput
                value={salesCosts.salary}
                onValueChange={(value) => setKioskCost("salary", value)}
              />
            </Field>
            <Field label="Grab/GoFood">
              <NumberInput
                value={salesCosts.grabGofood}
                onValueChange={(value) => setKioskCost("grabGofood", value)}
              />
            </Field>
            <Field label="QRIS">
              <NumberInput
                value={salesCosts.qris}
                onValueChange={(value) => setKioskCost("qris", value)}
              />
            </Field>
            <Field label="Lain lain">
              <NumberInput
                value={salesCosts.otherCost}
                onValueChange={(value) => setKioskCost("otherCost", value)}
              />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-5">
            <SummaryTile label="Total Nilai Penjualan" value={formatCurrency(totalSales)} />
            <SummaryTile label="Modal Penjualan" value={formatCurrency(totalSalesModal)} />
            <SummaryTile label="Cash Diterima Owner" value={formatCurrency(ownerCashReceived)} />
            <SummaryTile label="Pengurang Laba" value={formatCurrency(profitDeductions)} />
            <SummaryTile
              label="Estimasi Laba Setelah Pengurang"
              value={formatCurrency(totalSales - profitDeductions)}
              strong
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {saveStatus ? (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
                {saveStatus}
              </div>
            ) : null}
            <Button onClick={saveSales}>
              <PackageMinus />
              Simpan Penjualan
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function PurchaseView({
  materials,
  onSaved
}: {
  materials: Material[];
  onSaved: () => Promise<void>;
}) {
  const [purchaseQty, setPurchaseQty] = useState<NumberMap>({});
  const [purchasePrices, setPurchasePrices] = useState<NumberMap>(() =>
    Object.fromEntries(materials.map((item) => [item.code, item.buy])) as NumberMap
  );
  const [editablePurchasePrices, setEditablePurchasePrices] = useState<
    Record<string, boolean>
  >({});
  const [purchaseDate, setPurchaseDate] = useState("");
  const [purchaseNote, setPurchaseNote] = useState("Belanja bahan baku");
  const [purchaseOfficer, setPurchaseOfficer] = useState("Operator Gudang");
  const [shippingCost, setShippingCost] = useState(0);
  const [saveStatus, setSaveStatus] = useState("");
  const subtotal = materials.reduce(
    (total, item) =>
      total + (purchaseQty[item.code] ?? 0) * (purchasePrices[item.code] ?? item.buy),
    0
  );

  function togglePurchasePriceEdit(code: string) {
    setEditablePurchasePrices((current) => ({
      ...current,
      [code]: !current[code]
    }));
  }

  async function savePurchase() {
    setSaveStatus("Menyimpan belanja dan harga beli...");
    const response = await fetch("/api/purchases", {
      body: JSON.stringify({
        date: purchaseDate,
        items: materials.map((item) => ({
          code: item.code,
          name: item.name,
          price: purchasePrices[item.code] ?? item.buy,
          qty: purchaseQty[item.code] ?? 0
        })),
        note: purchaseNote,
        officer: purchaseOfficer,
        shippingCost
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    });

    if (!response.ok) {
      setSaveStatus("Belanja gagal disimpan.");
      return;
    }

    const result = (await response.json()) as { number: string };
    setSaveStatus(`Belanja tersimpan ke backend dengan nomor ${result.number}.`);
    setPurchaseDate("");
    await onSaved();
  }

  return (
    <>
    <TransactionDateGate
      date={purchaseDate}
      onConfirm={setPurchaseDate}
      title="Tanggal Belanja Bahan Baku"
    />
    <Card>
      <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <CardTitle>Belanja Bahan Baku</CardTitle>
        <Badge variant="outline">BLJ-20260628-001</Badge>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_1.6fr]">
          <Field label="Tanggal">
            <Input
              type="date"
              value={purchaseDate}
              onChange={(event) => setPurchaseDate(event.target.value)}
            />
          </Field>
          <Field label="Petugas">
            <Input
              value={purchaseOfficer}
              onChange={(event) => setPurchaseOfficer(event.target.value)}
            />
          </Field>
          <Field label="Catatan">
            <Input
              value={purchaseNote}
              onChange={(event) => setPurchaseNote(event.target.value)}
              placeholder="Catatan belanja sekali transaksi"
            />
          </Field>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bahan Baku</TableHead>
              <TableHead>Stok Awal Gudang</TableHead>
              <TableHead>Harga Beli</TableHead>
              <TableHead>Jumlah Belanja</TableHead>
              <TableHead>Nilai Belanja</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.map((item) => {
              const qty = purchaseQty[item.code] ?? 0;
              const buyPrice = purchasePrices[item.code] ?? item.buy;
              return (
                <TableRow key={item.code}>
                  <TableCell>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.code}</p>
                  </TableCell>
                  <TableCell>{formatNumber(item.stock.gudang)}</TableCell>
                  <TableCell>
                    <div className="flex min-w-[172px] items-center gap-2">
                      {editablePurchasePrices[item.code] ? (
                        <NumberInput
                          className="min-w-[120px]"
                          value={buyPrice}
                          onValueChange={(value) =>
                            updateNumberMap(setPurchasePrices, item.code, value)
                          }
                        />
                      ) : (
                        <div className="min-w-[120px] rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950">
                          {formatNumber(buyPrice)}
                        </div>
                      )}
                      <Button
                        aria-label={
                          editablePurchasePrices[item.code]
                            ? `Kunci harga beli ${item.name}`
                            : `Edit harga beli ${item.name}`
                        }
                        size="icon"
                        variant={editablePurchasePrices[item.code] ? "default" : "outline"}
                        onClick={() => togglePurchasePriceEdit(item.code)}
                      >
                        {editablePurchasePrices[item.code] ? <Check /> : <Pencil />}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <NumberInput
                      className="min-w-[120px]"
                      value={qty}
                      onValueChange={(value) =>
                        updateNumberMap(
                          setPurchaseQty,
                          item.code,
                          value
                        )
                      }
                    />
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatNumber(qty * buyPrice)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <div className="max-w-xs">
          <Field label="Ongkir optional">
            <NumberInput
              value={shippingCost}
              onValueChange={setShippingCost}
            />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <SummaryTile label="Subtotal bahan" value={formatCurrency(subtotal)} />
          <SummaryTile label="Ongkir" value={formatCurrency(shippingCost)} />
          <SummaryTile
            label="Total event belanja"
            value={formatCurrency(subtotal + shippingCost)}
            strong
          />
        </div>

        {saveStatus ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
            {saveStatus}
          </div>
        ) : null}

        <Button onClick={savePurchase}>
          <ShoppingCart />
          Simpan Belanja
        </Button>
      </CardContent>
    </Card>
    </>
  );
}

function DistributionView({
  materials,
  onSaved
}: {
  materials: Material[];
  onSaved: () => Promise<void>;
}) {
  const [destination, setDestination] = useState<KioskKey>("wadas");
  const [distributionDate, setDistributionDate] = useState("");
  const [distributionQty, setDistributionQty] = useState<NumberMap>({});
  const [distributionOfficer, setDistributionOfficer] = useState("Admin");
  const [saveStatus, setSaveStatus] = useState("");

  async function saveDistribution() {
    setSaveStatus("Menyimpan distribusi ke database...");
    const destinationName =
      kiosks.find((kiosk) => kiosk.key === destination)?.name ?? destination;
    const response = await fetch("/api/distributions", {
      body: JSON.stringify({
        date: distributionDate,
        destination,
        destinationName,
        items: materials.map((item) => ({
          code: item.code,
          name: item.name,
          qty: distributionQty[item.code] ?? 0
        })),
        officer: distributionOfficer
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    });

    if (!response.ok) {
      setSaveStatus("Distribusi gagal disimpan.");
      return;
    }

    const result = (await response.json()) as { number: string };
    setSaveStatus(`Distribusi tersimpan ke backend dengan nomor ${result.number}.`);
    setDestination("wadas");
    setDistributionDate("");
    setDistributionOfficer("");
    setDistributionQty({});
    await onSaved();
  }

  return (
    <>
    <TransactionDateGate
      date={distributionDate}
      onConfirm={setDistributionDate}
      title="Tanggal Distribusi"
    />
    <Card>
      <CardHeader>
        <CardTitle>Distribusi Gudang ke Kios</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-4">
          <Field label="Tanggal">
            <Input
              type="date"
              value={distributionDate}
              onChange={(event) => setDistributionDate(event.target.value)}
            />
          </Field>
          <Field label="Lokasi asal">
            <Input value="Gudang Utama" readOnly />
          </Field>
          <Field label="Tujuan">
            <Select
              value={destination}
              onChange={(event) => setDestination(event.target.value as KioskKey)}
            >
              {kiosks.map((kiosk) => (
                <option key={kiosk.key} value={kiosk.key}>
                  {kiosk.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Petugas">
            <Input
              value={distributionOfficer}
              onChange={(event) => setDistributionOfficer(event.target.value)}
            />
          </Field>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bahan Baku</TableHead>
              <TableHead>Stok Gudang</TableHead>
              <TableHead>Stok Tujuan</TableHead>
              <TableHead>Jumlah Distribusi</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.map((item) => {
              const qty = distributionQty[item.code] ?? 0;
              const isEnough = item.stock.gudang >= qty;
              return (
                <TableRow key={item.code}>
                  <TableCell>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.code}</p>
                  </TableCell>
                  <TableCell>{formatNumber(item.stock.gudang)}</TableCell>
                  <TableCell>{formatNumber(item.stock[destination])}</TableCell>
                  <TableCell>
                    <NumberInput
                      className="min-w-[120px]"
                      value={qty}
                      onValueChange={(value) =>
                        updateNumberMap(
                          setDistributionQty,
                          item.code,
                          value
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Badge variant={isEnough ? "success" : "danger"}>
                      {isEnough ? "Cukup" : "Stok kurang"}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {saveStatus ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
            {saveStatus}
          </div>
        ) : null}

        <Button onClick={saveDistribution}>
          <Truck />
          Simpan Distribusi
        </Button>
      </CardContent>
    </Card>
    </>
  );
}

function ExpenseView({ onSaved }: { onSaved: () => Promise<void> }) {
  const [expenseDate, setExpenseDate] = useState("");
  const [expenseAmount, setExpenseAmount] = useState(0);
  const [expenseKind, setExpenseKind] = useState("Bensin");
  const [expenseLocation, setExpenseLocation] = useState("Umum");
  const [saveStatus, setSaveStatus] = useState("");

  async function saveExpense() {
    setSaveStatus("Menyimpan biaya ke database...");
    const response = await fetch("/api/expenses", {
      body: JSON.stringify({
        amount: expenseAmount,
        date: expenseDate,
        kind: expenseKind,
        location: expenseLocation,
        source: "Manual"
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    });

    if (!response.ok) {
      setSaveStatus("Biaya gagal disimpan.");
      return;
    }

    const result = (await response.json()) as { number: string };
    setSaveStatus(`Biaya tersimpan ke backend dengan nomor ${result.number}.`);
    setExpenseDate("");
    await onSaved();
  }

  return (
    <>
    <TransactionDateGate
      date={expenseDate}
      onConfirm={setExpenseDate}
      title="Tanggal Biaya Lain lain"
    />
    <Card>
      <CardHeader>
        <CardTitle>Biaya Lain lain</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-5">
          <Field label="Tanggal">
            <Input
              type="date"
              value={expenseDate}
              onChange={(event) => setExpenseDate(event.target.value)}
            />
          </Field>
          <Field label="Jenis biaya">
            <Select
              value={expenseKind}
              onChange={(event) => setExpenseKind(event.target.value)}
            >
              <option>Ongkos Kirim</option>
              <option>Bensin</option>
              <option>Ganti Oli</option>
              <option>Galon</option>
              <option>Lain-Lain</option>
            </Select>
          </Field>
          <Field label="Lokasi">
            <Select
              value={expenseLocation}
              onChange={(event) => setExpenseLocation(event.target.value)}
            >
              <option>Umum</option>
              {locations.map((location) => (
                <option key={location.key}>{location.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Nominal">
            <NumberInput value={expenseAmount} onValueChange={setExpenseAmount} />
          </Field>
          <Field label="Sumber">
            <Input value="Manual" readOnly />
          </Field>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Jenis</TableHead>
              <TableHead>Lokasi</TableHead>
              <TableHead>Nominal</TableHead>
              <TableHead>Sumber</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              ["28 Jun", "Bensin", "Umum", 30000, "Manual"],
              ["27 Jun", "Ongkos Kirim", "Gudang Utama", 15000, "Belanja"],
              ["26 Jun", "Galon", "Kios Wadas", 18000, "Manual"]
            ].map(([date, type, location, amount, source]) => (
              <TableRow key={`${date}-${type}`}>
                <TableCell>{date}</TableCell>
                <TableCell className="font-medium">{type}</TableCell>
                <TableCell>{location}</TableCell>
                <TableCell>{formatCurrency(Number(amount))}</TableCell>
                <TableCell>{source}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {saveStatus ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
            {saveStatus}
          </div>
        ) : null}

        <Button onClick={saveExpense}>
          <ReceiptText />
          Simpan Biaya
        </Button>
      </CardContent>
    </Card>
    </>
  );
}

function KupatTahuPurchaseView({ onSaved }: { onSaved: () => Promise<void> }) {
  const [purchaseDate, setPurchaseDate] = useState("");
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState("Belanja Kupat Tahu");
  const [saveStatus, setSaveStatus] = useState("");

  async function savePurchase() {
    setSaveStatus("Menyimpan belanja Kupat Tahu...");
    const response = await fetch("/api/kupat-tahu", {
      body: JSON.stringify({
        amount,
        date: purchaseDate,
        kind: "Belanja",
        note
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    });

    if (!response.ok) {
      setSaveStatus("Belanja Kupat Tahu gagal disimpan.");
      return;
    }

    const result = (await response.json()) as { number: string };
    setSaveStatus(`Belanja Kupat Tahu tersimpan dengan nomor ${result.number}.`);
    setAmount(0);
    setNote("Belanja Kupat Tahu");
    setPurchaseDate("");
    await onSaved();
  }

  return (
    <>
    <TransactionDateGate
      date={purchaseDate}
      onConfirm={setPurchaseDate}
      title="Tanggal Belanja Kupat Tahu"
    />
    <Card>
      <CardHeader>
        <CardTitle>Belanja Kupat Tahu</CardTitle>
        <CardDescription>
          Transaksi belanja dicatat sebagai aktivitas dan report Kupat Tahu.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_1.5fr]">
          <Field label="Tanggal">
            <Input
              type="date"
              value={purchaseDate}
              onChange={(event) => setPurchaseDate(event.target.value)}
            />
          </Field>
          <Field label="Nilai Belanja">
            <NumberInput value={amount} onValueChange={setAmount} />
          </Field>
          <Field label="Catatan">
            <Input value={note} onChange={(event) => setNote(event.target.value)} />
          </Field>
        </div>

        <SummaryTile label="Total Belanja Kupat Tahu" value={formatCurrency(amount)} strong />

        {saveStatus ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
            {saveStatus}
          </div>
        ) : null}

        <Button onClick={savePurchase}>
          <ShoppingCart />
          Simpan Belanja Kupat Tahu
        </Button>
      </CardContent>
    </Card>
    </>
  );
}

function KupatTahuSalesView({ onSaved }: { onSaved: () => Promise<void> }) {
  const [salesDate, setSalesDate] = useState("");
  const [portionQty, setPortionQty] = useState(0);
  const [salary, setSalary] = useState(0);
  const [qris, setQris] = useState(0);
  const [otherCost, setOtherCost] = useState(0);
  const [note, setNote] = useState("Penjualan Kupat Tahu");
  const [saveStatus, setSaveStatus] = useState("");
  const pricePerPortion = 10000;
  const omset = portionQty * pricePerPortion;
  const grossIncome = Math.round(omset * 0.4);
  const modal = omset - grossIncome;
  const netIncome = grossIncome - salary - otherCost;
  const cash = omset - salary - qris - otherCost;

  async function saveSales() {
    setSaveStatus("Menyimpan penjualan Kupat Tahu...");
    const response = await fetch("/api/kupat-tahu", {
      body: JSON.stringify({
        date: salesDate,
        kind: "Penjualan",
        note,
        otherCost,
        portionQty,
        qris,
        salary
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    });

    if (!response.ok) {
      setSaveStatus("Penjualan Kupat Tahu gagal disimpan.");
      return;
    }

    const result = (await response.json()) as { number: string };
    setSaveStatus(`Penjualan Kupat Tahu tersimpan dengan nomor ${result.number}.`);
    setPortionQty(0);
    setSalary(0);
    setQris(0);
    setOtherCost(0);
    setNote("Penjualan Kupat Tahu");
    setSalesDate("");
    await onSaved();
  }

  return (
    <>
    <TransactionDateGate
      date={salesDate}
      onConfirm={setSalesDate}
      title="Tanggal Penjualan Kupat Tahu"
    />
    <Card>
      <CardHeader>
        <CardTitle>Penjualan Kupat Tahu</CardTitle>
        <CardDescription>
          Harga jual per porsi Rp 10.000 dengan margin laba kotor 40%.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <Field label="Tanggal">
            <Input
              type="date"
              value={salesDate}
              onChange={(event) => setSalesDate(event.target.value)}
            />
          </Field>
          <Field label="Jumlah Porsi Terjual">
            <NumberInput value={portionQty} onValueChange={setPortionQty} />
          </Field>
          <Field label="Gaji">
            <NumberInput value={salary} onValueChange={setSalary} />
          </Field>
          <Field label="QRIS">
            <NumberInput value={qris} onValueChange={setQris} />
          </Field>
          <Field label="Lain lain">
            <NumberInput value={otherCost} onValueChange={setOtherCost} />
          </Field>
          <Field label="Catatan">
            <Input value={note} onChange={(event) => setNote(event.target.value)} />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <SummaryTile label="Harga per Porsi" value={formatCurrency(pricePerPortion)} />
          <SummaryTile label="Omset" value={formatCurrency(omset)} />
          <SummaryTile label="Modal 60%" value={formatCurrency(modal)} />
          <SummaryTile label="Laba Kotor 40%" value={formatCurrency(grossIncome)} strong />
          <SummaryTile label="Pendapatan Bersih" value={formatCurrency(netIncome)} strong />
          <SummaryTile label="Cash" value={formatCurrency(cash)} />
        </div>

        {saveStatus ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
            {saveStatus}
          </div>
        ) : null}

        <Button onClick={saveSales}>
          <Utensils />
          Simpan Penjualan Kupat Tahu
        </Button>
      </CardContent>
    </Card>
    </>
  );
}

function LoginUserView({
  currentRole,
  onLogin
}: {
  currentRole: UserRole;
  onLogin: (username: string, role: UserRole, password: string) => Promise<void>;
}) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function submitLogin() {
    setLoginError("");
    setLoginLoading(true);
    try {
      await onLogin(username, selectedRole, password);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Login gagal.");
    } finally {
      setLoginLoading(false);
    }
  }

  return (
    <Card className="overflow-hidden border-white/70 bg-white/95 shadow-2xl backdrop-blur">
      <CardHeader className="space-y-3 bg-amber-50/80">
        <div className="flex items-center justify-between gap-3">
          <Badge className="w-fit" variant="warning">
            Login Aman
          </Badge>
          <Badge variant="outline">SQLite + Better Auth</Badge>
        </div>
        <div>
          <CardTitle className="text-2xl">Masuk Aplikasi</CardTitle>
          <CardDescription>
            Gunakan akun Admin atau Operator untuk membuka menu kerja.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <Field label="Username">
          <Input
            className="font-medium"
            placeholder="Masukkan username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </Field>
        <Field label="Password">
          <div className="relative">
            <Input
              className="pr-10 font-medium"
              type={showPassword ? "text" : "password"}
              placeholder="Masukkan password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              type="button"
              aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
              className="absolute right-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-amber-900 transition-colors hover:bg-amber-100"
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Field>
        <Field label="Role User">
          <Select
            value={selectedRole}
            onChange={(event) => setSelectedRole(event.target.value as UserRole)}
          >
            <option value="Admin">Admin</option>
            <option value="Operator">Operator</option>
          </Select>
        </Field>
        <Button
          className="h-11 w-full bg-amber-950 text-amber-50 shadow-md hover:bg-amber-900"
          disabled={loginLoading}
          onClick={submitLogin}
        >
          <ShieldCheck />
          {loginLoading ? "Memproses..." : `Masuk sebagai ${selectedRole}`}
        </Button>
        {loginError ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {loginError}
          </div>
        ) : null}
        <div className="grid gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-900 sm:grid-cols-2">
          <span>Admin: parameter dan user</span>
          <span>Operator: transaksi dan report</span>
        </div>
      </CardContent>
    </Card>
  );
}

function ParameterView({
  additionalIncomeValues,
  monthlyCostValues,
  onSaved,
  setAdditionalIncomeValues,
  setMonthlyCostValues
}: {
  additionalIncomeValues: NumberMap;
  monthlyCostValues: NumberMap;
  onSaved: () => Promise<void>;
  setAdditionalIncomeValues: React.Dispatch<React.SetStateAction<NumberMap>>;
  setMonthlyCostValues: React.Dispatch<React.SetStateAction<NumberMap>>;
}) {
  const totalMonthlyCost = getNumberMapTotal(monthlyCostValues);
  const totalAdditionalIncome = getNumberMapTotal(additionalIncomeValues);
  const estimatedNet = getNetProfit(totalMonthlyCost, totalAdditionalIncome);
  const [saveStatus, setSaveStatus] = useState("");

  async function saveParameters() {
    setSaveStatus("Menyimpan parameter ke database...");
    const entries = [
      ...Object.entries(monthlyCostValues),
      ...Object.entries(additionalIncomeValues)
    ];

    await Promise.all(
      entries.map(([parameterKey, amount]) =>
        fetch("/api/bootstrap", {
          body: JSON.stringify({ amount, parameterKey }),
          headers: { "Content-Type": "application/json" },
          method: "PATCH"
        })
      )
    );

    setSaveStatus("Parameter tersimpan ke backend.");
    await onSaved();
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryTile
          label="Total Biaya Bulanan"
          value={formatCurrency(totalMonthlyCost)}
        />
        <SummaryTile
          label="Pendapatan Tambahan"
          value={formatCurrency(totalAdditionalIncome)}
        />
        <SummaryTile
          label="Estimasi Laba Bersih"
          value={formatCurrency(estimatedNet)}
          strong
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Parameter Biaya Bulanan</CardTitle>
          <CardDescription>
            Komponen ini menjadi pengurang laba bersih bulanan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parameter</TableHead>
                <TableHead>Nominal</TableHead>
                <TableHead>Keterangan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyCostParameters.map((item) => (
                <TableRow key={item.key}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <NumberInput
                      className="w-36"
                      value={monthlyCostValues[item.key] ?? 0}
                      onValueChange={(value) =>
                        updateNumberMap(setMonthlyCostValues, item.key, value)
                      }
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {"note" in item && item.note ? item.note : "Pengurang laba bulanan"}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell className="font-bold">TOTAL BIAYA BULANAN</TableCell>
                <TableCell className="font-bold text-red-700">
                  {formatCurrency(totalMonthlyCost)}
                </TableCell>
                <TableCell>Total pengurangan laba bulanan</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Parameter Pendapatan Tambahan</CardTitle>
          <CardDescription>
            Komponen ini menjadi penambah laba bersih bulanan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parameter</TableHead>
                <TableHead>Nominal</TableHead>
                <TableHead>Keterangan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {additionalIncomeParameters.map((item) => (
                <TableRow key={item.key}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <NumberInput
                      className="w-36"
                      value={additionalIncomeValues[item.key] ?? 0}
                      onValueChange={(value) =>
                        updateNumberMap(setAdditionalIncomeValues, item.key, value)
                      }
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.note}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell className="font-bold">TOTAL PENDAPATAN TAMBAHAN</TableCell>
                <TableCell className="font-bold text-emerald-700">
                  {formatCurrency(totalAdditionalIncome)}
                </TableCell>
                <TableCell>Total penambah laba bersih</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {saveStatus ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
          {saveStatus}
        </div>
      ) : null}
      <Button onClick={saveParameters}>
        <ShieldCheck />
        Simpan Parameter
      </Button>
    </div>
  );
}

function MaintenanceUserView({
  onChanged,
  users: backendUsers
}: {
  onChanged: () => Promise<void>;
  users?: BackendBootstrap["users"];
}) {
  const [editingUserId, setEditingUserId] = useState("");
  const [editDraft, setEditDraft] = useState<Record<string, { name: string; role: UserRole }>>({});
  const [newUser, setNewUser] = useState({
    name: "",
    password: "operator123",
    role: "Operator" as UserRole
  });
  const [statusMessage, setStatusMessage] = useState("");
  const users = backendUsers?.length
    ? backendUsers.map((user) => ({
        email: user.email,
        id: user.id,
        name: user.name,
        role: user.role,
        status: "Aktif",
        username: user.name
      }))
    : [
    {
      email: "admin@yudhistira.local",
      id: "admin-fallback",
      name: "Admin",
      role: "Admin" as UserRole,
      status: "Aktif",
      username: "admin"
    },
    {
      email: "operator_wadas",
      id: "operator-wadas-fallback",
      name: "Operator Wadas",
      role: "Operator" as UserRole,
      status: "Aktif",
      username: "operator_wadas"
    },
    {
      email: "operator_gudang",
      id: "operator-gudang-fallback",
      name: "Operator Gudang",
      role: "Operator" as UserRole,
      status: "Aktif",
      username: "operator_gudang"
    },
    {
      email: "operator_bubulak",
      id: "operator-bubulak-fallback",
      name: "Operator Bubulak",
      role: "Operator" as UserRole,
      status: "Nonaktif",
      username: "operator_bubulak"
    }
  ];

  function beginEdit(user: (typeof users)[number]) {
    setEditingUserId(user.id);
    setEditDraft((current) => ({
      ...current,
      [user.id]: {
        name: user.name,
        role: user.role
      }
    }));
    setStatusMessage("");
  }

  async function saveUser(userId: string) {
    const draft = editDraft[userId];
    if (!draft?.name.trim()) {
      setStatusMessage("Username tidak boleh kosong.");
      return;
    }

    setStatusMessage("Menyimpan perubahan user...");
    const response = await fetch("/api/users", {
      body: JSON.stringify({
        id: userId,
        name: draft.name.trim(),
        role: draft.role
      }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH"
    });

    if (!response.ok) {
      setStatusMessage("Update user gagal. Silakan coba lagi.");
      return;
    }

    await onChanged();
    setEditingUserId("");
    setStatusMessage("User berhasil diupdate dari database.");
  }

  async function addUser() {
    if (!newUser.name.trim()) {
      setStatusMessage("Username user baru wajib diisi.");
      return;
    }

    if (!newUser.password.trim()) {
      setStatusMessage("Password user baru wajib diisi.");
      return;
    }

    setStatusMessage("Membuat user baru di backend...");
    const response = await fetch("/api/users", {
      body: JSON.stringify({
        name: newUser.name.trim(),
        password: newUser.password.trim(),
        role: newUser.role
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    });

    if (!response.ok) {
      setStatusMessage("Tambah user gagal.");
      return;
    }

    await onChanged();
    setNewUser({
      name: "",
      password: "operator123",
      role: "Operator"
    });
    setStatusMessage("User baru berhasil dibuat.");
  }

  async function deleteUser(userId: string, name: string) {
    setStatusMessage(`Menghapus user ${name}...`);
    const response = await fetch("/api/users", {
      body: JSON.stringify({ id: userId }),
      headers: { "Content-Type": "application/json" },
      method: "DELETE"
    });

    if (!response.ok) {
      setStatusMessage("Hapus user gagal. Admin utama tidak boleh dihapus.");
      return;
    }

    await onChanged();
    setStatusMessage(`User ${name} berhasil dihapus.`);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryTile label="Total User" value={formatNumber(users.length)} />
        <SummaryTile
          label="User Aktif"
          value={formatNumber(users.filter((user) => user.status === "Aktif").length)}
        />
        <SummaryTile label="Role Admin" value="1 user" strong />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Maintenance User</CardTitle>
            <CardDescription>
              Username memakai nama user. Email hanya dipakai internal untuk autentikasi.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {statusMessage ? (
            <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
              {statusMessage}
            </div>
          ) : null}

          <div className="grid gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 lg:grid-cols-[1.3fr_1fr_0.8fr_auto] lg:items-end">
            <Field label="Username Baru">
              <Input
                placeholder="Contoh: Operator Wadas"
                value={newUser.name}
                onChange={(event) =>
                  setNewUser((current) => ({ ...current, name: event.target.value }))
                }
              />
            </Field>
            <Field label="Password">
              <Input
                value={newUser.password}
                onChange={(event) =>
                  setNewUser((current) => ({ ...current, password: event.target.value }))
                }
              />
            </Field>
            <Field label="Role">
              <Select
                value={newUser.role}
                onChange={(event) =>
                  setNewUser((current) => ({
                    ...current,
                    role: event.target.value as UserRole
                  }))
                }
              >
                <option value="Admin">Admin</option>
                <option value="Operator">Operator</option>
              </Select>
            </Field>
            <Button onClick={addUser}>
              <ShieldCheck />
              Tambah User
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {editingUserId === user.id ? (
                      <Input
                        className="min-w-[180px]"
                        value={editDraft[user.id]?.name ?? user.name}
                        onChange={(event) =>
                          setEditDraft((current) => ({
                            ...current,
                            [user.id]: {
                              name: event.target.value,
                              role: current[user.id]?.role ?? user.role
                            }
                          }))
                        }
                      />
                    ) : (
                      user.username
                    )}
                  </TableCell>
                  <TableCell>
                    {editingUserId === user.id ? (
                      <Select
                        className="min-w-[140px]"
                        disabled={user.email === "admin@yudhistira.local"}
                        value={editDraft[user.id]?.role ?? user.role}
                        onChange={(event) =>
                          setEditDraft((current) => ({
                            ...current,
                            [user.id]: {
                              name: current[user.id]?.name ?? user.name,
                              role: event.target.value as UserRole
                            }
                          }))
                        }
                      >
                        <option value="Admin">Admin</option>
                        <option value="Operator">Operator</option>
                      </Select>
                    ) : (
                      <Badge variant={user.role === "Admin" ? "warning" : "outline"}>
                        {user.role}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === "Aktif" ? "success" : "secondary"}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {editingUserId === user.id ? (
                        <>
                          <Button size="sm" onClick={() => saveUser(user.id)}>
                            Simpan
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingUserId("")}
                          >
                            Batal
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => beginEdit(user)}
                        >
                          Edit
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={user.email === "admin@yudhistira.local"}
                        onClick={() => deleteUser(user.id, user.name)}
                      >
                        Hapus
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function FinanceView({
  reports,
  totalAdditionalIncome,
  totalMonthlyCost
}: {
  reports?: TransactionReportRow[];
  totalAdditionalIncome: number;
  totalMonthlyCost: number;
}) {
  const reportRows = useMemo(() => reports ?? [], [reports]);
  const financeMonths = useMemo(() => {
    const availableMonths = getAvailableMonths(reportRows);
    return availableMonths.length ? availableMonths : monthOptions;
  }, [reportRows]);
  const [selectedMonth, setSelectedMonth] = useState(() =>
    getDefaultReportMonth(reportRows)
  );
  useEffect(() => {
    const nextMonth = getDefaultReportMonth(reportRows);
    setSelectedMonth((current) =>
      financeMonths.includes(current) ? current : nextMonth
    );
  }, [financeMonths, reportRows]);
  const monthReports = filterByMonth(reportRows, selectedMonth);
  const useFallbackFinance = reports === undefined;
  const salesReports = monthReports.filter((report) => report.type === "Penjualan");
  const kupatTahuSalesReports = monthReports.filter(
    (report) => report.type === "Kupat Tahu Penjualan"
  );
  const expenseReports = monthReports.filter(
    (report) => report.type === "Biaya Lain Lain"
  );
  const kupatTahuFinance = {
    cash: kupatTahuSalesReports.reduce(
      (sum, report) => sum + sumDetailsByItem(report, "Cash Kupat Tahu"),
      0
    ),
    gaji: kupatTahuSalesReports.reduce(
      (sum, report) => sum + sumDetailsByItem(report, "Gaji Kupat Tahu"),
      0
    ),
    gross: kupatTahuSalesReports.reduce(
      (sum, report) => sum + sumDetailsByItem(report, "Laba Kotor Kupat Tahu"),
      0
    ),
    modal: kupatTahuSalesReports.reduce(
      (sum, report) => sum + sumDetailsByItem(report, "Modal Kupat Tahu"),
      0
    ),
    net: kupatTahuSalesReports.reduce(
      (sum, report) => sum + sumDetailsByItem(report, "Pendapatan Bersih Kupat Tahu"),
      0
    ),
    omset: kupatTahuSalesReports.reduce((sum, report) => sum + report.total, 0),
    otherCost: kupatTahuSalesReports.reduce(
      (sum, report) => sum + sumDetailsByItem(report, "Lain lain Kupat Tahu"),
      0
    ),
    qris: kupatTahuSalesReports.reduce(
      (sum, report) => sum + sumDetailsByItem(report, "QRIS Kupat Tahu"),
      0
    )
  };
  const finance = {
    gaji:
      (salesReports.reduce((sum, report) => sum + sumDetailsByItem(report, "Gaji Karyawan"), 0) +
        kupatTahuFinance.gaji) ||
      (useFallbackFinance ? monthlyFinance.gaji : 0),
    grabGofood:
      salesReports.reduce((sum, report) => sum + sumDetailsByItem(report, "Grab/GoFood"), 0) ||
      (useFallbackFinance ? monthlyFinance.grabGofood : 0),
    qris:
      salesReports.reduce((sum, report) => sum + sumDetailsByItem(report, "QRIS"), 0) +
      kupatTahuFinance.qris,
    modal:
      (salesReports.reduce((sum, report) => sum + sumDetailsByItem(report, "Modal Penjualan"), 0) +
        kupatTahuFinance.modal) ||
      (useFallbackFinance ? monthlyFinance.modal : 0),
    omset:
      (salesReports.reduce((sum, report) => sum + report.total, 0) +
        kupatTahuFinance.omset) ||
      (useFallbackFinance ? monthlyFinance.omset : 0),
    otherCost:
      salesReports.reduce((sum, report) => sum + sumDetailsByItem(report, "Lain lain"), 0) +
      expenseReports.reduce((sum, report) => sum + report.total, 0) +
      kupatTahuFinance.otherCost
  };
  const gross = finance.omset - finance.modal;
  const rows = [
    ["Total Omset", finance.omset, "Penambah laba"],
    ["Modal", finance.modal, "Pengurang laba"],
    ["Laba Kotor", gross, "Omset dikurangi modal"],
    ["Gaji", finance.gaji, "Pengurang laba"],
    ["Grab/GoFood", finance.grabGofood, "Pengurang cash diterima owner"],
    ["QRIS", finance.qris, "Pengurang cash diterima owner"],
    ["Omset Kupat Tahu", kupatTahuFinance.omset, "Penambah laba dari produk Kupat Tahu"],
    ["Laba Kotor Kupat Tahu", kupatTahuFinance.gross, "40% dari omset Kupat Tahu"],
    ["Gaji Kupat Tahu", kupatTahuFinance.gaji, "Pengurang pendapatan dan cash"],
    ["QRIS Kupat Tahu", kupatTahuFinance.qris, "Pengurang cash Kupat Tahu"],
    ["Pendapatan Bersih Kupat Tahu", kupatTahuFinance.net, "Laba kotor dikurangi gaji dan lain lain"],
    ["Biaya Lain Lain Transaksi", finance.otherCost, "Pengurang laba dari transaksi"],
    ["Parameter Biaya Bulanan", totalMonthlyCost, "Pengurang laba bulanan"],
    ["Pendapatan Tambahan", totalAdditionalIncome, "Penambah laba bersih"]
  ];
  const net =
    finance.omset -
    finance.modal -
    finance.gaji -
    finance.otherCost -
    totalMonthlyCost +
    totalAdditionalIncome;
  const ownerCash =
    finance.omset -
    finance.grabGofood -
    finance.qris -
    finance.gaji -
    finance.otherCost;

  const totalDeductions =
    finance.modal + finance.gaji + finance.otherCost + totalMonthlyCost;

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-amber-300 bg-[linear-gradient(135deg,#fffbeb_0%,#fef3c7_52%,#ffffff_100%)]">
        <CardContent className="p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Badge variant="warning">Neraca Keuangan</Badge>
              <h2 className="mt-3 text-3xl font-black tracking-normal text-amber-950">
                {formatCurrency(net)}
              </h2>
              <p className="mt-1 text-sm font-medium text-amber-800">
                Laba bersih periode {selectedMonth}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[420px]">
              <div className="rounded-lg border border-amber-200 bg-white/80 p-4">
                <p className="text-xs font-bold uppercase tracking-normal text-amber-800">
                  Cash Owner
                </p>
                <p className="mt-2 text-xl font-black text-amber-950">
                  {formatCurrency(ownerCash)}
                </p>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-white/80 p-4">
                <p className="text-xs font-bold uppercase tracking-normal text-emerald-700">
                  Laba Kotor
                </p>
                <p className="mt-2 text-xl font-black text-emerald-700">
                  {formatCurrency(gross)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <FinancialMetricCard
          icon={Store}
          label="Total Omset"
          note="Akumulasi nilai penjualan semua kios"
          value={formatCurrency(finance.omset)}
        />
        <FinancialMetricCard
          icon={Archive}
          label="Modal"
          note="Modal bahan baku yang menjadi pengurang laba"
          tone="rose"
          value={formatCurrency(finance.modal)}
        />
        <FinancialMetricCard
          icon={ReceiptText}
          label="Total Pengurang"
          note="Modal, gaji, biaya transaksi, dan parameter bulanan"
          tone="rose"
          value={formatCurrency(totalDeductions)}
        />
        <FinancialMetricCard
          icon={DollarSign}
          label="Laba Bersih"
          note="Hasil akhir setelah biaya dan pendapatan tambahan"
          tone="emerald"
          value={formatCurrency(net)}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle>Neraca Keuangan Bulanan</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Select
              className="w-full sm:w-[180px]"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
            >
              {financeMonths.map((month) => (
                <option key={month}>{month}</option>
              ))}
            </Select>
            <Button onClick={() => downloadExport("neraca")}>
              <Download />
              Export Neraca
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Komponen</TableHead>
                <TableHead>Nominal</TableHead>
                <TableHead>Keterangan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(([label, value, note]) => (
                <TableRow key={label}>
                  <TableCell className="font-medium">{label}</TableCell>
                  <TableCell className="font-bold">{formatCurrency(Number(value))}</TableCell>
                  <TableCell>{note}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-amber-100/70">
                <TableCell className="font-bold">Cash Diterima Owner</TableCell>
                <TableCell className="font-black text-amber-800">
                  {formatCurrency(ownerCash)}
                </TableCell>
                <TableCell>Omset dikurangi Grab/GoFood, QRIS, gaji, dan lain lain</TableCell>
              </TableRow>
              <TableRow className="bg-emerald-50">
                <TableCell className="font-bold">Laba Bersih Bulan Ini</TableCell>
                <TableCell className="font-black text-emerald-700">
                  {formatCurrency(net)}
                </TableCell>
                <TableCell>Terhitung otomatis</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function StockView({ materials }: { materials: Material[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monitoring Stok per Lokasi</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bahan Baku</TableHead>
              {locations.map((location) => (
                <TableHead key={location.key}>{location.name}</TableHead>
              ))}
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.map((item) => {
              const total = locations.reduce(
                (sum, location) => sum + item.stock[location.key],
                0
              );
              return (
                <TableRow key={item.code}>
                  <TableCell>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.code}</p>
                  </TableCell>
                  {locations.map((location) => {
                    const status = stockStatus(
                      item.stock[location.key],
                      item.min[location.key]
                    );

                    return (
                      <TableCell
                        key={location.key}
                        className={`font-semibold ${status.className}`}
                      >
                        {formatNumber(item.stock[location.key])}
                      </TableCell>
                    );
                  })}
                  <TableCell className="font-bold">{formatNumber(total)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function StockOpnameView({
  materials,
  onSaved
}: {
  materials: Material[];
  onSaved: () => Promise<void>;
}) {
  const [selectedLocation, setSelectedLocation] = useState<LocationKey>("gudang");
  const [opnameDate, setOpnameDate] = useState(getTodayInputDate);
  const [lastUpdated, setLastUpdated] = useState("");
  const [physicalStockByLocation, setPhysicalStockByLocation] = useState<
    Record<LocationKey, NumberMap>
  >({
    bubulak: {},
    ciherang: {},
    gudang: {},
    wadas: {}
  });
  const location = locations.find((item) => item.key === selectedLocation) ?? locations[0];
  const physicalStock = physicalStockByLocation[selectedLocation];

  const totalDifference = materials.reduce((total, item) => {
    const physical = physicalStock[item.code] ?? item.stock[selectedLocation];
    return total + physical - item.stock[selectedLocation];
  }, 0);

  function setPhysicalStock(code: string, value: number) {
    setPhysicalStockByLocation((current) => ({
      ...current,
      [selectedLocation]: {
        ...current[selectedLocation],
        [code]: value
      }
    }));
  }

  async function updateDatabase() {
    const response = await fetch("/api/stock-opname", {
      body: JSON.stringify({
        date: opnameDate,
        items: materials.map((item) => {
          const systemStock = item.stock[selectedLocation];
          return {
            materialCode: item.code,
            materialName: item.name,
            physicalStock: physicalStock[item.code] ?? systemStock,
            systemStock
          };
        }),
        locationKey: selectedLocation,
        locationName: location.name,
        officer: "Admin"
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST"
    });

    if (response.ok) {
      const result = (await response.json()) as { number: string };
      setLastUpdated(
        `Perubahan ${location.name} tersimpan ke database dengan nomor ${result.number}`
      );
      await onSaved();
      return;
    }

    setLastUpdated("Update database gagal. Silakan coba lagi.");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle>Opname Stok Semua Tempat Penyimpanan</CardTitle>
          <div className="flex flex-col gap-2 lg:items-end">
            <div className="flex gap-2 overflow-auto">
              {locations.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setSelectedLocation(item.key)}
                  className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                    selectedLocation === item.key
                      ? "bg-primary text-primary-foreground"
                      : "bg-amber-50 text-amber-900 hover:bg-amber-100"
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
            <Button
              onClick={updateDatabase}
            >
              <PackageCheck />
              Update Database
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-4">
            <Field label="Tanggal">
              <Input
                type="date"
                value={opnameDate}
                onChange={(event) => setOpnameDate(event.target.value)}
              />
            </Field>
            <SummaryTile label="Tempat" value={location.name} />
            <SummaryTile
              label="Total Item"
              value={`${formatNumber(materials.length)} bahan baku`}
            />
            <SummaryTile
              label="Total Selisih"
              value={formatNumber(totalDifference)}
              strong={totalDifference !== 0}
            />
          </div>
          {lastUpdated ? (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
              {lastUpdated}
            </div>
          ) : null}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bahan Baku</TableHead>
                <TableHead>Stok Sistem</TableHead>
                <TableHead>Stok Fisik</TableHead>
                <TableHead>Selisih</TableHead>
                <TableHead>Catatan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map((item) => {
                const systemStock = item.stock[selectedLocation];
                const physical = physicalStock[item.code] ?? systemStock;
                const difference = physical - systemStock;

                return (
                  <TableRow key={item.code}>
                    <TableCell>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.code}</p>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatNumber(systemStock)}
                    </TableCell>
                    <TableCell>
                      <NumberInput
                        className="w-28"
                        value={physical}
                        onValueChange={(value) => setPhysicalStock(item.code, value)}
                      />
                    </TableCell>
                    <TableCell
                      className={`font-bold ${
                        difference < 0
                          ? "text-red-600"
                          : difference > 0
                            ? "text-emerald-700"
                            : "text-muted-foreground"
                      }`}
                    >
                      {difference > 0 ? "+" : ""}
                      {formatNumber(difference)}
                    </TableCell>
                    <TableCell>
                      <Input placeholder="Catatan koreksi" />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function ReportView({
  reportType,
  reports,
  stockOpnames
}: {
  reportType: ReportType;
  reports?: TransactionReportRow[];
  stockOpnames?: StockOpnameReportRow[];
}) {
  if (reportType === "Penjualan") {
    return <SalesReport reports={reports?.filter((report) => report.type === "Penjualan")} />;
  }

  if (reportType === "Belanja") {
    return (
      <SimpleReport
        rows={reports?.filter((report) => report.type === "Belanja")}
        type="Belanja"
        title="Report Belanja"
        icon={ShoppingCart}
      />
    );
  }

  if (reportType === "Distribusi") {
    return (
      <SimpleReport
        rows={reports?.filter((report) => report.type === "Distribusi")}
        type="Distribusi"
        title="Report Distribusi"
        icon={Truck}
      />
    );
  }

  if (reportType === "Opname Stok") {
    return <StockOpnameReport rows={stockOpnames} />;
  }

  return (
    <SimpleReport
      rows={reports?.filter((report) => report.type === "Biaya Lain Lain")}
      type="Biaya Lain Lain"
      title="Report Biaya Lain Lain"
      icon={ReceiptText}
    />
  );
}

function formatCurrencyDash(value: number) {
  return value ? formatCurrency(value) : "-";
}

function getDayLabel(date: string) {
  const firstPart = date.split(" ").filter(Boolean)[0];
  return firstPart ? String(Number(firstPart)) : date;
}

function AllSalesDailyReport({ reports }: { reports?: TransactionReportRow[] }) {
  const sourceRows = useMemo(() => {
    if (reports === undefined) {
      return dailySalesReports;
    }

    return reports
      .filter(
        (report) =>
          report.type === "Penjualan" || report.type === "Kupat Tahu Penjualan"
      )
      .map((report) =>
        report.type === "Kupat Tahu Penjualan"
          ? toKupatTahuDailySalesReportRow(report)
          : toDailySalesReportRow(report)
      );
  }, [reports]);
  const [selectedMonth, setSelectedMonth] = useState(() =>
    getDefaultReportMonth(sourceRows)
  );
  const reportMonths = useMemo(() => getAvailableMonths(sourceRows), [sourceRows]);

  useEffect(() => {
    const options = reportMonths.length ? reportMonths : monthOptions;
    const nextMonth = getDefaultReportMonth(sourceRows);
    setSelectedMonth((current) => (options.includes(current) ? current : nextMonth));
  }, [reportMonths, sourceRows]);

  const monthRows = filterByMonth(sourceRows, selectedMonth);
  const rows = aggregateDailySales(monthRows);
  const summary = rows.reduce(
    (total, row) => {
      const net = row.sales - row.modal - row.salary - row.otherCost;
      const cash = net - row.grabGofood - row.qris;

      return {
        cash: total.cash + cash,
        grabGofood: total.grabGofood + row.grabGofood,
        modal: total.modal + row.modal,
        net: total.net + net,
        otherCost: total.otherCost + row.otherCost,
        salary: total.salary + row.salary,
        sales: total.sales + row.sales
      };
    },
    {
      cash: 0,
      grabGofood: 0,
      modal: 0,
      net: 0,
      otherCost: 0,
      salary: 0,
      sales: 0
    }
  );

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle>Report Total Penjualan Harian</CardTitle>
          <CardDescription>
            Gabungan transaksi Kebab dan Kupat Tahu. QRIS dihitung sebagai pengurang cash.
          </CardDescription>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select
            className="w-full sm:w-[180px]"
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
          >
            {(reportMonths.length ? reportMonths : monthOptions).map((month) => (
              <option key={month}>{month}</option>
            ))}
          </Select>
          <Button onClick={() => downloadExport("semua-penjualan")}>
            <Download />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-4">
          <SummaryTile label="Omset Kotor" value={formatCurrency(summary.sales)} />
          <SummaryTile label="Modal" value={formatCurrency(summary.modal)} />
          <SummaryTile label="Penjualan Bersih" value={formatCurrency(summary.net)} strong />
          <SummaryTile label="Cash" value={formatCurrency(summary.cash)} />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Omset Kotor</TableHead>
              <TableHead>Grab</TableHead>
              <TableHead>Gaji</TableHead>
              <TableHead>Modal</TableHead>
              <TableHead>Lain lain</TableHead>
              <TableHead>Penjualan Bersih</TableHead>
              <TableHead>Cash</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  className="py-8 text-center text-sm font-medium text-muted-foreground"
                  colSpan={8}
                >
                  Belum ada data penjualan di Turso untuk periode ini.
                </TableCell>
              </TableRow>
            ) : null}
            {rows.map((row) => {
              const net = row.sales - row.modal - row.salary - row.otherCost;
              const cash = net - row.grabGofood - row.qris;

              return (
                <TableRow key={row.date}>
                  <TableCell className="font-medium">{getDayLabel(row.date)}</TableCell>
                  <TableCell>{formatCurrencyDash(row.sales)}</TableCell>
                  <TableCell>{formatCurrencyDash(row.grabGofood)}</TableCell>
                  <TableCell>{formatCurrencyDash(row.salary)}</TableCell>
                  <TableCell>{formatCurrencyDash(row.modal)}</TableCell>
                  <TableCell>{formatCurrencyDash(row.otherCost)}</TableCell>
                  <TableCell className="font-bold text-emerald-700">
                    {formatCurrencyDash(net)}
                  </TableCell>
                  <TableCell className="font-bold text-amber-800">
                    {formatCurrencyDash(cash)}
                  </TableCell>
                </TableRow>
              );
            })}
            {rows.length ? (
              <TableRow className="bg-amber-50">
                <TableCell className="font-black">Total</TableCell>
                <TableCell className="font-black">
                  {formatCurrencyDash(summary.sales)}
                </TableCell>
                <TableCell className="font-black">
                  {formatCurrencyDash(summary.grabGofood)}
                </TableCell>
                <TableCell className="font-black">
                  {formatCurrencyDash(summary.salary)}
                </TableCell>
                <TableCell className="font-black">
                  {formatCurrencyDash(summary.modal)}
                </TableCell>
                <TableCell className="font-black">
                  {formatCurrencyDash(summary.otherCost)}
                </TableCell>
                <TableCell className="font-black text-emerald-700">
                  {formatCurrencyDash(summary.net)}
                </TableCell>
                <TableCell className="font-black text-amber-800">
                  {formatCurrencyDash(summary.cash)}
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function SalesReport({
  mode = "kebab",
  reports
}: {
  mode?: "kebab" | "kupatTahu";
  reports?: TransactionReportRow[];
}) {
  const defaultTab = mode === "kupatTahu" ? "Kupat Tahu" : "Kios Wadas";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const tabs =
    mode === "kupatTahu"
      ? (["Kupat Tahu", "Total Penjualan"] as const)
      : (["Kios Wadas", "Kios Ciherang", "Kios Bubulak", "Total Penjualan"] as const);
  const sourceRows = useMemo(
    () =>
      reports === undefined
        ? mode === "kebab"
          ? dailySalesReports
          : []
        : reports.map(
            mode === "kupatTahu"
              ? toKupatTahuDailySalesReportRow
              : toDailySalesReportRow
          ),
    [mode, reports]
  );
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);
  const [selectedMonth, setSelectedMonth] = useState(() =>
    getDefaultReportMonth(sourceRows)
  );
  const reportMonths = useMemo(() => getAvailableMonths(sourceRows), [sourceRows]);
  useEffect(() => {
    const options = reportMonths.length ? reportMonths : monthOptions;
    const nextMonth = getDefaultReportMonth(sourceRows);
    setSelectedMonth((current) => (options.includes(current) ? current : nextMonth));
  }, [reportMonths, sourceRows]);
  const monthRows = filterByMonth(sourceRows, selectedMonth);
  const rows =
    activeTab === "Total Penjualan"
      ? aggregateDailySales(monthRows)
      : monthRows.filter(
          (row) => row.location === activeTab
        );
  const summary = rows.reduce(
    (total, row) => ({
      cash:
        total.cash +
        row.sales -
        row.grabGofood -
        row.qris -
        row.salary -
        row.otherCost,
      gross: total.gross + row.sales - row.modal,
      modal: total.modal + row.modal,
      net: total.net + row.sales - row.modal - row.salary - row.otherCost,
      orders: total.orders + row.orderCount,
      sales: total.sales + row.sales
    }),
    { cash: 0, gross: 0, modal: 0, net: 0, orders: 0, sales: 0 }
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>
              {mode === "kupatTahu"
                ? "Report Penjualan Harian Kupat Tahu"
                : "Report Penjualan Harian"}
            </CardTitle>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Select
              className="w-full sm:w-[180px]"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
            >
              {(reportMonths.length ? reportMonths : monthOptions).map((month) => (
                <option key={month}>{month}</option>
              ))}
            </Select>
            <Button
              onClick={() =>
                downloadExport(
                  mode === "kupatTahu" ? "kupat-tahu-penjualan" : "penjualan"
                )
              }
            >
              <Download />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex gap-2 overflow-auto border-b border-amber-200 pb-3">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                  activeTab === tab
                    ? "bg-primary text-primary-foreground"
                    : "bg-amber-50 text-amber-900 hover:bg-amber-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-5">
            <SummaryTile label="Total Penjualan" value={formatCurrency(summary.sales)} />
            <SummaryTile label="Total Modal" value={formatCurrency(summary.modal)} />
            <SummaryTile label="Laba Kotor" value={formatCurrency(summary.gross)} />
            <SummaryTile label="Cash Owner" value={formatCurrency(summary.cash)} />
            <SummaryTile label="Laba Bersih" value={formatCurrency(summary.net)} strong />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                {activeTab === "Total Penjualan" ? <TableHead>Lokasi</TableHead> : null}
                <TableHead>Transaksi</TableHead>
                <TableHead>Penjualan</TableHead>
                <TableHead>Modal</TableHead>
                <TableHead>Laba Kotor</TableHead>
                <TableHead>Gaji</TableHead>
                <TableHead>Grab/GoFood</TableHead>
                <TableHead>QRIS</TableHead>
                <TableHead>Lain lain</TableHead>
                <TableHead>Cash Owner</TableHead>
                <TableHead>Laba Bersih</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    className="py-8 text-center text-sm font-medium text-muted-foreground"
                    colSpan={activeTab === "Total Penjualan" ? 12 : 11}
                  >
                    Belum ada data penjualan di Turso untuk periode ini.
                  </TableCell>
                </TableRow>
              ) : null}
              {rows.map((row) => {
                const cash =
                  row.sales - row.grabGofood - row.qris - row.salary - row.otherCost;
                const gross = row.sales - row.modal;
                const net = row.sales - row.modal - row.salary - row.otherCost;
                return (
                  <TableRow key={`${row.date}-${row.location}`}>
                    <TableCell className="font-medium">{row.date}</TableCell>
                    {activeTab === "Total Penjualan" ? (
                      <TableCell>{row.location}</TableCell>
                    ) : null}
                    <TableCell>{formatNumber(row.orderCount)}</TableCell>
                    <TableCell>{formatCurrency(row.sales)}</TableCell>
                    <TableCell>{formatCurrency(row.modal)}</TableCell>
                    <TableCell className="font-semibold text-emerald-700">
                      {formatCurrency(gross)}
                    </TableCell>
                    <TableCell>{formatCurrency(row.salary)}</TableCell>
                    <TableCell>{formatCurrency(row.grabGofood)}</TableCell>
                    <TableCell>{formatCurrency(row.qris)}</TableCell>
                    <TableCell>{formatCurrency(row.otherCost)}</TableCell>
                    <TableCell className="font-semibold text-amber-800">
                      {formatCurrency(cash)}
                    </TableCell>
                    <TableCell className="font-bold text-emerald-700">
                      {formatCurrency(net)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function aggregateDailySales(rows: DailySalesReportRow[]): DailySalesReportRow[] {
  const grouped = rows.reduce<Record<string, DailySalesReportRow>>((result, row) => {
    const current = result[row.date] ?? {
      date: row.date,
      grabGofood: 0,
      location: "Semua Kios",
      modal: 0,
      orderCount: 0,
      otherCost: 0,
      qris: 0,
      salary: 0,
      sales: 0
    };

    result[row.date] = {
      ...current,
      grabGofood: current.grabGofood + row.grabGofood,
      modal: current.modal + row.modal,
      orderCount: current.orderCount + row.orderCount,
      otherCost: current.otherCost + row.otherCost,
      qris: current.qris + row.qris,
      salary: current.salary + row.salary,
      sales: current.sales + row.sales
    };

    return result;
  }, {});

  return Object.values(grouped);
}

function sumDetailsByItem(report: TransactionReportRow, itemName: string) {
  return report.details
    .filter((detail) => detail.item === itemName)
    .reduce((sum, detail) => sum + detail.qty * detail.price, 0);
}

function toDailySalesReportRow(report: TransactionReportRow): DailySalesReportRow {
  const modal = sumDetailsByItem(report, "Modal Penjualan");
  const salary = sumDetailsByItem(report, "Gaji Karyawan");
  const grabGofood = sumDetailsByItem(report, "Grab/GoFood");
  const qris = sumDetailsByItem(report, "QRIS");
  const otherCost = sumDetailsByItem(report, "Lain lain");
  return {
    date: report.date,
    grabGofood,
    location: report.location,
    modal,
    orderCount: 1,
    otherCost,
    qris,
    salary,
    sales: report.total
  };
}

function toKupatTahuDailySalesReportRow(report: TransactionReportRow): DailySalesReportRow {
  const modal = sumDetailsByItem(report, "Modal Kupat Tahu");
  const salary = sumDetailsByItem(report, "Gaji Kupat Tahu");
  const qris = sumDetailsByItem(report, "QRIS Kupat Tahu");
  const otherCost = sumDetailsByItem(report, "Lain lain Kupat Tahu");

  return {
    date: report.date,
    grabGofood: 0,
    location: "Kupat Tahu",
    modal,
    orderCount: 1,
    otherCost,
    qris,
    salary,
    sales: report.total
  };
}

function StockOpnameReport({ rows: backendRows }: { rows?: StockOpnameReportRow[] }) {
  const sourceRows = useMemo(
    () => (backendRows === undefined ? stockOpnameReports : backendRows),
    [backendRows]
  );
  const [selectedMonth, setSelectedMonth] = useState(() =>
    getDefaultReportMonth(sourceRows)
  );
  const reportMonths = useMemo(() => getAvailableMonths(sourceRows), [sourceRows]);
  useEffect(() => {
    const options = reportMonths.length ? reportMonths : monthOptions;
    const nextMonth = getDefaultReportMonth(sourceRows);
    setSelectedMonth((current) => (options.includes(current) ? current : nextMonth));
  }, [reportMonths, sourceRows]);
  const rows = filterByMonth(sourceRows, selectedMonth);
  const totalDifference = rows.reduce(
    (total, row) => total + row.difference,
    0
  );

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <PackageMinus className="size-4 text-primary" />
            Report Opname Stok
          </CardTitle>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select
            className="w-full sm:w-[180px]"
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
          >
            {(reportMonths.length ? reportMonths : monthOptions).map((month) => (
              <option key={month}>{month}</option>
            ))}
          </Select>
          <Button onClick={() => downloadExport("opname-stok")}>
            <Download />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-3">
          <SummaryTile
            label="Jumlah Dokumen"
            value={formatNumber(rows.length)}
          />
          <SummaryTile label="Total Selisih" value={formatNumber(totalDifference)} />
          <SummaryTile label="Tempat" value={`${formatNumber(locations.length)} lokasi`} />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Nomor</TableHead>
              <TableHead>Lokasi</TableHead>
              <TableHead>Bahan Baku</TableHead>
              <TableHead>Stok Sistem</TableHead>
              <TableHead>Stok Fisik</TableHead>
              <TableHead>Selisih</TableHead>
              <TableHead>Petugas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  className="py-8 text-center text-sm font-medium text-muted-foreground"
                  colSpan={8}
                >
                  Belum ada data opname stok di Turso untuk periode ini.
                </TableCell>
              </TableRow>
            ) : null}
            {rows.map((row) => (
              <TableRow key={`${row.number}-${row.material}`}>
                <TableCell>{row.date}</TableCell>
                <TableCell className="font-medium">{row.number}</TableCell>
                <TableCell>{row.location}</TableCell>
                <TableCell>{row.material}</TableCell>
                <TableCell>{formatNumber(row.systemStock)}</TableCell>
                <TableCell>{formatNumber(row.physicalStock)}</TableCell>
                <TableCell
                  className={`font-bold ${
                    row.difference < 0
                      ? "text-red-600"
                      : row.difference > 0
                        ? "text-emerald-700"
                        : "text-muted-foreground"
                  }`}
                >
                  {row.difference > 0 ? "+" : ""}
                  {formatNumber(row.difference)}
                </TableCell>
                <TableCell>{row.officer}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function SimpleReport({
  type,
  title,
  icon: Icon,
  rows: backendRows
}: {
  type: AppTransactionType;
  title: string;
  icon: React.ElementType;
  rows?: TransactionReportRow[];
}) {
  const fallbackRows = useMemo(() => transactionReports[type] ?? [], [type]);
  const sourceRows = useMemo(
    () => (backendRows === undefined ? fallbackRows : backendRows),
    [backendRows, fallbackRows]
  );
  const [selectedMonth, setSelectedMonth] = useState(() =>
    getDefaultReportMonth(sourceRows)
  );
  const reportMonths = useMemo(() => getAvailableMonths(sourceRows), [sourceRows]);
  const rows = filterByMonth(sourceRows, selectedMonth);
  const [selectedNumber, setSelectedNumber] = useState(rows[0]?.number ?? "");
  useEffect(() => {
    const options = reportMonths.length ? reportMonths : monthOptions;
    const nextMonth = getDefaultReportMonth(sourceRows);
    setSelectedMonth((current) => (options.includes(current) ? current : nextMonth));
  }, [reportMonths, sourceRows]);
  useEffect(() => {
    setSelectedNumber((current) =>
      rows.some((row) => row.number === current) ? current : rows[0]?.number ?? ""
    );
  }, [rows]);
  const selectedTransaction = rows.find((row) => row.number === selectedNumber) ?? rows[0];
  const total = rows.reduce((sum, row) => sum + row.total, 0);
  const gross = getGrossProfit();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Icon className="size-4 text-primary" />
              {title}
            </CardTitle>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Select
              className="w-full sm:w-[180px]"
              value={selectedMonth}
              onChange={(event) => {
                const nextMonth = event.target.value;
                const nextRows = filterByMonth(sourceRows, nextMonth);
                setSelectedMonth(nextMonth);
                setSelectedNumber(nextRows[0]?.number ?? "");
              }}
            >
              {(reportMonths.length ? reportMonths : monthOptions).map((month) => (
                <option key={month}>{month}</option>
              ))}
            </Select>
            <Button onClick={() => downloadExport(type)}>
              <Download />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-3">
            <SummaryTile label="Total Transaksi" value={formatCurrency(total)} />
            <SummaryTile label="Jumlah Dokumen" value={formatNumber(rows.length)} />
            <SummaryTile label="Laba Kotor Bulanan" value={formatCurrency(gross)} strong />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Nomor</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    className="py-8 text-center text-sm font-medium text-muted-foreground"
                    colSpan={6}
                  >
                    Belum ada data {type.toLowerCase()} di Turso untuk periode ini.
                  </TableCell>
                </TableRow>
              ) : null}
              {rows.map((row) => (
                <TableRow
                  key={row.number}
                  className={selectedTransaction?.number === row.number ? "bg-amber-50" : ""}
                >
                  <TableCell>{row.date}</TableCell>
                  <TableCell className="font-medium">{row.number}</TableCell>
                  <TableCell>{row.location}</TableCell>
                  <TableCell>{row.note}</TableCell>
                  <TableCell>{formatCurrency(row.total)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant={
                          selectedTransaction?.number === row.number ? "default" : "outline"
                        }
                        onClick={() => setSelectedNumber(row.number)}
                      >
                        Detail
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedTransaction ? (
        <Card>
          <CardHeader>
            <CardTitle>Detail Transaksi {selectedTransaction.number}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Nominal</TableHead>
                  <TableHead>Aktivitas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedTransaction.details.map((detail) => (
                  <TableRow key={`${selectedTransaction.number}-${detail.item}`}>
                    <TableCell className="font-medium">{detail.item}</TableCell>
                    <TableCell>{formatNumber(detail.qty)}</TableCell>
                    <TableCell>{formatCurrency(detail.qty * detail.price)}</TableCell>
                    <TableCell>{detail.activity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function SummaryTile({
  label,
  strong,
  value
}: {
  label: string;
  strong?: boolean;
  value: string;
}) {
  return (
    <div className="rounded-md border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`mt-1 text-xl ${strong ? "font-bold text-primary" : "font-semibold"}`}>
        {value}
      </p>
    </div>
  );
}

function NavButton({
  active,
  collapsed,
  icon: Icon,
  label,
  onClick
}: {
  active: boolean;
  collapsed: boolean;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={`Menu ${label}`}
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-bold transition-colors ${
        active
          ? "bg-amber-400 text-amber-950 shadow-sm"
          : "text-amber-900 hover:bg-amber-100 hover:text-amber-950"
      } ${collapsed ? "justify-center px-2" : ""}`}
    >
      <Icon className="size-4" />
      {!collapsed ? label : null}
    </button>
  );
}

function NavGroup({
  children,
  collapsed,
  icon: Icon,
  isOpen,
  label,
  onToggle
}: {
  children: React.ReactNode;
  collapsed: boolean;
  icon: React.ElementType;
  isOpen: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-2">
      <button
        aria-label={`Toggle ${label}`}
        className={`flex w-full items-center justify-between rounded-md px-2 py-2 text-sm font-bold text-amber-950 hover:bg-white/70 ${
          collapsed ? "justify-center" : ""
        }`}
        onClick={onToggle}
        title={collapsed ? label : undefined}
      >
        <span className="flex items-center gap-3">
          <Icon className="size-4 text-primary" />
          {!collapsed ? label : null}
        </span>
        {!collapsed ? (
          <ChevronDown
            className={`size-4 text-amber-800 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        ) : null}
      </button>
      {!collapsed && isOpen ? <div className="mt-2 space-y-1">{children}</div> : null}
    </div>
  );
}

function SubNavButton({
  active,
  label,
  onClick
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
        active
          ? "bg-white font-bold text-amber-950 shadow-sm"
          : "text-amber-800 hover:bg-white/70 hover:text-amber-950"
      }`}
    >
      {label}
    </button>
  );
}

function MobileSelect({
  activeView,
  currentRole,
  reportType,
  selectedKiosk,
  setActiveView,
  setReportType,
  setSelectedKiosk
}: {
  activeView: View;
  currentRole: UserRole;
  reportType: ReportType;
  selectedKiosk: KioskKey;
  setActiveView: (view: View) => void;
  setReportType: (type: ReportType) => void;
  setSelectedKiosk: (kiosk: KioskKey) => void;
}) {
  const value =
    activeView === "Penjualan"
      ? `sales:${selectedKiosk}`
      : activeView === "Report"
        ? `report:${reportType}`
        : activeView;

  return (
    <Select
      value={value}
      onChange={(event) => {
        const selected = event.target.value;
        if (selected.startsWith("report:")) {
          setReportType(selected.replace("report:", "") as ReportType);
          setActiveView("Report");
          return;
        }
        if (selected.startsWith("sales:")) {
          setSelectedKiosk(selected.replace("sales:", "") as KioskKey);
          setActiveView("Penjualan");
          return;
        }
        setActiveView(selected as View);
      }}
    >
      <option value="Dashboard">Dashboard</option>
      {kiosks.map((kiosk) => (
        <option key={kiosk.key} value={`sales:${kiosk.key}`}>
          Penjualan - {kiosk.name}
        </option>
      ))}
      <option value="Belanja">Belanja</option>
      <option value="Distribusi">Distribusi</option>
      <option value="Biaya Lain lain">Biaya Lain lain</option>
      <option value="Kupat Tahu Belanja">Kupat Tahu - Belanja</option>
      <option value="Kupat Tahu Penjualan">Kupat Tahu - Penjualan</option>
      <option value="Kupat Tahu Report Belanja">Kupat Tahu - Report Belanja</option>
      <option value="Kupat Tahu Report Penjualan">Kupat Tahu - Report Penjualan</option>
      <option value="Opname Stok">Opname Stok</option>
      <option value="Semua Penjualan">Report Total Penjualan</option>
      {(
        [
          "Penjualan",
          "Belanja",
          "Distribusi",
          "Biaya Lain Lain",
          "Opname Stok"
        ] as ReportType[]
      ).map((item) => (
        <option key={item} value={`report:${item}`}>
          Report - {item}
        </option>
      ))}
      <option value="Neraca Keuangan">Neraca Keuangan</option>
      <option value="Monitoring Stok">Monitoring Stok</option>
      {currentRole === "Admin" ? (
        <>
          <option value="Parameter">Parameter</option>
          <option value="Maintenance User">Maintenance User</option>
        </>
      ) : null}
    </Select>
  );
}

function NumberInput({
  className,
  onValueChange,
  value
}: {
  className?: string;
  onValueChange: (value: number) => void;
  value: number;
}) {
  return (
    <Input
      className={className}
      inputMode="numeric"
      value={formatNumber(value)}
      onChange={(event) => onValueChange(toNumber(event.target.value))}
    />
  );
}

function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-bold uppercase tracking-normal text-amber-900">
        {label}
      </Label>
      {children}
    </div>
  );
}
