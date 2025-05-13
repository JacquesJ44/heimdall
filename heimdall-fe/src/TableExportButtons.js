import { CSVLink } from "react-csv";
import * as XLSX from "xlsx";

const TableExportButtons = ({ data, filename }) => {
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const exportToPDF = async () => {
    const jsPDF = (await import("jspdf")).default;
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF();
    const headers = Object.keys(data[0] || {});
    const rows = data.map((row) => headers.map((key) => row[key]));

    autoTable(doc, {
      head: [headers],
      body: rows,
    });

    doc.save(`${filename}.pdf`);
  };

  return (
    <div className="flex gap-2 mb-4">
      <CSVLink
        data={data}
        filename={`${filename}.csv`}
        className="btn btn-sm btn-primary"
      >
        Export CSV
      </CSVLink>
      <button onClick={exportToExcel} className="btn btn-sm btn-success">
        Export Excel
      </button>
      <button onClick={exportToPDF} className="btn btn-sm btn-error">
        Export PDF
      </button>
    </div>
  );
};

export default TableExportButtons;