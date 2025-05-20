import { useEffect, useState, Fragment } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Services = () => {
    
    const [services, setServices] = useState([]);
    
    const [showSuccess, setShowSuccess] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState(null);

    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        axios.get('/api/services')
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
    
    const searchableFields = ['site_name', 'unit_number', 'gpon_serial', 'onu_number', 'customer_fullname'];
    const filteredServices = services.filter(service =>
        searchableFields.some(field =>
          (service[field] || '').toLowerCase().includes(searchQuery.toLowerCase())
        )
      );

    const handleDelete = async (serviceId) => {
        setShowModal(false);

        try {
            // Make the DELETE request to Flask, including site ID
            await axios.delete('/api/services/deleteservice', {
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
        <div className="min-h-screen bg-base-100 p-4">
            <div className="card w-full shadow-2xl bg-base-200 p-6">

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-5 gap-4">
                    {/* Search Bar with Clear Button */}
                    <div className="relative w-full sm:max-w-xs">
                        <input
                        type="text"
                        placeholder="Search services..."
                        className="input input-bordered w-full pr-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-800"
                        >
                            ✕
                        </button>
                        )}
                    </div>

                    {/* Add New Service Button */}
                    <Link to="/services/addservice" className="btn btn-accent w-full sm:w-auto">
                        Add New Service
                    </Link>
                </div>
                
                <table className="table w-full text-sm">
                    <thead>
                        <tr>
                            <th>Site</th> 
                            <th>Unit Number</th>
                            <th>GPON Serial</th>
                            <th>ONU Number</th>
                            <th>Customer Full Name</th>
                            {/* <th>Contact Number</th> */}
                            {/* <th>Email</th> */}
                            <th>Debit Order Status</th>
                            <th>Status</th>
                            <th>Package</th>
                            <th>Details</th>
                            <th>More Actions</th>
                        </tr>
                    </thead> 
                    <tbody>
                    {filteredServices && filteredServices.map((service, index) => (
                        <Fragment key={service.id}>
                            <tr className="hover">
                            <td>{service.site_name}</td>
                            <td>{service.unit_number}</td>
                            <td>{service.gpon_serial}</td>
                            <td>{service.onu_number}</td>
                            <td>{service.customer_fullname}</td>
                            {/* <td>{service.contact_number}</td> */}
                            {/* <td>{service.email}</td> */}
                            <td>{service.debit_order_status}</td>
                            <td>
                                <span
                                    className={`px-2 py-1 rounded-full text-sm font-semibold border ${
                                    service.status
                                        ? "text-green-600 border-green-600"
                                        : "text-red-600 border-red-600"
                                    }`}
                                >
                                    {service.status ? "Active" : "Inactive"}
                                </span>
                            </td>
                            <td>{service.product_name}</td>
                            
                            <td>
                                <button
                                className="btn btn-sm btn-outline"
                                onClick={() => toggleRow(index)}
                                >
                                {expandedRow === index ? "Hide" : "Details"}
                                </button>
                            </td>

                            <td>
                                <details className="dropdown dropdown-right dropdown-end">
                                <summary className="m-1 btn ">...</summary>
                                <ul className="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52">
                                    <li><Link to={'/services/editservice/' + service.id}>Edit</Link></li>
                                    <li><button onClick={() => { setShowModal(true); setServiceToDelete(service.id) }}>Delete</button></li>
                                </ul>
                                </details>
                            </td>  

                            
                            </tr>
                                {expandedRow === index && (
                                <tr>
                                    <td colSpan="100%">
                                    <div className="bg-white dark:bg-gray-900 p-4 rounded text-right">
                                        <p><strong>Site:</strong> {service.site_name}</p>
                                        <p><strong>Unit Number:</strong> {service.unit_number}</p>
                                        <p><strong>Name:</strong> {service.customer_fullname}</p>
                                        <p><strong>Contact Number:</strong> {service.contact_number}</p>
                                        <p><strong>Email:</strong> {service.email}</p>
                                        <p>---------------</p>
                                        <p><strong>ONU Make:</strong> {service.onu_make}</p>
                                        <p><strong>ONU Model:</strong> {service.onu_model}</p>
                                        <p><strong>ONU Serial:</strong> {service.onu_serial}</p>
                                        <p><strong>Light Level:</strong> {service.light_level}</p>
                                        <p>---------------</p>
                                        <p><strong>PPPoE Username:</strong> {service.pppoe_un}</p>
                                        <p><strong>PPPoE Password:</strong> {service.pppoe_pw}</p>
                                        <p><strong>2.4GHz SSID:</strong> {service.ssid_24ghz}</p>
                                        <p><strong>2.4GHz Password:</strong> {service.password_24ghz}</p>
                                        <p><strong>5GHz SSID:</strong> {service.ssid_5ghz}</p>
                                        <p><strong>5GHz Password:</strong> {service.password_5ghz}</p>
                                        <p>---------------</p>
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

                {/* Modal */}
                {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h3 className="text-lg font-semibold mb-4">Are you sure?</h3>
                        <div className="flex justify-end gap-4">
                        <button
                            onClick={() => setShowModal(false)}
                            className="btn btn-accent"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => handleDelete(serviceToDelete)}
                            className="btn btn-warning"
                        >
                            Yes, delete it
                        </button>
                        </div>
                    </div>
                </div>
                )}

                {showSuccess && (
                    <div style={{
                    padding: '10px',
                    marginTop: '10px',
                    backgroundColor: '#d4edda',
                    color: '#155724',
                    border: '1px solid #c3e6cb',
                    borderRadius: '5px'
                    }}>
                    ✅ Service deleted successfully!
                    </div>
                )}
            </div>
        </div>
     );
}
 
export default Services;