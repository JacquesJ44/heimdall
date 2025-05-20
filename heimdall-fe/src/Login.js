import React, { useState } from 'react';
import axios from './AxiosInstance';
import { useNavigate } from 'react-router-dom';

const Login = ({ setToken }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/login', { email, password });
      const token = response.data.access_token;
    //   console.log(response);
    //   console.log(token);
      localStorage.setItem('token', token);
      setToken(token);
      navigate('/dashboard');
    } catch (error) {
        // console.log(error)
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
                                <span className="label-text">Username</span>    
                            </label>
                            <input className="input input-bordered w-full max-w-xs"
                                type="email" 
                                placeholder="Username"  
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
                        <div className="form-control mt-6">
                            <button className="btn btn-accent">Login</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
      );
}


export default Login;