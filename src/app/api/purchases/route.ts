import { inArray, sql } from "drizzle-orm";
import * as schema from "@/db/schema";
import { ApiError } from "@/lib/api-access";
import { integer, items, resolveItems, stockPost, writeStock } from "@/lib/stock-write";

export async function POST(request: Request) {
  return stockPost(request, "Belanja", async (tx, body, actor, number, date) => {
    const selected = (await resolveItems(tx, items(body.items))).filter((item) => item.qty > 0);
    if (!selected.length) throw new ApiError("Isi jumlah bahan baku yang dibeli.");
    const shippingCost = integer(body.shippingCost ?? 0, "Ongkos kirim");
    const subtotal = selected.reduce((total, item) => total + item.qty * integer(item.price, "Harga beli"), 0);
    integer(subtotal + shippingCost, "Total belanja");
    await writeStock(tx, actor, number, date, "Belanja", selected.map((item) => ({ materialCode: item.code, locationKey: "gudang", delta: item.qty, note: "Belanja bahan baku" })));
    await tx.insert(schema.transactions).values({ number, date, type: "Belanja", location: "Gudang Utama",
      note: typeof body.note === "string" && body.note.trim() ? body.note.trim().slice(0, 500) : "Belanja bahan baku", total: subtotal + shippingCost }).run();
    // Only purchased materials may update the master purchase price.
    await tx.update(schema.materials).set({ buy: sql`case ${schema.materials.code} ${sql.join(selected.map((item) => sql`when ${item.code} then ${item.price!}`), sql` `)} else ${schema.materials.buy} end` })
      .where(inArray(schema.materials.code, selected.map((item) => item.code))).run();
    const details = selected.map((item) => ({ transactionNumber: number, item: item.material.name, qty: item.qty, price: item.price!, activity: "Stok gudang bertambah dari transaksi belanja" }));
    if (shippingCost > 0) details.push({ transactionNumber: number, item: "Ongkir", qty: 1, price: shippingCost, activity: "Ongkir tercatat sebagai biaya belanja" });
    await tx.insert(schema.transactionDetails).values(details).run();
    if (shippingCost > 0) {
      const shippingNumber = `BYA-${number.slice(4)}-ONGKIR`;
      await tx.insert(schema.transactions).values({ number: shippingNumber, date, type: "Biaya Lain Lain", location: "Gudang Utama", note: `Ongkos kirim dari ${number}`, total: shippingCost }).run();
      await tx.insert(schema.transactionDetails).values({ transactionNumber: shippingNumber, item: "Ongkos Kirim Belanja", qty: 1, price: shippingCost, activity: `Ongkir otomatis dari transaksi belanja ${number}` }).run();
    }
  });
}
