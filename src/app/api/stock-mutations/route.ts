import { NextResponse } from "next/server";
import { db } from "@/db";
import { requireUser, ApiError } from "@/lib/api-access";
import { parseReportDate } from "@/lib/date";
import { stockHistory } from "@/lib/stock-history";
import { apiFailure } from "@/lib/stock-write";

export async function GET(request: Request) {
  try {
    await requireUser(request);
    const params = new URL(request.url).searchParams;
    const startDate = params.get("startDate") ?? "";
    const endDate = params.get("endDate") ?? "";
    const locationKey = params.get("locationKey") ?? "";
    const materialCode = params.get("materialCode") ?? "";
    const start = parseReportDate(startDate);
    const end = parseReportDate(endDate);
    if (!start || !end || !["wadas", "ciherang", "bubulak"].includes(locationKey) || !materialCode) throw new ApiError("Filter mutasi stok tidak valid.");
    const days = Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;
    if (days < 1 || days > 7) throw new ApiError("Periode mutasi stok harus antara satu sampai tujuh hari.");
    const history = await db.transaction((tx) => stockHistory(tx, materialCode, locationKey));
    if (!history) throw new ApiError("Kios atau bahan baku tidak ditemukan.", 404);
    const { currentStock, baseline } = history;
    const newRows = history.rows.filter((row) => row.reliable);
    const hasLegacy = history.rows.some((row) => !row.reliable && row.dateValue >= start.getTime());
    const journalMatches = !baseline || baseline.qty + newRows.reduce((sum, row) => sum + row.delta, 0) === currentStock;
    const warnings = hasLegacy ? ["Stok awal periode ini merupakan rekonstruksi histori lama dan belum terverifikasi.", ...history.warnings] : [];
    if (!journalMatches) warnings.push("Saldo tersimpan berbeda dari jurnal mutasi. Hubungi Admin untuk rekonsiliasi.");
    const openingStock = currentStock - history.rows.filter((row) => row.dateValue >= start.getTime()).reduce((sum, row) => sum + row.delta, 0);
    let balance = openingStock;
    const period = history.rows.filter((row) => row.dateValue >= start.getTime() && row.dateValue <= end.getTime());
    const rows = period.map((row) => {
      balance += row.delta;
      return { date: row.date, number: row.number, source: row.source, note: row.note,
        inQty: Math.max(row.delta, 0), outQty: Math.max(-row.delta, 0), balance };
    });
    const latestOpname = [...period].reverse().find((row) => row.source === "Opname");
    const uncertain = hasLegacy || !journalMatches;
    const reconciliation = latestOpname ? {
      difference: latestOpname.delta,
      label: uncertain ? "Perlu Rekonsiliasi" : latestOpname.delta === 0 ? "Sesuai" : `Selisih ${latestOpname.delta}`,
      status: uncertain ? "warning" : latestOpname.delta === 0 ? "success" : "danger",
      number: latestOpname.number, opnameDate: latestOpname.date
    } : { difference: null, label: uncertain ? "Perlu Rekonsiliasi" : "Belum Dicek", status: "warning", number: null, opnameDate: null };
    return NextResponse.json({ material: { code: history.material.code, name: history.material.name },
      location: { key: history.location.key, name: history.location.name }, period: { days, startDate, endDate },
      reconciliation, integrity: { openingVerified: !uncertain, warnings }, rows,
      summary: { currentStock, openingStock, endingStock: balance,
        totalIn: rows.reduce((sum, row) => sum + row.inQty, 0), totalOut: rows.reduce((sum, row) => sum + row.outQty, 0) }
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return apiFailure(error); }
}
