import { CSVLink } from "react-csv";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const formatDate = (value) => {
  const date = new Date(value);
  return isNaN(date)
    ? value
    : date.toLocaleDateString("en-ZA", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const formatCurrency = (value) => {
  const num = parseFloat(value);
  return isNaN(num) ? value : `R${num.toFixed(2)}`;
};

// Header + formatting rules per table type
const tableConfigs = {
  unit: {
    title: "Unit Report",
    headers: [
      { key: "unit_number", label: "Unit" },
      { key: "status", label: "Status" },
      { key: "activation_date", label: "Activation Date", format: formatDate },
      { key: "package", label: "Package" },
      { key: "cost_price", label: "Cost Price", format: formatCurrency },
      { key: "selling_price", label: "Selling Price", format: formatCurrency },
      { key: "site_name", label: "Site" },
    ],
    includeTotal: false,
  },
  po: {
    title: "Purchase Order",
    headers: [
      { key: "package", label: "Package" },
      { key: "cost_price", label: "Cost Price", format: formatCurrency },
      { key: "count", label: "Count" },
      { key: "total", label: "Total", format: formatCurrency },
    ],
    includeTotal: true,
    totalField: "total",
  },
  prorata: {
    title: "Pro Rata Report",
    headers: [
      { key: "unit", label: "Unit" },
      { key: "activation_date", label: "Activation Date", format: formatDate },
      { key: "active_days", label: "Active Days" },
      { key: "cost_price", label: "Cost Price", format: formatCurrency },
      { key: "prorata_amount", label: "Pro Rata Amount", format: formatCurrency },
      { key: "package", label: "Package" },
    ],
    includeTotal: true,
    totalField: "total",
    totalFieldAlt: "prorata_amount",
  },
  wifi: {
    title: "WiFi Credentials",
    headers: [
      { key: "customer_fullname", label: "Customer" },
      { key: "unit_number", label: "Unit" },
      { key: "package", label: "Package" },
      { key: "ssid_5ghz", label: "SSID (5GHz)" },
      { key: "password_5ghz", label: "Password (5GHz)" },
      { key: "ssid_24ghz", label: "SSID (2.4GHz)" },
      { key: "password_24ghz", label: "Password (2.4GHz)" },
      { key: "site_name", label: "Site" },
    ],
    includeTotal: false,
  },
  summary: {
    title: "Summary Report",
    headers: [
      { key: "site_name", label: "Site" },
      { key: "total_revenue", label: "Revenue", format: formatCurrency },
      { key: "running_cost", label: "Running Cost", format: formatCurrency },
      { key: "net_profit", label: "Net Profit", format: formatCurrency },
    ],
    includeTotal: true,      // optional: totals row
    // totalField: "total_revenue", // if you want to sum a field automatically
  },
};

const TableExportButtons = ({ data = [], filename = "export", tableType, siteName }) => {
  if (!data.length || !tableConfigs[tableType]) return null;

  const { headers, includeTotal, totalField, totalFieldAlt } = tableConfigs[tableType];

  const formatRow = (row) => {
    const formatted = {};
    headers.forEach(({ key, label, format }) => {
      const val = row[key];
      formatted[label] = format ? format(val) : val;
    });
    return formatted;
  };

  const formattedData = data.map(formatRow);

  const getTotalRow = () => {
    const key = totalFieldAlt || totalField;
    const total = data.reduce((acc, row) => acc + (parseFloat(row[key]) || 0), 0);

    const totalRow = {};
    headers.forEach(({ key, label }) => {
      totalRow[label] = key === key && (key === totalField || key === totalFieldAlt)
        ? formatCurrency(total)
        : "";
    });

    return totalRow;
  };

  const exportToExcel = () => {
    const exportData = [...formattedData];
    if (includeTotal) exportData.push(getTotalRow());

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape", // "portrait" is default
      unit: "mm",               // measurement units
      format: "a4",             // page size
    });

    const { title, headers } = tableConfigs[tableType];

    // Grab site_name if available in the dataset
    const siteDisplayName =
      siteName || data[0]?.site_name ? ` – ${siteName || data[0]?.site_name}` : "";

    const currentDate = new Date().toLocaleDateString("en-ZA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    // Heading + date
    doc.setFontSize(14);
    doc.text(`${title}${siteDisplayName}`, 14, 15);
    doc.setFontSize(10);
    doc.text(currentDate, 196, 15, { align: "right" });

    // Build table body
    const body = [...formattedData.map((row) => headers.map((h) => row[h.label]))];
    if (includeTotal) {
      const totalRow = getTotalRow();
      body.push(headers.map((h) => totalRow[h.label] || ""));
    }

    // Table below heading
    autoTable(doc, {
      head: [headers.map((h) => h.label)],
      body,
      startY: 25,
    });

    doc.save(`${filename}.pdf`);
  };


  return (
    <div className="flex gap-2 mb-4">
      <CSVLink
        data={includeTotal ? [...formattedData, getTotalRow()] : formattedData}
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
