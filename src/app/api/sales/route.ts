import * as schema from "@/db/schema";
import { ApiError } from "@/lib/api-access";
import { integer, items, resolveItems, resolveLocation, stockPost, writeStock } from "@/lib/stock-write";

export async function POST(request: Request) {
  return stockPost(request, "Penjualan", async (tx, body, actor, number, date) => {
    const location = await resolveLocation(tx, body.kioskKey, body.kiosk, true);
    const input = items(body.items);
    const qty = (code: string) => input.find((item) => item.code === code)?.qty ?? 0;
    const packs = { "BB-021": qty("BB-001") + qty("BB-002"), "BB-022": qty("BB-003") };
    for (const [code, expected] of Object.entries(packs)) {
      const supplied = input.find((item) => item.code === code);
      if (supplied && supplied.qty !== expected) throw new ApiError("Jumlah PACK tidak sesuai jumlah tortilla atau roti burger.");
      if (!supplied) input.push({ code, qty: expected });
    }
    const selected = (await resolveItems(tx, input)).filter((item) => item.qty > 0);
    if (!selected.length) throw new ApiError("Isi jumlah bahan baku yang keluar.");
    const costs = body.costs && typeof body.costs === "object" ? body.costs as Record<string, unknown> : {};
    const salary = integer(costs.salary ?? 0, "Gaji");
    const otherCost = integer(costs.otherCost ?? 0, "Lain-lain");
    const grab = integer(costs.grabGofood ?? 0, "Grab/GoFood");
    const qris = integer(costs.qris ?? 0, "QRIS");
    for (const item of selected) {
      if ((item.buy !== undefined && item.buy !== item.material.buy) || (item.sell !== undefined && item.sell !== item.material.sell)) throw new ApiError(`Harga ${item.material.name} sudah berubah. Muat ulang data.`, 409);
    }
    const totalSales = integer(selected.reduce((sum, item) => sum + item.qty * (item.material.sell ?? 0), 0), "Omset");
    const modal = integer(selected.reduce((sum, item) => sum + item.qty * item.material.buy, 0), "Modal");
    await writeStock(tx, actor, number, date, "Penjualan", selected.map((item) => ({ materialCode: item.code, locationKey: location.key, delta: -item.qty, note: "Penjualan" })));
    await tx.insert(schema.transactions).values({ number, date, type: "Penjualan", location: location.name, note: `Penjualan ${location.name}`, total: totalSales }).run();
    const details = selected.map((item) => ({ transactionNumber: number, item: item.material.name, qty: item.qty, price: item.material.sell ?? item.material.buy, activity: `Penjualan ${item.qty} item dari ${location.name}` }));
    const amounts: Array<[string, number, string]> = [
      ["Modal Penjualan", modal, "Modal bahan baku sebagai pengurang laba"],
      ["Gaji Karyawan", salary, "Pengurang laba penjualan"],
      ["Grab/GoFood", grab, "Pengurang cash owner"],
      ["QRIS", qris, "Pengurang cash owner"],
      ["Lain lain", otherCost, "Pengurang laba penjualan"]
    ];
    for (const [item, price, activity] of amounts) if (price > 0) details.push({ transactionNumber: number, item, qty: 1, price, activity });
    await tx.insert(schema.transactionDetails).values(details).run();
    await tx.insert(schema.dailyPerformance).values({ date, kiosk: location.name, omset: totalSales, laba: totalSales - modal - salary - otherCost }).run();
  });
}
