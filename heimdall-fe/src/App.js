import { useState } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';

import './App.css';
import PrivateRoute from './PrivateRoute';
import Navbar from './Navbar'
import Login from './Login'
import ForgotPassword from './ForgotPassword'
import ResetPassword from './ResetPassword'
import Dashboard from './Dashboard';
import DashboardSite from './DashboardSite';
import Register from './Register'
import UserManagement from './UserManagement'
import AssignSites from './AssignSites';
import Sites from './Sites';
import AddSite from './AddSite';
import EditSite from './EditSite';
import Products from './Products';
import AddProduct from './AddProduct';
import EditProduct from './EditProduct';
import Services from './Services';
import AddService from './AddService';
import EditService from './EditService';
import { User } from 'lucide-react';

function App() {

  const [token, setToken] = useState(localStorage.getItem('token'));
  const [message, setMessage] = useState('');

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-base-200">
        <Navbar token={token} setToken={setToken} message={message} setMessage={setMessage}/>

        <main className="flex-grow flex items-center justify-center">
          <Routes> 
            <Route path='/' element={ token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
            <Route path="/login" element={<Login setToken={setToken} />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            
            <Route path="/dashboard" 
                    element={<PrivateRoute>
                              <Dashboard />
                            </PrivateRoute>}/>
            <Route path="/dashboard/site/:id"
                    element={<PrivateRoute>
                              <DashboardSite />
                            </PrivateRoute>} />
            <Route path="/register" 
                    element={<PrivateRoute>
                              <Register />
                            </PrivateRoute>}/>
            <Route path="/register/users" 
                    element={<PrivateRoute>
                              <UserManagement />
                            </PrivateRoute>}/>
            <Route path="/register/users/:id/sites" 
                    element={<PrivateRoute>
                              <AssignSites />
                            </PrivateRoute>}/>
            <Route path="/sites" 
                    element={<PrivateRoute>
                              <Sites />
                            </PrivateRoute>}/>
            <Route path="/sites/addsite" 
                    element={<PrivateRoute>
                              <AddSite />
                            </PrivateRoute>}/>
            <Route path="/sites/editsite/:id" 
                    element={<PrivateRoute>
                              <EditSite />
                            </PrivateRoute>}/>            
            <Route path="/products" 
                    element={<PrivateRoute>
                              <Products />
                            </PrivateRoute>}/>
            <Route path="/products/addproduct" 
                    element={<PrivateRoute>
                              <AddProduct />
                            </PrivateRoute>}/>
            <Route path="/products/editproduct/:id" 
                    element={<PrivateRoute>
                              <EditProduct />
                            </PrivateRoute>}/> 
            <Route path="/services" 
                    element={<PrivateRoute>
                              <Services />
                            </PrivateRoute>}/> 
            <Route path="/services/addservice" 
                    element={<PrivateRoute>
                              <AddService />
                            </PrivateRoute>}/> 
            <Route path="/services/editservice/:id" 
                    element={<PrivateRoute>
                              <EditService />
                            </PrivateRoute>}/> 
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
