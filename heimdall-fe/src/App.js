import { useState } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';

import './App.css';
import PrivateRoute from './PrivateRoute';
import Navbar from './Navbar'
import Login from './Login'
import Dashboard from './Dashboard';
import DashboardSite from './DashboardSite';
import Register from './Register'
import Sites from './Sites';
import AddSite from './AddSite';
import EditSite from './EditSite';
import Products from './Products';
import AddProduct from './AddProduct';
import EditProduct from './EditProduct';
import Services from './Services';
import AddService from './AddService';
import EditService from './EditService';

function App() {

  const [token, setToken] = useState(localStorage.getItem('token'));
  const [message, setMessage] = useState('');

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-base-200">
        <Navbar token={token} setToken={setToken} message={message} setMessage={setMessage}/>

        <main className="flex-grow flex items-center justify-center">
          <Routes> 
            <Route path='/' element={ token ? <Navigate to="/api/dashboard" /> : <Navigate to="/api/login" />} />
            <Route path="/api/login" element={<Login setToken={setToken} />} />
            {/* <Route path="/logout" element={<Logout />} /> */}
            <Route path="/api/dashboard" 
                    element={<PrivateRoute>
                              <Dashboard />
                            </PrivateRoute>}/>
            <Route path="/api/dashboard/site/:id"
                    element={<PrivateRoute>
                              <DashboardSite />
                            </PrivateRoute>} />
            <Route path="/api/register" 
                    element={<PrivateRoute>
                              <Register />
                            </PrivateRoute>}/>
            <Route path="/api/sites" 
                    element={<PrivateRoute>
                              <Sites />
                            </PrivateRoute>}/>
            <Route path="/api/sites/addsite" 
                    element={<PrivateRoute>
                              <AddSite />
                            </PrivateRoute>}/>
            <Route path="/api/sites/editsite/:id" 
                    element={<PrivateRoute>
                              <EditSite />
                            </PrivateRoute>}/>            
            <Route path="/api/products" 
                    element={<PrivateRoute>
                              <Products />
                            </PrivateRoute>}/>
            <Route path="/api/products/addproduct" 
                    element={<PrivateRoute>
                              <AddProduct />
                            </PrivateRoute>}/>
            <Route path="/api/products/editproduct/:id" 
                    element={<PrivateRoute>
                              <EditProduct />
                            </PrivateRoute>}/> 
            <Route path="/api/services" 
                    element={<PrivateRoute>
                              <Services />
                            </PrivateRoute>}/> 
            <Route path="/api/services/addservice" 
                    element={<PrivateRoute>
                              <AddService />
                            </PrivateRoute>}/> 
            <Route path="/api/services/editservice/:id" 
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
