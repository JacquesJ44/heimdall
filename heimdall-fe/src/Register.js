import React, { useState } from 'react';
import axios from 'axios';
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
      const response = await axios.post('/api/register', { name, surname,email, password, confirmPassword });
    
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
                            <button className="btn btn-accent">Create User</button>
                        </div>
                    </form>
                    {showSuccess && (
                                <div style={{
                                padding: '10px',
                                marginTop: '10px',
                                backgroundColor: '#d4edda',
                                color: '#155724',
                                border: '1px solid #c3e6cb',
                                borderRadius: '5px'
                                }}>
                                ✅ User added succesfully!
                                </div>
                            )}
                </div>
            </div>
        </div>
      );
}


export default Register;