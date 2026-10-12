// Escape CSV values and neutralize spreadsheet formulas, including leading whitespace.
export function csvCell(value: unknown): string {
  let text = value == null ? "" : String(value);
  // Control characters are intentional: spreadsheet formulas may follow tabs or whitespace.
  // eslint-disable-next-line no-control-regex
  if (/^[\s\u0000-\u001f]*[=+@-]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}
export function csvRow(values: unknown[]): string {
  return values.map(csvCell).join(",") + "\r\n";
}
export function businessCSV(orders: any[], inventory: any[]): string {
  let csv =
    "\uFEFF" +
    csvRow(["ATLAS ERP business report"]) +
    csvRow(["Orders"]) +
    csvRow(["Invoice", "Customer", "Status", "Date", "Total"]);
  orders.forEach((o) => {
    csv += csvRow([
      o.invoiceNum,
      o.customer?.shopName,
      o.orderStatus,
      o.orderedDate,
      Number(o.totalAmount).toFixed(2),
    ]);
  });
  csv +=
    csvRow([]) +
    csvRow(["Inventory"]) +
    csvRow([
      "Item ID",
      "Brand",
      "Model",
      "Category",
      "Part number",
      "Quantity",
      "Minimum",
    ]);
  inventory.forEach((i) => {
    csv += csvRow([
      i.itemId,
      i.item?.brand,
      i.item?.model,
      i.item?.category,
      i.item?.partNumber,
      i.currentQuantity,
      i.minimumStockLevel,
    ]);
  });
  return csv;
}
export function downloadCSV(csv: string, filename: string) {
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8;" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
export const cents = (amount: number) => Math.round(Number(amount) * 100);
export const sumMoney = (amounts: number[]) =>
  amounts.reduce((s, n) => s + cents(n), 0) / 100;
