
import { FileDown, FileSpreadsheet, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { FuelTransaction } from '@/pages/Index';
import { useRef } from 'react';

interface ExportButtonsProps {
  transactions: FuelTransaction[];
  onImportTransactions?: (transactions: FuelTransaction[]) => void;
}

const ExportButtons = ({ transactions, onImportTransactions }: ExportButtonsProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportToExcel = () => {
    const excelData = transactions.map(transaction => ({
      'Ngày': new Date(transaction.date).toLocaleDateString('vi-VN'),
      'Số lít': transaction.amount,
      'Giá/lít (₫)': transaction.pricePerLiter,
      'Tổng tiền (₫)': transaction.totalCost,
      'KM cuối': transaction.lastKmReading || '',
      'KM hiện tại': transaction.kmReading || '',
      'Quãng đường (km)': transaction.kmReading && transaction.lastKmReading ? 
        transaction.kmReading - transaction.lastKmReading : '',
      'Địa điểm': transaction.location || '',
      'Ghi chú': transaction.notes || ''
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Auto-size columns
    const colWidths = [];
    const headers = Object.keys(excelData[0] || {});
    headers.forEach((header, i) => {
      const maxLength = Math.max(
        header.length,
        ...excelData.map(row => String(row[header as keyof typeof row]).length)
      );
      colWidths[i] = { wch: Math.min(maxLength + 2, 50) };
    });
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Lịch sử đổ xăng');
    XLSX.writeFile(wb, `lich-su-do-xang-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Set font (supports Vietnamese)
    doc.setFont('helvetica');
    
    // Title
    doc.setFontSize(16);
    doc.text('LỊCH SỬ ĐỔ XĂNG', 105, 20, { align: 'center' });
    
    // Date
    doc.setFontSize(10);
    doc.text(`Xuất ngày: ${new Date().toLocaleDateString('vi-VN')}`, 20, 30);
    
    // Prepare table data
    const tableData = transactions.map(transaction => [
      new Date(transaction.date).toLocaleDateString('vi-VN'),
      transaction.amount.toString(),
      transaction.pricePerLiter.toLocaleString('vi-VN'),
      transaction.totalCost.toLocaleString('vi-VN'),
      transaction.lastKmReading?.toString() || '',
      transaction.kmReading?.toString() || '',
      (transaction.kmReading && transaction.lastKmReading ? 
        (transaction.kmReading - transaction.lastKmReading).toString() : ''),
      transaction.location || '',
      transaction.notes || ''
    ]);

    // Create table
    (doc as any).autoTable({
      head: [['Ngày', 'Số lít', 'Giá/lít (₫)', 'Tổng tiền (₫)', 'KM cuối', 'KM hiện tại', 'Quãng đường (km)', 'Địa điểm', 'Ghi chú']],
      body: tableData,
      startY: 40,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 20 }, // Ngày
        1: { cellWidth: 15 }, // Số lít
        2: { cellWidth: 20 }, // Giá/lít
        3: { cellWidth: 25 }, // Tổng tiền
        4: { cellWidth: 18 }, // KM cuối
        5: { cellWidth: 20 }, // KM hiện tại
        6: { cellWidth: 20 }, // Quãng đường
        7: { cellWidth: 25 }, // Địa điểm
        8: { cellWidth: 30 }, // Ghi chú
      },
      margin: { top: 40 },
    });

    // Summary
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text('TỔNG KẾT:', 20, finalY);
    
    const totalCost = transactions.reduce((sum, t) => sum + t.totalCost, 0);
    const totalLiters = transactions.reduce((sum, t) => sum + t.amount, 0);
    const averagePrice = totalLiters > 0 ? totalCost / totalLiters : 0;
    
    doc.setFontSize(10);
    doc.text(`Tổng chi phí: ${totalCost.toLocaleString('vi-VN')} ₫`, 20, finalY + 8);
    doc.text(`Tổng số lít: ${totalLiters.toFixed(1)} L`, 20, finalY + 16);
    doc.text(`Giá trung bình: ${averagePrice.toLocaleString('vi-VN')} ₫/L`, 20, finalY + 24);
    
    // Save PDF
    doc.save(`lich-su-do-xang-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleImportExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onImportTransactions) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Skip header row and map data
        const importedTransactions: FuelTransaction[] = [];
        
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (!row || row.length === 0) continue;

          // Parse date - handle different date formats
          let parsedDate = '';
          if (row[0]) {
            const dateValue = row[0];
            if (typeof dateValue === 'number') {
              // Excel date number
              const excelDate = new Date((dateValue - 25569) * 86400 * 1000);
              parsedDate = excelDate.toISOString().split('T')[0];
            } else if (typeof dateValue === 'string') {
              // Try to parse string date
              const date = new Date(dateValue);
              if (!isNaN(date.getTime())) {
                parsedDate = date.toISOString().split('T')[0];
              }
            }
          }

          if (!parsedDate) continue; // Skip rows without valid date

          const transaction: FuelTransaction = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            date: parsedDate,
            amount: parseFloat(row[1]) || 0,
            pricePerLiter: parseFloat(row[2]) || 0,
            totalCost: parseFloat(row[3]) || 0,
            lastKmReading: row[4] ? parseFloat(row[4]) : undefined,
            kmReading: row[5] ? parseFloat(row[5]) : undefined,
            location: row[7] ? String(row[7]) : undefined,
            notes: row[8] ? String(row[8]) : undefined
          };

          // Validate essential fields
          if (transaction.amount > 0 && transaction.pricePerLiter > 0) {
            importedTransactions.push(transaction);
          }
        }

        if (importedTransactions.length > 0) {
          onImportTransactions(importedTransactions);
          console.log(`Đã nhập thành công ${importedTransactions.length} giao dịch`);
        } else {
          console.warn('Không tìm thấy dữ liệu hợp lệ trong file Excel');
        }
      } catch (error) {
        console.error('Lỗi khi đọc file Excel:', error);
      }
    };

    reader.readAsArrayBuffer(file);
    // Reset input value to allow re-importing the same file
    event.target.value = '';
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-3 space-y-2">
      <Button
        onClick={exportToExcel}
        variant="outline"
        className="flex items-center gap-2 text-green-600 border-green-600 hover:bg-green-50 justify-start text-xs h-8 px-3"
        disabled={transactions.length === 0}
        style={{ width: '185px' }}
      >
        <FileSpreadsheet className="w-3 h-3" />
        Xuất Excel
      </Button>

      <Button
        onClick={triggerFileInput}
        variant="outline"
        className="flex items-center gap-2 text-blue-600 border-blue-600 hover:bg-blue-50 justify-start text-xs h-8 px-3"
        style={{ width: '185px' }}
      >
        <Upload className="w-3 h-3" />
        Nhập Excel
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleImportExcel}
        style={{ display: 'none' }}
      />
      
      <Button
        onClick={exportToPDF}
        variant="outline"
        className="flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-50 justify-start text-xs h-8 px-3"
        disabled={transactions.length === 0}
        style={{ width: '185px' }}
      >
        <FileDown className="w-3 h-3" />
        Xuất PDF
      </Button>
    </div>
  );
};

export default ExportButtons;
