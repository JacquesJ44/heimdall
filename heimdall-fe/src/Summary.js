import React, { useEffect, useState } from "react";
import axios from "./AxiosInstance";

const Summary = () => {
  const [summaryData, setSummaryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get("/api/summary");
        setSummaryData(res.data);
      } catch (err) {
        setError(err.response?.data?.msg || "Failed to load summary data");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Totals
  const totalRevenue = summaryData.reduce((acc, s) => acc + s.total_revenue, 0);
  const totalRunning = summaryData.reduce((acc, s) => acc + s.running_cost, 0);
  const totalNet = summaryData.reduce((acc, s) => acc + s.net_profit, 0);

  if (loading) return <p>Loading summary...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="min-w-full bg-white dark:bg-gray-900 rounded-2xl shadow">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-900 text-left">
            <th className="p-3">Site</th>
            <th className="p-3">Revenue</th>
            <th className="p-3">Running Cost</th>
            <th className="p-3">Net Profit</th>
          </tr>
        </thead>
        <tbody>
          {summaryData.map((s, idx) => (
            <tr key={idx} className="border-t">
              <td className="p-3">{s.site_name}</td>
              <td className="p-3">{formatCurrency(s.total_revenue)}</td>
              <td className="p-3">{formatCurrency(s.running_cost)}</td>
              <td className="p-3">{formatCurrency(s.net_profit)}</td>
            </tr>
          ))}
          {/* Totals Row */}
          <tr className="font-bold bg-gray-50 dark:bg-gray-900">
            <td className="p-3">TOTAL</td>
            <td className="p-3">{formatCurrency(totalRevenue)}</td>
            <td className="p-3">{formatCurrency(totalRunning)}</td>
            <td className="p-3">{formatCurrency(totalNet)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Summary;
