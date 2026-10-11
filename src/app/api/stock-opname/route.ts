import * as schema from "@/db/schema";
import { ApiError } from "@/lib/api-access";
import { integer, items, resolveItems, resolveLocation, stockPost, writeStock } from "@/lib/stock-write";

export async function POST(request: Request) {
  return stockPost(request, "Opname", async (tx, body, actor, number, date) => {
    const location = await resolveLocation(tx, body.locationKey, body.locationName);
    if (!Array.isArray(body.items) || body.items.some((item) => !item || typeof item !== "object" || Array.isArray(item))) throw new ApiError("Pilih bahan baku opname.");
    const input = body.items.map((item) => ({ code: item.materialCode, name: item.materialName,
      qty: integer(item.physicalStock, "Stok fisik"), expected: integer(item.systemStock, "Stok sistem", -Number.MAX_SAFE_INTEGER),
      note: typeof item.note === "string" ? item.note.trim().slice(0, 500) : "" }));
    await resolveItems(tx, items(input));
    for (const item of input) if (item.qty !== item.expected && item.note.length < 3) throw new ApiError(`Isi alasan koreksi stok ${item.name}.`);
    const updated = await writeStock(tx, actor, number, date, "Opname", input.map((item) => ({ materialCode: item.code, locationKey: location.key, physical: item.qty, expected: item.expected, note: item.note || "Opname tanpa perubahan stok" })));
    await tx.insert(schema.stockOpnames).values(updated.map((row) => ({ number, date, location: location.name,
      material: input.find((item) => item.code === row.materialCode)!.name, systemStock: row.before,
      physicalStock: row.after, difference: row.delta, officer: actor.name }))).run();
  }, true);
}
