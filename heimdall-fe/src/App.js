import { useState } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';

import './App.css';
import PrivateRoute from './PrivateRoute';
import Navbar from './Navbar'
import Login from './Login'
import Dashboard from './Dashboard';
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
    // <div data-theme="cupcake">
    <BrowserRouter>
      {/* <div className="App"> */}
        <Navbar token={token} setToken={setToken} message={message} setMessage={setMessage}/>
        {/* <div className="App-header"> */}
          <Routes>
            <Route path='/' element={ token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
            <Route path="/login" element={<Login setToken={setToken} />} />
            {/* <Route path="/logout" element={<Logout />} /> */}
            <Route path="/dashboard" 
                    element={<PrivateRoute>
                              <Dashboard />
                            </PrivateRoute>}/>
            <Route path="/register" 
                    element={<PrivateRoute>
                              <Register />
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
        {/* </div> */}
      {/* </div> */}
    </BrowserRouter>
    // </div>
  );
}

export default App;
