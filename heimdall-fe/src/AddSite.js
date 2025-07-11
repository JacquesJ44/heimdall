import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from './AxiosInstance'

const AddSite = () => {

    const [name, setName] = useState('');
    const [street, setStreet] = useState('');
    const [suburb, setSuburb] = useState('');

    const [showSuccess, setShowSuccess] = useState(false)
    
    let navigate = useNavigate()

    const handleSubmit = async e => {
        e.preventDefault();
        try {
          const response = await axios.post('/api/sites/addsite', { name, street, suburb });
        //   console.log(response);
          setShowSuccess(true);
          // Wait 1.5 seconds before reloading
          setTimeout(() => {
          navigate('/sites');
            }, 1500);
        } catch (error) {
            if (error.response && error.response.data && error.response.data.msg) {
                alert(error.response.data.msg);  // "Site already exists"
            } else {
                alert("An unexpected error occurred.");
            }
        }
      };

    return (          
        <div className="h-screen flex items-center justify-center">
            <div className="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-200">
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-control mt-2">
                            <label className="label">
                                <span className="label-text">Name</span>    
                            </label>
                            <input className="input input-bordered w-full max-w-xs"
                                type="text" 
                                placeholder="Name"  
                                required
                                value = { name }
                                onChange={(e) => setName(e.target.value)}
                                />
                        </div>

                        <div className="form-control mt-2">
                            <label className="label">
                                <span className="label-text">Street</span>    
                            </label>
                            <input className="input input-bordered w-full max-w-xs"
                                type="text" 
                                placeholder="Street"  
                                required
                                value = { street }
                                onChange={(e) => setStreet(e.target.value)}
                                />
                        </div>

                        <div className="form-control mt-2">
                            <label className="label">
                                <span className="label-text">Suburb</span>    
                            </label>
                            <input className="input input-bordered w-full max-w-xs"
                                type="text" 
                                placeholder="Suburb"  
                                required
                                value = { suburb }
                                onChange={(e) => setSuburb(e.target.value)}
                                />
                        </div>

                        <div className="form-control mt-6">
                            <button className="btn btn-accent">Add Site</button>
                        </div>
                    </form>
                    {showSuccess && (
                                <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-green-100 text-green-800 border border-green-300 rounded px-6 py-3 shadow-lg z-50">
                                ✅ Site added succesfully!
                                </div>
                            )}               
                </div>
            </div>  
        </div>        
    );
}
 
export default AddSite;