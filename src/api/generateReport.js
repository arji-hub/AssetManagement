import ExcelJS from "exceljs";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { assets } = req.body; // array of asset objects from your frontend

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Assets");

  sheet.columns = [
    { header: "Asset Name", key: "name", width: 25 },
    { header: "Category",   key: "category", width: 20 },
    { header: "Status",     key: "status", width: 15 },
    { header: "Room",       key: "room", width: 15 },
  ];

  assets.forEach((a) => sheet.addRow(a));

  const buffer = await workbook.xlsx.writeBuffer();

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", 'attachment; filename="assets-report.xlsx"');
  res.send(Buffer.from(buffer));
}