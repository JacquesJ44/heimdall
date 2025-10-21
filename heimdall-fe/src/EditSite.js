import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from './AxiosInstance'

const EditSite = () => {

    const { id } = useParams();

    const [name, setName] = useState('');
    const [street, setStreet] = useState('');
    const [suburb, setSuburb] = useState('');
    const [running_cost, setRunningCost] = useState('');

    const [showSuccess, setShowSuccess] = useState(false)
    
    let navigate = useNavigate()

    useEffect(() => {
        axios.get(`/heimdall/api/sites/editsite/${id}`)
          .then(response => {
            const data = response.data;
            // console.log(data);
            setName(data.name);
            setStreet(data.street);
            setSuburb(data.suburb);
            setRunningCost(data.running_cost);
          })
          .catch(error => {
            console.error('Error fetching data:', error);
          });
      }, [id]);

    const handleSubmit = async e => {
        e.preventDefault();
        try {
          const response = await axios.put(`/heimdall/api/sites/editsite/${id}`, { name, street, suburb, running_cost });
        //   console.log('RESPONSE:', response);
          setShowSuccess(true);
          // Wait 1.5 seconds before reloading
          setTimeout(() => {
          navigate('/sites');
            }, 1500);
        } catch (error) {
          alert(error.response.data.error);
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
                                // placeholder="Name"  
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
                                // placeholder="Street"  
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
                                // placeholder="Suburb"  
                                required
                                value = { suburb }
                                onChange={(e) => setSuburb(e.target.value)}
                                />
                        </div>

                        <div className="form-control mt-2">
                            <label className="label">
                                <span className="label-text">Running Cost</span>    
                            </label>
                            <input className="input input-bordered w-full max-w-xs"
                                type="text" 
                                // placeholder="Suburb"  
                                required
                                value = { running_cost }
                                onChange={(e) => setRunningCost(e.target.value)}
                                />
                        </div>

                        <div className="form-control mt-6">
                            <button className="btn btn-accent">Update</button>
                        </div>
                    </form>
                    {showSuccess && (
                                <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-green-100 text-green-800 border border-green-300 rounded px-6 py-3 shadow-lg z-50">
                                ✅ Site edited succesfully!
                                </div>
                            )}               
                </div>
            </div>  
        </div>        
    );
}
 
export default EditSite;