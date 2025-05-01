import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Sites = () => {

    const [sites, setSites] = useState(null);

    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        axios.get('/sites')
          .then(response => {
            setSites(response.data);
            // console.log(response.data);
          })
          .catch(error => {
            console.error('Error fetching data:', error);
          });
      }, []);

    const handleDelete = async (siteId) => {

        try {
            // Make the DELETE request to Flask, including site ID
            await axios.delete('/sites/deletesite', {
            data: { id: siteId }, // sending ?id=123
      });
          // Show success message
          setShowSuccess(true);

          // Remove the deleted site from the list without reloading
          setSites((prevSites) => prevSites.filter(site => site.id !== siteId));

          // Wait 1.5 seconds before reloading
          setTimeout(() => {
          setShowSuccess(false);
          }, 1500);
        } catch (err) {
          console.error('Could not delete site', err);
          alert('Could not delete site.');
        }
      };

    return ( 
        <div className="h-screen flex items-center justify-center">
            {/* <div className="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-200"> */}
                {/* <div className="card-body"></div> */}
                    {/* <div className="flex font-sans"> */}
                        <div className="overflow-x-auto">
                            <div className="flex justify-end max-w mb-5">
                                <Link to='/sites/addsite' className="btn btn-accent">Add New Site</Link>
                            </div>
                            <table className="table table-lg">
                                <thead>
                                    <tr>
                                        <th>Name</th> 
                                        <th>Street</th> 
                                        <th>Suburb</th> 
                                        <th>More Actions</th>
                                    </tr>
                                </thead> 
                                <tbody>
                                    {sites && sites.map((site) => (
                                        <tr key={site.id}>
                                            <td>{site.name}</td>
                                            <td>{site.street}</td>
                                            <td>{site.suburb}</td>
                                            <td>
                                                <details className="dropdown dropdown-left dropdown-end">
                                                <summary className="m-1 btn ">...</summary>
                                                <ul className="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52">
                                                    <li><Link to={'/sites/editsite/' + site.id}>Edit</Link></li>
                                                    <li><button onClick={() => handleDelete(site.id)}>Delete</button></li>
                                                </ul>
                                                </details>
                                            </td>    
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {showSuccess && (
                                <div style={{
                                padding: '10px',
                                marginTop: '10px',
                                backgroundColor: '#d4edda',
                                color: '#155724',
                                border: '1px solid #c3e6cb',
                                borderRadius: '5px'
                                }}>
                                ✅ Site deleted successfully!
                                </div>
                            )}
                        </div>
                    {/* </div> */}
                {/* </div> */}
            {/* </div> */}
        </div>
    );
};
 
export default Sites;