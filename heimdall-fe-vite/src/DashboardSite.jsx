import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from './AxiosInstance'
import { jwtDecode } from "jwt-decode";


import Card from "./Card";
import UnitTable from "./UnitTable";
import ActionDropdown from "./ActionDropdown";
import TableExportButtons from "./TableExportButtons";
import POTable from "./POTable";
import ProRataTable from "./ProRataTable";
import FluentLivingTable from "./FluentLivingTable";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const DashboardSite = () => {

    const { id } = useParams(); // this is the site id, like 4%20On%20O
    const [services, setServices] = useState([]);

    const [activeView, setActiveView] = useState("services"); // "services", "po", etc.

    const [poData, setPoData] = useState(null);
    const [prorataData, setProrataData] = useState(null);
    const [fluentLiving, setFluentLiving] = useState(null);

    const [role, setRole] = useState(null);
    const [incomeData, setIncomeData] = useState(null);
    const [incomeLoading, setIncomeLoading] = useState(false);
    const [incomeError, setIncomeError] = useState("");

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

    useEffect(() => {
      axios.get(`/api/dashboard/site/${id}`)
      .then(response => {
        setServices(response.data);
        // console.log(response.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
    }, [id]);
    
    const handleActionSelect = (action) => {
      if (action === "services") {
        setActiveView("services");
      }
      if (action === "po_current_month") {
        setActiveView("po_current_month");
        axios.get(`/api/dashboard/site/${id}/po`)
          .then(response => {
            setPoData(response.data);
          })
          .catch(error => {
            console.error("Error calculating PO:", error);
          });
      }
      if (action === "prorata") {
        setActiveView("prorata");
        axios.get(`/api/dashboard/site/${id}/prorata`)
          .then(response => {
            setProrataData(response.data);
          })
          .catch(error => {
            console.error("Error calculating PO:", error);
          });
      }
      if (action === "fluent_living") {
        setActiveView("fluent_living");
        axios.get(`/api/dashboard/site/${id}/fluent_living`)
          .then(response => {
            setFluentLiving(response.data);
          })
          .catch(error => {
            console.error("Error retrieving data:", error);
          });
      }
      if (action === "income_12mo") {
        setActiveView("income_12mo");
        setIncomeLoading(true);
        setIncomeData(null);
        setIncomeError("");
        axios.get(`/api/dashboard/site/${id}/income`)
          .then(response => {
            setIncomeData(response.data);
            setIncomeLoading(false);
          })
          .catch(error => {
            setIncomeLoading(false);
            setIncomeData(null);
            setIncomeError(error?.response?.data?.msg || "Unable to load income data. Please refresh and try again.");
            console.error("Error fetching income data:", error);
          });
      }
      if (!services || !services.units) {
        return <div>Loading site data...</div>;
      }
    };

    return ( 
        <div className="min-h-screen bg-base-100 p-4">
            <div className="card w-full shadow-2xl bg-base-200 p-6">

              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-black tracking-tight text-gray-900 dark:text-gray-100 leading-tight">
                  {id}
                </h3>
                {/* Only show ActionDropdown for admin/superadmin */}
                {(role === 'admin' || role === 'superadmin') && (
                  <ActionDropdown onActionSelect={handleActionSelect} />
                )}
              </div>

                <div className="grid grid-cols-4 gap-4 my-4">
                    <Card title="Total Units" value={services.total} />
                    <Card title="Active Units" value={services.active} />
                    <Card title="Sellthrough percentage" value={`${((services.active / services.total) * 100).toFixed(2)}%`} />
                    <Card title="Active Revenue *" value={`R ${role === "client" ? services.total_cost : services.total_selling}`} />
                    <div></div>
                    <div></div>
                    <div></div>
                    <div style={{ fontSize: '0.75em', color: '#888'}}>
                      <p>*Suspended/Exempt services not included</p>
                      <p>*All pricing is EX VAT</p>
                    </div>
                </div>

                {activeView === "services" && services.units && ( 
                 <> 
                  <h3 className="mt-8 mb-2 text-lg font-bold">All Services</h3>
                  <TableExportButtons data={services.units} filename={`Services_${id}`} tableType="unit" siteName={services.units[0].site_name} />
                  <UnitTable units={services.units} />
                 </>
                )}

                {activeView === "po_current_month" && poData && (
                 <>
                  <h3 className="mt-8 mb-2 text-lg font-bold">Purchase Order - Current Month</h3>
                  <TableExportButtons data={poData} filename={`PO_${id}`} tableType="po" siteName={services.units[0].site_name} />
                  <POTable data={poData} />
                 </>
                )}

                {activeView === "prorata" && prorataData && (
                 <>
                  <h3 className="mt-8 mb-2 text-lg font-bold">Pro Rata - Previous Month</h3>
                  <TableExportButtons data={prorataData} filename={`Prorata_${id}`} tableType="prorata" siteName={services.units[0].site_name} />
                  <ProRataTable data={prorataData} />
                 </>
                )}

                {activeView === "fluent_living" && fluentLiving && (
                 <>
                  <h3 className="mt-8 mb-2 text-lg font-bold">Fluent Living</h3>
                  <TableExportButtons data={fluentLiving} filename={`FluentLiving_${id}`} tableType="wifi" siteName={services.units[0].site_name} />
                  <FluentLivingTable units={fluentLiving} />
                 </>
                )}

                {activeView === "income_12mo" && (
                <div className="mt-8">
                  <h3 className="mb-4 text-lg font-bold">Income (Last 12 Months)</h3>

                  {incomeLoading && <div>Loading income data...</div>}

                  {!incomeLoading && incomeData && (
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-4">
                      <ResponsiveContainer width="100%" height={320}>
                        <LineChart
                          data={
                            incomeData.map((d, i, arr) => ({
                              ...d,
                              delta: i === 0 ? 0 : d.income - arr[i - 1].income
                            }))
                          }
                          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />

                          <XAxis
                            dataKey={(d) =>
                              `${d.month.toString().padStart(2, "0")}/${d.year}`
                            }
                            tick={{ fontSize: 12 }}
                            minTickGap={10}
                          />

                          <YAxis
                            domain={[
                              (dataMin) => Math.floor(dataMin * 0.95),
                              (dataMax) => Math.ceil(dataMax * 1.05)
                            ]}
                            tickFormatter={(v) => `R${v.toLocaleString()}`}
                            tick={{ fontSize: 12 }}
                            tickCount={7}
                          />

                          <Tooltip
                            labelStyle={{ color: "#111827", fontWeight: 600 }}
                            formatter={(value, name) => {
                              if (name === "Change") {
                                const sign = value >= 0 ? "+" : "";
                                return [`${sign}R${Number(value).toFixed(2)}`, name];
                              }
                              return [`R${Number(value).toFixed(2)}`, name];
                            }}
                            labelFormatter={(label) => `Month: ${label}`}
                          />

                          {/* Total Income */}
                          <Line
                            type="monotone"
                            dataKey="income"
                            name="Income"
                            stroke="#0088FE"
                            strokeWidth={3}
                            dot={{ r: 4 }}
                          />

                          {/* Month-to-month Change
                          <Line
                            type="linear"
                            dataKey="delta"
                            name="Change"
                            stroke="#FF8042"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                          /> */}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {!incomeLoading && !incomeData && (
                    <div>{incomeError || "No income data found."}</div>
                  )}
                </div>
              )}
            </div>
        </div>
     );
}
 
export default DashboardSite;
