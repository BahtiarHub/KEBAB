import * as schema from "@/db/schema";
import { ApiError } from "@/lib/api-access";
import { items, resolveItems, resolveLocation, stockPost, writeStock } from "@/lib/stock-write";

export async function POST(request: Request) {
  return stockPost(request, "Distribusi", async (tx, body, actor, number, date) => {
    const destination = await resolveLocation(tx, body.destination, body.destinationName, true);
    const selected = (await resolveItems(tx, items(body.items))).filter((item) => item.qty > 0);
    if (!selected.length) throw new ApiError("Isi jumlah bahan baku yang akan didistribusikan.");
    await writeStock(tx, actor, number, date, "Distribusi", selected.flatMap((item) => [
      { materialCode: item.code, locationKey: "gudang", delta: -item.qty, note: `Distribusi ke ${destination.name}` },
      { materialCode: item.code, locationKey: destination.key, delta: item.qty, note: "Distribusi masuk dari Gudang Utama" }
    ]));
    await tx.insert(schema.transactions).values({ number, date, type: "Distribusi", location: destination.name, note: `Distribusi Gudang Utama ke ${destination.name}`, total: 0 }).run();
    await tx.insert(schema.transactionDetails).values(selected.map((item) => ({ transactionNumber: number, item: item.material.name,
      qty: item.qty, price: 0, activity: "Gudang berkurang, stok tujuan bertambah" }))).run();
  });
}
