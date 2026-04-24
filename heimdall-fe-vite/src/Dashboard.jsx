import { useState,useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from './AxiosInstance'
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Plus, Minus } from "lucide-react";


const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CF1', '#FF6699', '#B22222'];

  
const Dashboard = () => {

  // const { id } = useParams();

  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get('/api/dashboard')
    .then(response => {
      setData(response.data);
      // console.log(response.data);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
  }, []);

  return (
<> 
  <div className="min-h-screen bg-base-100 p-4">
    <div className="card w-full shadow-2xl bg-base-200 p-6">
      {/* <div className="card-body"> */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-20" >
          {Object.entries(data).map(([site, siteData], idx) => (
            <div key={site} style={{ marginBottom: '40px' }}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-xl font-black tracking-tight text-gray-900 dark:text-gray-100 leading-tight">
                    {site}
                  </h3>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      title="New signups in the last 30 days (based on activation date)."
                      className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 dark:border-green-700/40 dark:bg-green-900/20 dark:text-green-300"
                    >
                      <Plus className="w-3 h-3" />
                      {siteData.newSignupsLast30 ?? 0}
                    </span>
                    <span
                      title="Cancellations in the last 30 days (based on status changes to Inactive)."
                      className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 dark:border-red-700/40 dark:bg-red-900/20 dark:text-red-300"
                    >
                      <Minus className="w-3 h-3" />
                      {siteData.cancellationsLast30 ?? 0}
                    </span>
                  </div>
                </div>

                <Link
                  to={`/dashboard/site/${encodeURIComponent(site)}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:border-green-500 hover:text-green-700 transition-colors duration-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                >
                  More info
                  {/* <CircleArrowRight className="w-4 h-4" /> */}
                </Link>
              </div>
              <PieChart width={400} height={400}>
                <Pie
                  dataKey="value"
                  nameKey='package'
                  data={siteData.chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  
                  {siteData.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </div>
          ))}
      {/* </div> */}
      </div>
    </div>
  </div>
</>
  );
};

export default Dashboard;