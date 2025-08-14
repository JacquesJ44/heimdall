import React, { useEffect, useState } from "react";
import { useParams,  useNavigate } from "react-router-dom";
import axios from "./AxiosInstance";

const AssignSites = () => {
  const { id } = useParams();
  const [sites, setSites] = useState([]);
  const [assigned, setAssigned] = useState([]);

  let navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    // Get all sites
    axios.get("/heimdall/api/sites").then((res) => setSites(res.data));
    // Get sites this user already has access to
    axios.get(`/heimdall/api/register/users/${id}/sites`).then((res) =>
      setAssigned(res.data.map((s) => s.id))
    );
  }, [id]);

  const toggleSite = (siteId) => {
    setAssigned((prev) =>
      prev.includes(siteId)
        ? prev.filter((id) => id !== siteId)
        : [...prev, siteId]
    );
  };

  const handleSave = () => {

    try {
        axios.post(`/heimdall/api/register/users/${id}/sites`, { site_ids: assigned })

        // Show success message
          setShowSuccess(true);

          // Wait 1.5 seconds before reloading
          setTimeout(() => {
            // window.location.reload();   
            navigate('/dashboard');
          }, 1500);
        } catch (error) {
          alert(error.response.data.msg);
        }
    }
  

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Assign Sites</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {sites.map((site) => (
          <label key={site.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={assigned.includes(site.id)}
              onChange={() => toggleSite(site.id)}
              className="checkbox"
            />
            <span>{site.name}</span>
          </label>
        ))}
      </div>
      <button className="btn btn-accent mt-6" onClick={handleSave}>
        Save
      </button>
      {showSuccess && (
                        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-green-100 text-green-800 border border-green-300 rounded px-6 py-3 shadow-lg z-50">
                        ✅ Sites Assigned!
                        </div>
                            )}
    </div>
  );
};

export default AssignSites;
