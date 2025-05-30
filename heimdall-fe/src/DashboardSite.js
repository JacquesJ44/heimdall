import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from './AxiosInstance'


import Card from "./Card";
import UnitTable from "./UnitTable";
import ActionDropdown from "./ActionDropdown";
import TableExportButtons from "./TableExportButtons";
import POTable from "./POTable";
import ProRataTable from "./ProRataTable";
import FluentLivingTable from "./FluentLivingTable";

const DashboardSite = () => {

    const { id } = useParams(); // this is the site id, like 4%20On%20O
    const [services, setServices] = useState([]);

    const [activeView, setActiveView] = useState("services"); // "services", "po", etc.

    const [poData, setPoData] = useState(null);
    const [prorataData, setProrataData] = useState(null);
    const [fluentLiving, setFluentLiving] = useState(null);

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
      axios.get(`/api/dashboard/site/${id}/po`) // you’ll create this Flask route
        .then(response => {
          setPoData(response.data);
        })
        .catch(error => {
          console.error("Error calculating PO:", error);
        });
      }

    if (action === "prorata") {
      setActiveView("prorata");
      axios.get(`/api/dashboard/site/${id}/prorata`) // you’ll create this Flask route
        .then(response => {
          setProrataData(response.data);
        })
        .catch(error => {
          console.error("Error calculating PO:", error);
        });
      }
      
      if (action === "fluent_living") {
        setActiveView("fluent_living");
        axios.get(`/api/dashboard/site/${id}/fluent_living`) // you’ll create this Flask route
        .then(response => {
          setFluentLiving(response.data);
        })
        .catch(error => {
          console.error("Error retrieving data:", error);
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
                <h3><strong>Site: </strong>{id}</h3>
                <ActionDropdown onActionSelect={handleActionSelect} />
              </div>

                <div className="grid grid-cols-4 gap-4 my-4">
                    <Card title="Total Units" value={services.total} />
                    <Card title="Active Units" value={services.active} />
                    <Card title="Sellthrough percentage" value={`${((services.active / services.total) * 100).toFixed(2)}%`} />
                    <Card title="Active Revenue" value={`R ${services.total_selling}`} />
                </div>

                {activeView === "services" && services.units && ( 
                 <> 
                  <h3 className="mt-8 mb-2 text-lg font-bold">All Services</h3>
                  <TableExportButtons data={services.units} filename={`Services_${id}`} />
                  <UnitTable units={services.units} />
                 </>
                )}

                {activeView === "po_current_month" && poData && (
                 <>
                  <h3 className="mt-8 mb-2 text-lg font-bold">Purchase Order - Current Month</h3>
                  <TableExportButtons data={poData} filename={`PO_${id}`} />
                  <POTable data={poData} />
                 </>
                )}

                {activeView === "prorata" && prorataData && (
                 <>
                  <h3 className="mt-8 mb-2 text-lg font-bold">Pro Rata - Previous Month</h3>
                  <TableExportButtons data={prorataData} filename={`Prorata_${id}`} />
                  <ProRataTable data={prorataData} />
                 </>
                )}

                {activeView === "fluent_living" && fluentLiving && (
                 <>
                  <h3 className="mt-8 mb-2 text-lg font-bold">Fluent Living</h3>
                  <TableExportButtons data={fluentLiving} filename={`FluentLiving_${id}`} />
                  <FluentLivingTable units={fluentLiving} />
                 </>
                )}
            </div>
        </div>
     );
}
 
export default DashboardSite;
