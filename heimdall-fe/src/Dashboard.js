import { useState,useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CF1', '#FF6699'];

  
const Dashboard = () => {

  // const { id } = useParams();

  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get('/dashboard')
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
          {Object.entries(data).map(([site, data], idx) => (
            <div key={site} style={{ marginBottom: '40px' }}>
              <strong>
                <Link to={`/dashboard/site/${encodeURIComponent(site)}`}>{site}</Link>
              </strong>
              <PieChart width={400} height={400}>
                <Pie
                  dataKey="value"
                  nameKey='package'
                  data={data}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  
                  {data.map((entry, index) => (
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