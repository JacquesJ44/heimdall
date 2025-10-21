import React, { useEffect, useState } from "react";
import axios from "./AxiosInstance";
import TableExportButtons from "./TableExportButtons";
import { jwtDecode } from "jwt-decode";

const Summary = () => {
  const [summaryData, setSummaryData] = useState([]);
  const [parentSites, setParentSites] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [role, setRole] = useState(null);

  // ✅ Decode role from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setRole(decoded.role);
        // console.log("Decoded role:", decoded.role);
      } catch (err) {
        console.error("Invalid token:", err);
      }
    }
  }, []);

  // Fetch summary data and parent sites
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get("/heimdall/api/summary");
        setSummaryData(res.data);
      } catch (err) {
        setError(err.response?.data?.msg || "Failed to load summary data");
      }
    };

    const fetchParentSites = async () => {
      try {
        const res = await axios.get("/heimdall/api/parent-sites");
        setParentSites(res.data);
      } catch (err) {
        console.error("Failed to load parent sites:", err);
      }
    };

    Promise.all([fetchSummary(), fetchParentSites()]).finally(() =>
      setLoading(false)
    );
  }, []);

  const formatCurrency = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? value : `R${num.toFixed(2)}`;
  };

  // Aggregate sites: parent + self + children
  const aggregateWithChildren = (data, parentMapping) => {
    const siteMap = {};

    // Step 1: Initialize all sites with self data
    data.forEach((s) => {
      if (!siteMap[s.site_name]) {
        siteMap[s.site_name] = {
          site_name: s.site_name,
          parent_site: null,
          total_revenue: 0,
          running_cost: 0,
          net_profit: 0,
          self_revenue: 0,
          self_running: 0,
          self_net: 0,
          children: [],
          isChild: false,
        };
      }

      siteMap[s.site_name].self_revenue += parseFloat(s.total_revenue) || 0;
      siteMap[s.site_name].self_running += parseFloat(s.running_cost) || 0;
      siteMap[s.site_name].self_net += parseFloat(s.net_profit) || 0;
    });

    // Step 2: Assign parent relationships using parentSites mapping
    Object.keys(parentMapping).forEach((parent) => {
      parentMapping[parent].forEach((childName) => {
        if (siteMap[childName]) {
          siteMap[childName].parent_site = parent;
          siteMap[childName].isChild = true;
          if (siteMap[parent]) {
            siteMap[parent].children.push(siteMap[childName]);
          }
        }
      });
    });

    // Step 3: Calculate totals (self + children)
    Object.values(siteMap).forEach((site) => {
      if (site.children.length > 0) {
        site.total_revenue =
          site.self_revenue +
          site.children.reduce((sum, c) => sum + c.total_revenue, 0);
        site.running_cost =
          site.self_running +
          site.children.reduce((sum, c) => sum + c.running_cost, 0);
        site.net_profit =
          site.self_net +
          site.children.reduce((sum, c) => sum + c.net_profit, 0);
      } else {
        // No children → totals = self
        site.total_revenue = site.self_revenue;
        site.running_cost = site.self_running;
        site.net_profit = site.self_net;
      }
    });

    // Step 4: Return only top-level sites (not children)
    return Object.values(siteMap).filter((s) => !s.isChild);
  };

  const aggregatedData = aggregateWithChildren(summaryData, parentSites);

  // ✅ Flattened version for export (matches visual layout)
  const flattenedData = aggregatedData.flatMap((parent) => {
    // If the site has children, include TOTAL, SELF, and CHILDREN
    if (parent.children.length > 0) {
      return [
        {
          site_name: `${parent.site_name} (TOTAL)`,
          total_revenue: parent.total_revenue,
          running_cost: parent.running_cost,
          net_profit: parent.net_profit,
        },
        {
          site_name: `— ${parent.site_name}`,
          total_revenue: parent.self_revenue,
          running_cost: parent.self_running,
          net_profit: parent.self_net,
        },
        ...parent.children.map((child) => ({
          site_name: `— ${child.site_name}`,
          total_revenue: child.total_revenue,
          running_cost: child.running_cost,
          net_profit: child.net_profit,
        })),
      ];
    }

    // If independent (no children), include only itself
    return [
      {
        site_name: parent.site_name,
        total_revenue: parent.total_revenue,
        running_cost: parent.running_cost,
        net_profit: parent.net_profit,
      },
    ];
  });

  // Totals
  const totalRevenue = aggregatedData.reduce(
    (acc, s) => acc + s.total_revenue,
    0
  );
  const totalRunning = aggregatedData.reduce(
    (acc, s) => acc + s.running_cost,
    0
  );
  const totalNet = aggregatedData.reduce((acc, s) => acc + s.net_profit, 0);

  if (loading) return <p>Loading summary...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="mt-4 overflow-x-auto">
      {/* Export Buttons */}
      <TableExportButtons
              data={[
          ...flattenedData,
          {
            site_name: "TOTAL",
            total_revenue: totalRevenue,
            running_cost: totalRunning,
            net_profit: totalNet,
          },
        ]}
        tableType="summary"
        filename={`Summary_${new Date().toISOString().slice(0, 10)}`}
      />

      {/* Table */}
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
          {aggregatedData.map((parent) => (
            <React.Fragment key={parent.site_name}>
              {/* Parent total */}
              {parent.children.length > 0 && (
                <tr className="font-bold bg-gray-100 dark:bg-gray-800">
                  <td className="p-3">{parent.site_name} (TOTAL)</td>
                  <td className="p-3">{formatCurrency(parent.total_revenue)}</td>
                  <td className="p-3">{formatCurrency(parent.running_cost)}</td>
                  <td className="p-3">{formatCurrency(parent.net_profit)}</td>
                </tr>
              )}

              {/* Parent self */}
              {parent.children.length > 0 && (
                <tr key={`${parent.site_name}-self`} className="border-t">
                  <td className="p-3 pl-8">— {parent.site_name}</td>
                  <td className="p-3">{formatCurrency(parent.self_revenue)}</td>
                  <td className="p-3">{formatCurrency(parent.self_running)}</td>
                  <td className="p-3">{formatCurrency(parent.self_net)}</td>
                </tr>
              )}

              {/* Children */}
              {parent.children.map((child) => (
                <tr key={child.site_name} className="border-t">
                  <td className="p-3 pl-8">— {child.site_name}</td>
                  <td className="p-3">{formatCurrency(child.total_revenue)}</td>
                  <td className="p-3">{formatCurrency(child.running_cost)}</td>
                  <td className="p-3">{formatCurrency(child.net_profit)}</td>
                </tr>
              ))}

              {/* Independent site (no children) */}
              {parent.children.length === 0 && !parent.isChild && (
                <tr className="border-t">
                  <td className="p-3">{parent.site_name}</td>
                  <td className="p-3">{formatCurrency(parent.total_revenue)}</td>
                  <td className="p-3">{formatCurrency(parent.running_cost)}</td>
                  <td className="p-3">{formatCurrency(parent.net_profit)}</td>
                </tr>
              )}
            </React.Fragment>
          ))}

          {/* Global totals */}
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
