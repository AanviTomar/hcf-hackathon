
import * as XLSX from 'xlsx';
import { MachinePart } from '../types.ts';

export const exportToExcel = (data: MachinePart[]) => {
  const worksheetData = data.map(item => ({
    'Machine Name': item.name,
    'Type': item.type,
    'Material': item.material,
    'Raw Materials': item.rawMaterials,
    'Units': item.units,
    'Last Updated': item.lastUpdated
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");

  const wscols = [
    { wch: 25 }, // Machine Name
    { wch: 20 }, // Type
    { wch: 20 }, // Material
    { wch: 30 }, // Raw Materials
    { wch: 10 }, // Units
    { wch: 20 }, // Last Updated
  ];
  worksheet['!cols'] = wscols;

  XLSX.writeFile(workbook, `Industrial_Inventory_${new Date().toISOString().split('T')[0]}.xlsx`);
};
