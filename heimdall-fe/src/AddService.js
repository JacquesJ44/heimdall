import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AddService = () => {

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

    let navigate = useNavigate()

    useEffect(() => {
        
        // Get all sites
        axios.get('/sites')
        .then((res) => {
            setSites(res.data);
            // console.log(res.data);
        })
        .catch(error => console.log(error));

        // Get all products
        axios.get('/products')
        .then((res) => {
            setProducts(res.data);
            // console.log(res.data);
        })
        .catch(error => console.log(error));
        
    }, []);

    const handleSubmit = async e => {
        e.preventDefault();
        try {
          const response = await axios.post('/services/addservice', { site_id, unit_number, onu_make, onu_model, onu_serial, onu_number, gpon_serial, status: status ? status : 0, light_level, pppoe_un, pppoe_pw, ssid_24ghz, password_24ghz, ssid_5ghz, password_5ghz, customer_fullname, contact_number, email, debit_order_status, fluent_living: fluent_living ? fluent_living : 0, product_id, activation_date: status ? activation_date: null, comments });
        //   console.log(response.data);
          setShowSuccess(true);
          // Wait 1.5 seconds before reloading
          setTimeout(() => {
          navigate('/services');
            }, 1500);
        } catch (error) {
            console.error('Error:', error);
            if (error.response && error.response.data && error.response.data.msg) {
                alert(error.response.data.msg);
            } else {
                alert('An unexpected error occurred');
            };
         }
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
                                    placeholder="Unit Number"
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
                                    placeholder="ONU Make"
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
                                        placeholder="ONU Model"
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
                                        placeholder="Serial Number"
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
                                        placeholder="GPON Serial Number"
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
                                        placeholder="ONU Number"
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
                                        placeholder="Light Level"
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
                                    placeholder="Customer Full Name"
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
                                    placeholder="Contact Number"
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
                                    placeholder="Emai Address"
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
                                        placeholder="PPPoE Username"
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
                                    placeholder="PPPoE Password"
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
                                    placeholder="2.4GHz SSID"
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
                                    placeholder="2.4GHz Password"
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
                                    placeholder="5GHz SSID"
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
                                    placeholder="5GHz Password"
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
                                    {debitOrderStatuses.map((status, index) => (
                                        <option key={index} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                                </div>
                                
                                <div className="form-control mt-4">
                                    <label className="cursor-pointer label">
                                    <span className="label-text">Service Active?</span> 
                                    <input 
                                        className="toggle toggle-accent" 
                                        type="checkbox"
                                        checked={status}
                                        onChange={(e) => setStatus(e.target.checked)}
                                    />
                                    </label>
                                </div>
                                
                                {status && (
                                    
                                    <div className="form-control mt-4">
                                <label className="label">
                                    <span className="label-text">Activation Date</span>
                                </label>
                                <input
                                    className="input input-bordered"
                                    type="date"
                                    placeholder="Activation Date"
                                    required={status}
                                    value={activation_date || ''}   
                                    onChange={(e) => setActivationDate(e.target.value)}
                                    />
                                </div>
                                )}

                                <div className="form-control mt-4">
                                <label className="label">
                                    <span className="label-text">Comments</span>
                                </label>
                                <textarea
                                    className="textarea textarea-accent w-full"
                                    placeholder="Comments"
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
                                {/* <label className="label">
                                    <span className="label-text">Managed by Fluent Living?</span>
                                </label>
                                <input
                                    className="input input-bordered"
                                    type="text"
                                    placeholder="Fluent Living"
                                    value={fluentLiving}   
                                    onChange={(e) => setFluentLiving(e.target.value)}
                                /> */}
                            </div>
                        </div>

                        {/* Submit button */}
                        <div className="form-control mt-8">
                        <button className="btn btn-accent">Add Service</button>
                        </div>

                    </form>
                    {/* Success message */}
                    {showSuccess && (
                    <div className="mt-4 p-4 bg-green-100 text-green-800 border border-green-300 rounded">
                        ✅ Service added successfully!
                    </div>
                    )}
                </div>
            </div>
        </div>

    
     );
};
 
export default AddService;