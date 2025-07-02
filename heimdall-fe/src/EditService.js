import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from './AxiosInstance'

const EditService = () => {

    const { id } = useParams();

    const [site_id, setSite] = useState('');
    const [unit_number, setUnitNumber] = useState('');
    const [onu_make, setOnuMake] = useState('');
    const [onu_model, setOnuModel] = useState('');
    const [onu_serial, setOnuSerial] = useState('');
    const [gpon_serial, setGponSerial] = useState('');
    const [onu_number, setOnuNumber] = useState('');
    const [status, setStatus] = useState('');
    const [light_level, setLightLevel] = useState('');
    const [pppoe_un, setPppoe_un] = useState('');
    const [pppoe_pw, setPppoe_pw] = useState('');
    const [ssid_24ghz, setTwoFourGhzSsid] = useState('');
    const [password_24ghz, setTwoFourGhzPassword] = useState('');
    const [ssid_5ghz, setFiveGhzSsid] = useState('');
    const [password_5ghz, setFiveGhzPassword] = useState('');
    const [customer_fullname, setCustomerFullName] = useState('');
    const [contact_number, setContactNumber] = useState('');
    const [email, setEmail] = useState('');
    const [debit_order_status, setDebitOrderStatus] = useState('');
    const [fluent_living, setFluentLiving] = useState('');
    const [product_id, setProduct] = useState('');
    const [activation_date, setActivationDate] = useState('');
    const [comments, setComments] = useState('');

    const [showSuccess, setShowSuccess] = useState(false)
    
    // These two variablea are to populate the 'sites' and 'products' dropdowns
    const [sites, setSites] = useState([]);
    const [products, setProducts] = useState([]);
    const [debitOrderStatuses] = useState(['Not Applied Yet', 'Not Done', 'Done', 'Done and Live']);
    const [statuses] = useState(['Active', 'Inactive', 'Suspended']);

    let navigate = useNavigate()

    useEffect(() => {
        axios.get(`/heimdall/api/services/editservice/${id}`)
          .then(response => {
            const data = response.data;
            // console.log(data);
            setSite(data.site_id);
            setUnitNumber(data.unit_number);
            setOnuMake(data.onu_make);
            setOnuModel(data.onu_model);
            setOnuSerial(data.onu_serial);
            setGponSerial(data.gpon_serial);
            setOnuNumber(data.onu_number);
            setStatus(data.status);
            setLightLevel(data.light_level);
            setPppoe_un(data.pppoe_un);
            setPppoe_pw(data.pppoe_pw);
            setTwoFourGhzSsid(data.ssid_24ghz);
            setTwoFourGhzPassword(data.password_24ghz);
            setFiveGhzSsid(data.ssid_5ghz);
            setFiveGhzPassword(data.password_5ghz);
            setCustomerFullName(data.customer_fullname);
            setContactNumber(data.contact_number);
            setEmail(data.email);
            setDebitOrderStatus(data.debit_order_status);
            setFluentLiving(data.fluent_living);
            setActivationDate(data.activation_date);
            setProduct(data.product_id);
            setComments(data.comments);
          })
          .catch(error => {
            console.error('Error fetching data:', error);
          });

          // Get all sites
        axios.get('/heimdall/api/sites')
        .then((res) => {
            setSites(res.data);
            // console.log(res.data);
        })
        .catch(error => console.log(error));

        // Get all products
        axios.get('/heimdall/api/products')
        .then((res) => {
            setProducts(res.data);
            // console.log(res.data);
        })
        .catch(error => console.log(error));
      }, [id]);

    const handleSubmit = async e => {
        e.preventDefault();
        try {
          const response = await axios.put(`/heimdall/api/services/editservice/${id}`, { site_id, unit_number, onu_make, onu_model, onu_serial, gpon_serial, onu_number, status: status ? status : 0, light_level, pppoe_un, pppoe_pw, ssid_24ghz, password_24ghz, ssid_5ghz, password_5ghz, customer_fullname, contact_number, email, debit_order_status, fluent_living: fluent_living ? fluent_living : 0, activation_date: status === true ? activation_date : null, comments, product_id });
        //   console.log(response);
          // Check for successful update or no changes made
        if (response.status === 404) {
            alert("No changes were made.");
        } else {
            setShowSuccess(true);
            setTimeout(() => {
                navigate('/services');
            }, 1500);
        }
    } catch (error) {
        alert(error.response.data.error);
    }
      };

    // Format a full date string to yyyy-MM-dd
    const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return ""; // avoid invalid dates
    return date.toISOString().split("T")[0]; // "2025-04-27"
    };

    return ( 
        <div className="h-screen flex items-center justify-center">
            <div className="card flex-shrink-0 w-full max-w-6xl shadow-2xl bg-base-200">
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        {/* 4 columns */}
                        <div className="grid grid-cols-4 gap-8">
                            
                            {/* COLUMN 1 */}
                            <div className="flex flex-col">
                                <div className="form-control mt-4">
                                <label className="label">
                                    <span className="label-text">Site</span>
                                </label>
                                <select
                                    className="select select-bordered"
                                    value={site_id}
                                    onChange={(e) => setSite(e.target.value)}
                                    required>
                                    <option value="">Select Site</option>
                                    {sites.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                                </div>
                                    
                                <div className="form-control mt-4">
                                <label className="label">
                                    <span className="label-text">Unit Number</span>
                                </label>
                                <input
                                    className="input input-bordered"
                                    type="text"
                                    required
                                    value={unit_number}
                                    onChange={(e) => setUnitNumber(e.target.value)}
                                />
                                </div>

                                <div className="form-control mt-4">
                                <label className="label">
                                    <span className="label-text">ONU</span>
                                </label>
                                <input
                                    className="input input-bordered"
                                    type="text"
                                    required
                                    value={onu_make}
                                    onChange={(e) => setOnuMake(e.target.value)}
                                />
                                </div>

                                <div className="form-control mt-4">
                                    <label className="label">
                                        <span className="label-text">ONU Model</span>
                                    </label>
                                    <input
                                        className="input input-bordered"
                                        type="text"
                                        required
                                        value={onu_model}
                                        onChange={(e) => setOnuModel(e.target.value)}
                                    />
                                </div>

                                <div className="form-control mt-4">
                                    <label className="label">
                                        <span className="label-text">ONU Serial Number</span>
                                    </label>
                                    <input
                                        className="input input-bordered"
                                        type="text"
                                        required
                                        value={onu_serial}
                                        onChange={(e) => setOnuSerial(e.target.value)}
                                    />
                                </div>

                                <div className="form-control mt-4">
                                    <label className="label">
                                        <span className="label-text">GPON Serial Number</span>
                                    </label>
                                    <input
                                        className="input input-bordered"
                                        type="text"
                                        value={gpon_serial}
                                        onChange={(e) => setGponSerial(e.target.value)}
                                    />
                                </div>

                                <div className="form-control mt-4">
                                    <label className="label">
                                        <span className="label-text">ONU Number</span>
                                    </label>
                                    <input
                                        className="input input-bordered"
                                        type="text"
                                        value={onu_number}
                                        onChange={(e) => setOnuNumber(e.target.value)}
                                    />
                                </div>

                                <div className="form-control mt-4">
                                    <label className="label">
                                        <span className="label-text">Light Level</span>
                                    </label>
                                    <input
                                        className="input input-bordered"
                                        type="text"
                                        value={light_level}
                                        onChange={(e) => setLightLevel(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* COLUMN 2 */}
                            <div className="flex flex-col">
                                <div className="form-control mt-4">
                                <label className="label">
                                    <span className="label-text">Customer Full Name</span>
                                </label>
                                <input
                                    className="input input-bordered"
                                    type="text"
                                    value={customer_fullname}
                                    onChange={(e) => setCustomerFullName(e.target.value)}
                                />
                                </div>

                                <div className="form-control mt-4">
                                <label className="label">
                                    <span className="label-text">Contact Number</span>
                                </label>
                                <input
                                    className="input input-bordered"
                                    type="text"
                                    value={contact_number}   
                                    onChange={(e) => setContactNumber(e.target.value)}
                                />
                                </div>

                                <div className="form-control mt-4">
                                <label className="label">
                                    <span className="label-text">Email Address</span>
                                </label>
                                <input
                                    className="input input-bordered"
                                    type="text"
                                    value={email}   
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                </div>
                            </div>

                            {/* COLUMN 3 */}
                            <div className="flex flex-col">
                                <div className="form-control mt-4">
                                    <label className="label">
                                        <span className="label-text">PPPoE Username</span>
                                    </label>
                                    <input
                                        className="input input-bordered"
                                        type="text"
                                        value={pppoe_un}
                                        onChange={(e) => setPppoe_un(e.target.value)}
                                    />
                                </div>

                                <div className="form-control mt-4">
                                <label className="label">
                                    <span className="label-text">PPPoE Password</span>
                                </label>
                                <input
                                    className="input input-bordered"
                                    type="text"
                                    value={pppoe_pw}
                                    onChange={(e) => setPppoe_pw(e.target.value)}
                                />
                                </div>

                                <div className="form-control mt-4">
                                <label className="label">
                                    <span className="label-text">Package</span>
                                </label>
                                <select
                                    className="select select-bordered"
                                    value={product_id}
                                    onChange={(e) => setProduct(e.target.value)}
                                    required>
                                    <option value="">Select Product</option>
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                                </div>

                                <div className="form-control mt-4">
                                <label className="label">
                                    <span className="label-text">2.4GHz SSID</span>
                                </label>
                                <input
                                    className="input input-bordered"
                                    type="text"
                                    value={ssid_24ghz}
                                    onChange={(e) => setTwoFourGhzSsid(e.target.value)}
                                />
                                </div>

                                <div className="form-control mt-4">
                                <label className="label">
                                    <span className="label-text">2.4GHz Password</span>
                                </label>
                                <input
                                    className="input input-bordered"
                                    type="text"
                                    value={password_24ghz}
                                    onChange={(e) => setTwoFourGhzPassword(e.target.value)}
                                />
                                </div>

                                <div className="form-control mt-4">
                                <label className="label">
                                    <span className="label-text">5GHz SSID</span>
                                </label>
                                <input
                                    className="input input-bordered"
                                    type="text"
                                    value={ssid_5ghz}
                                    onChange={(e) => setFiveGhzSsid(e.target.value)}
                                />
                                </div>

                                <div className="form-control mt-4">
                                <label className="label">
                                    <span className="label-text">5GHz Password</span>
                                </label>
                                <input
                                    className="input input-bordered"
                                    type="text"
                                    value={password_5ghz}
                                    onChange={(e) => setFiveGhzPassword(e.target.value)}
                                />
                                </div>
                            </div>

                            {/* COLUMN 4 */}
                            <div className="flex flex-col">
                                <div className="form-control mt-4">
                                <label className="label">
                                    <span className="label-text">Debit Order Status</span>
                                </label>
                                <select
                                    className="select select-bordered"
                                    value={debit_order_status}
                                    onChange={(e) => setDebitOrderStatus(e.target.value)}
                                    required>
                                    <option value="">Please Select</option>
                                    {debitOrderStatuses.map((stat, index) => (
                                        <option key={index} value={stat}>
                                            {stat}
                                        </option>
                                    ))}
                                </select>
                                </div>
                                
                                <div className="flex flex-col">
                                <div className="form-control mt-4">
                                <label className="label">
                                    <span className="label-text">Status</span>
                                </label>
                                <select
                                    className="select select-bordered"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    required>
                                    <option value="">Please Select</option>
                                    {statuses.map((s, index) => (
                                        <option key={index} value={s}>
                                            {s}
                                        </option>
                                    ))}
                                </select>
                                </div>
                                
                                <div className="form-control mt-4">
                                    <label className="label">
                                <span className="label-text">Activation Date</span>
                                </label>
                                <input
                                    className="input input-bordered"
                                    type="date"
                                    placeholder="Activation Date"
                                    required={status === 'Active'}
                                    value={activation_date || ''}   
                                    onChange={(e) => setActivationDate(e.target.value)}
                                    />
                                </div>

                                <div className="form-control mt-4">
                                <label className="label">
                                    <span className="label-text">Comments</span>
                                </label>
                                <textarea
                                    className="textarea textarea-accent w-full"
                                    rows={5}
                                    // cols={50}
                                    value={comments}   
                                    onChange={(e) => setComments(e.target.value)}
                                />
                                </div>

                                <div className="form-control mt-4">
                                <label className="cursor-pointer label">
                                    <span className="label-text">Managed by Fluent Living?</span> 
                                    <input 
                                        className="toggle toggle-accent" 
                                        type="checkbox"
                                        defaultValue='0'
                                        checked={fluent_living}
                                        onChange={(e) => setFluentLiving(e.target.checked)}
                                    />
                                    </label>
                                </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit button */}
                        <div className="form-control mt-8">
                        <button className="btn btn-accent">Update</button>
                        </div>

                    </form>
                    {/* Success message */}
                    {showSuccess && (
                    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-green-100 text-green-800 border border-green-300 rounded px-6 py-3 shadow-lg z-50">
                        ✅ Service updated successfully!
                    </div>
                    )}
                </div>
            </div>
        </div>
    )
}
 
export default EditService;