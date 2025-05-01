import { useEffect, useState, Fragment } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Services = () => {

    const [services, setServices] = useState(null);

    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        axios.get('/services')
          .then(response => {
            setServices(response.data);
            // console.log(response.data);
          })
          .catch(error => {
            console.error('Error fetching data:', error);
          });
      }, []);
    
    const [expandedRow, setExpandedRow] = useState(null);
    const toggleRow = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
    };

    const handleDelete = async (serviceId) => {

        try {
            // Make the DELETE request to Flask, including site ID
            await axios.delete('/services/deleteservice', {
            data: { id: serviceId }, // sending ?id=123
      });
          // Show success message
          setShowSuccess(true);

          // Remove the deleted site from the list without reloading
          setServices((prevServices) => prevServices.filter(services => services.id !== serviceId));

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
                                <Link to='/services/addservice' className="btn btn-accent">Add New Service</Link>
                            </div>
                            <table className="table table-lg">
                                <thead>
                                    <tr>
                                        <th>Site</th> 
                                        <th>Unit Number</th>
                                        <th>GPON Serial</th>
                                        <th>ONU Number</th>
                                        <th>Customer Full Name</th>
                                        <th>Contact Number</th>
                                        <th>Email</th>
                                        {/* <th>ONU</th> */}
                                        {/* <th>ONU Model</th>                                         
                                        {/* <th>Light Level</th> */}
                                        {/* <th>PPPoE Username</th> */}
                                        {/* <th>PPPoE Password</th> */}
                                        {/* <th>24GHz SSID</th> */}
                                        {/* <th>24GHz Password</th> */}
                                        {/* <th>5GHz SSID</th> */}
                                        {/* <th>5GHz Password</th> */}
                                        <th>Debit Order Status</th>
                                        <th>Status</th>
                                        {/* <th>Fluent Living</th> */}
                                        {/* <th>Product</th> */}
                                        {/* <th>Activation Date</th> */}
                                        <th>Package</th>
                                        <th>More Actions</th>
                                    </tr>
                                </thead> 
                                <tbody>
                                {services && services.map((service, index) => (
                                    <Fragment key={service.id}>
                                        <tr className="hover">
                                        <td>{service.site_name}</td>
                                        <td>{service.unit_number}</td>
                                        <td>{service.gpon_serial}</td>
                                        <td>{service.onu_number}</td>
                                        <td>{service.customer_fullname}</td>
                                        <td>{service.contact_number}</td>
                                        <td>{service.email}</td>
                                        <td>{service.debit_order_status}</td>
                                        <td>{service.status ? "Active" : "Inactive"}</td>
                                        <td>{service.product_name}</td>
                                        <td>
                                            <details className="dropdown dropdown-left dropdown-end">
                                            <summary className="m-1 btn ">...</summary>
                                            <ul className="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52">
                                                <li><Link to={'/services/editservice/' + service.id}>Edit</Link></li>
                                                <li><button onClick={() => handleDelete(service.id)}>Delete</button></li>
                                            </ul>
                                            </details>
                                        </td>  
                                        <td>
                                            <button
                                            className="btn btn-sm btn-outline"
                                            onClick={() => toggleRow(index)}
                                            >
                                            {expandedRow === index ? "Hide" : "Details"}
                                            </button>
                                        </td>
                                        </tr>
                                        {expandedRow === index && (
                                        <tr>
                                        <td colSpan="100%">
                                        <div className="bg-black p-4 rounded">
                                            <p><strong>ONU Make:</strong> {service.onu_make}</p>
                                            <p><strong>ONU Model:</strong> {service.onu_model}</p>
                                            <p><strong>ONU Serial:</strong> {service.onu_serial}</p>
                                            <p><strong>Light Level:</strong> {service.light_level}</p>
                                            <p>----------</p>
                                            <p><strong>PPPoE Username:</strong> {service.pppoe_un}</p>
                                            <p><strong>PPPoE Password:</strong> {service.pppoe_pw}</p>
                                            <p><strong>2.4GHz SSID:</strong> {service.ssid_24ghz}</p>
                                            <p><strong>2.4GHz Password:</strong> {service.password_24ghz}</p>
                                            <p><strong>5GHz SSID:</strong> {service.ssid_5ghz}</p>
                                            <p><strong>5GHz Password:</strong> {service.password_5ghz}</p>
                                            <p>----------</p>
                                            <p><strong>Fluent Living:</strong> {service.fluent_living ? "Yes" : "No"}</p>
                                            <p><strong>Activation Date:</strong> {service.activation_date ?
                                                                                     new Date(service.activation_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) 
                                                                                    : 'N/A'}</p>
                                            <p><strong>Comments:</strong> {service.comments}</p>
                                        </div>
                                        </td>
                                        </tr>
                                        )}
                                    </Fragment>
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
                                ✅ Services deleted successfully!
                                </div>
                            )}
                        </div>
                    {/* </div> */}
                {/* </div> */}
            {/* </div> */}
        </div>
     );
}
 
export default Services;