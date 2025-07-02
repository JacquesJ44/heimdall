import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from './AxiosInstance'


const AddProduct = () => {

    const [name, setName] = useState('');
    const [selling_price, setSelling_price] = useState('');
    const [cost_price, setCost_price] = useState('');

    const [showSuccess, setShowSuccess] = useState(false)
    
    let navigate = useNavigate()

    const handleSubmit = async e => {
        e.preventDefault();
        try {
          const response = await axios.post('/heimdall/api/products/addproduct', { name, cost_price, selling_price });
        //   console.log(response);
          setShowSuccess(true);
          // Wait 1.5 seconds before reloading
          setTimeout(() => {
          navigate('/products');
            }, 1500);
        } catch (error) {
            if (error.response && error.response.data && error.response.data.msg) {
                alert(error.response.data.msg); // nicely show server error message
              } else {
                alert('An unexpected error occurred.'); // fallback for unknown errors
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
                                <span className="label-text">Selling Price</span>    
                            </label>
                            <input className="input input-bordered w-full max-w-xs"
                                type="text" 
                                placeholder="Selling Price"  
                                required
                                value = { selling_price }
                                onChange={(e) => setSelling_price(e.target.value)}
                                />
                        </div>

                        <div className="form-control mt-2">
                            <label className="label">
                                <span className="label-text">Cost Price</span>    
                            </label>
                            <input className="input input-bordered w-full max-w-xs"
                                type="text" 
                                placeholder="Cost Price"  
                                required
                                value = { cost_price }
                                onChange={(e) => setCost_price(e.target.value)}
                                />
                        </div>

                        <div className="form-control mt-6">
                            <button className="btn btn-accent">Add Product</button>
                        </div>
                    </form>
                    {showSuccess && (
                                <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-green-100 text-green-800 border border-green-300 rounded px-6 py-3 shadow-lg z-50">
                                ✅ Product added succesfully!
                                </div>
                            )}               
                </div>
            </div>  
        </div>        
    );
}
 
export default AddProduct;