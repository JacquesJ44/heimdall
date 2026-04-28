import { useState } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';

import './App.css';
import PrivateRoute from './PrivateRoute.jsx';
import Navbar from './Navbar.jsx'
import Login from './Login.jsx'
import ForgotPassword from './ForgotPassword.jsx'
import ResetPassword from './ResetPassword.jsx'
import Dashboard from './Dashboard.jsx';
import DashboardSite from './DashboardSite.jsx';
import Register from './Register.jsx'
import UserManagement from './UserManagement.jsx'
import AssignSites from './AssignSites.jsx';
import Sites from './Sites.jsx';
import AddSite from './AddSite.jsx';
import EditSite from './EditSite.jsx';
import BulkEmail from './BulkEmail.jsx';
import Products from './Products.jsx';
import AddProduct from './AddProduct.jsx';
import EditProduct from './EditProduct.jsx';
import Services from './Services.jsx';
import AddService from './AddService.jsx';
import EditService from './EditService.jsx';
import Summary from './Summary.jsx';
import LogsPage from './Logs.jsx';  

function App() {

  const [token, setToken] = useState(localStorage.getItem('token'));
  const [message, setMessage] = useState('');

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-base-200">
        <Navbar token={token} setToken={setToken} message={message} setMessage={setMessage}/>

        <main className="grow flex items-center justify-center">
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
                  element={<PrivateRoute allowedRoles={["superadmin"]}>
                              <Register />
                            </PrivateRoute>}/>
            <Route path="/register/users" 
                  element={<PrivateRoute allowedRoles={["superadmin"]}>
                              <UserManagement />
                            </PrivateRoute>}/>
            <Route path="/register/users/:id/sites" 
                  element={<PrivateRoute allowedRoles={["superadmin"]}>
                              <AssignSites />
                            </PrivateRoute>}/>
            <Route path="/summary"
                    element={<PrivateRoute>
                              <Summary />
                            </PrivateRoute>}/>
            <Route path="/sites" 
                  element={<PrivateRoute allowedRoles={["admin", "superadmin"]}>
                              <Sites />
                            </PrivateRoute>}/>
            <Route path="/sites/addsite" 
                  element={<PrivateRoute allowedRoles={["admin", "superadmin"]}>
                              <AddSite />
                            </PrivateRoute>}/>
            <Route path="/sites/editsite/:id" 
                  element={<PrivateRoute allowedRoles={["admin", "superadmin"]}>
                              <EditSite />
                            </PrivateRoute>}/>            
            <Route path="/sites/bulkemail" 
                  element={<PrivateRoute allowedRoles={["admin", "superadmin"]}>
                              <BulkEmail />
                            </PrivateRoute>}/>            
            <Route path="/products" 
                  element={<PrivateRoute allowedRoles={["admin", "superadmin"]}>
                              <Products />
                            </PrivateRoute>}/>
            <Route path="/products/addproduct" 
                  element={<PrivateRoute allowedRoles={["admin", "superadmin"]}>
                              <AddProduct />
                            </PrivateRoute>}/>
            <Route path="/products/editproduct/:id" 
                  element={<PrivateRoute allowedRoles={["admin", "superadmin"]}>
                              <EditProduct />
                            </PrivateRoute>}/> 
            <Route path="/services" 
                  element={<PrivateRoute allowedRoles={["admin", "superadmin"]}>
                              <Services />
                            </PrivateRoute>}/> 
            <Route path="/services/addservice" 
                  element={<PrivateRoute allowedRoles={["admin", "superadmin"]}>
                              <AddService />
                            </PrivateRoute>}/> 
            <Route path="/services/editservice/:id" 
                  element={<PrivateRoute allowedRoles={["admin", "superadmin"]}>
                              <EditService />
                            </PrivateRoute>}/> 
            <Route path="/logs" 
                  element={<PrivateRoute allowedRoles={["superadmin"]}>
                              <LogsPage />
                            </PrivateRoute>}/> 
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
