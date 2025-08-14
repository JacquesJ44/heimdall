import React, { useState } from 'react';
import axios from './AxiosInstance'
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const response = await axios.post('/heimdall/api/register', { name, surname,email, password, confirmPassword });
    
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
                                <span className="label-text">Surname</span>    
                            </label>
                            <input className="input input-bordered w-full max-w-xs"
                                type="text" 
                                placeholder="Surname"  
                                required
                                value = { surname }
                                onChange={(e) => setSurname(e.target.value)}
                                />
                        </div>

                        <div className="form-control mt-2">
                            <label className="label">
                                <span className="label-text">Email</span>    
                            </label>
                            <input className="input input-bordered w-full max-w-xs"
                                type="email" 
                                placeholder="Email"  
                                required
                                value = { email }
                                onChange={(e) => setEmail(e.target.value)}
                                />
                        </div>

                        <div className="form-control mt-2">
                            <label className="label">
                                <span className="label-text">Password</span>    
                            </label>
                            <input className="input input-bordered w-full max-w-xs"
                                type="password" 
                                placeholder="Password"
                                required
                                value = { password }
                                onChange={(e) => setPassword(e.target.value)} 
                            />
                        </div>

                        <div className="form-control mt-2">
                            <label className="label">
                                <span className="label-text">Confirm Password</span>    
                            </label>
                            <input className="input input-bordered w-full max-w-xs"
                                type="password" 
                                placeholder="Password"
                                required
                                value = { confirmPassword }
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                            />
                        </div>

                        <div className="form-control mt-6">
                            <div className="flex justify-between">
                                <button className="btn btn-accent">Create User</button>
                                <button type="button" className="btn btn-warning" onClick={() => navigate("/register/users")}>Manage Users</button>
                            </div>
                        </div>

                    </form>
                    {showSuccess && (
                                <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-green-100 text-green-800 border border-green-300 rounded px-6 py-3 shadow-lg z-50">
                                ✅ User registered!
                                </div>
                            )}
                </div>
            </div>
        </div>
      );
}


export default Register;