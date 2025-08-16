import axios from './AxiosInstance'
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ token, setToken, message, setMessage }) => {
  
    const navigate = useNavigate();
    const [role, setRole] = useState(null);

    useEffect(() => {
      const storedToken = localStorage.getItem('token');
      // console.log('Navbar useEffect — token:', storedToken);

      if (!storedToken) {
        setMessage("No token found")
        return;
      }
      axios.get('/heimdall/api/navbar', {
        headers: {
          Authorization: `Bearer ${storedToken}`
        }
      }).then(res => {
        // console.log('Navbar response:', res.data);
        setMessage(res.data.email);
        setRole(res.data.role);
      }).catch(err => {
        console.error('Navbar error:', err.response?.data || err.message);
        // Optional: auto-logout if token is invalid
        if (err.response?.data?.msg === 'Signature verification failed') {
          localStorage.removeItem('token');
          setToken(null);
          navigate('/login');
        }
        setMessage("Access denied");
      });
    }, [token, setMessage, navigate, setToken]);

    const getLinksByRole = (role) => {
      switch (role) {
        case "client":
          return ["Dashboard", "Summary"];
        case "admin":
          return ["Dashboard", "Services", "Products", "Sites"];
        case "superadmin":
          return ["Dashboard", "Services", "Products", "Sites", "Register New User", "Summary"];
        default:
          return [];
      }
    };

    const handleLogout = async () => {
        try {
          // Optionally notify the backend
          await axios.post('/heimdall/api/logout', {}, { withCredentials: true });
    
          // Clear local token
          localStorage.removeItem('token');
          setToken(null);
    
          // Redirect to login
          navigate('/login');
        } catch (err) {
          console.error('Logout failed:', err);
          alert('Logout failed.');
        }
      };

  return (
    <div className="navbar sticky top-0 shadow-2xl bg-base-200 roundedborders">
      <div className="flex-1">
        <img src="/heimdall/aesirblue.png" className="App-logo" alt="logo" />
      </div>

      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          {token ? (
            <>
              {getLinksByRole(role).includes("Dashboard") && (
                <li className="mx-2"><Link to="/dashboard">Dashboard</Link></li>
              )}
              {getLinksByRole(role).includes("Services") && (
                <li className="mx-2"><Link to="/services">Services</Link></li>
              )}
              {getLinksByRole(role).includes("Products") && (
                <li className="mx-2"><Link to="/products">Products</Link></li>
              )}
              {getLinksByRole(role).includes("Sites") && (
                <li className="mx-2"><Link to="/sites">Sites</Link></li>
              )}
              {getLinksByRole(role).includes("Register New User") && (
                <li className="mx-2"><Link to="/register">Register New User</Link></li>
              )}
              {getLinksByRole(role).includes("Summary") && (
                <li className="mx-2"><Link to="/summary">Summary</Link></li>
              )}
              <li className="mx-2">
                <button onClick={handleLogout} className="btn btn-outline btn-sm">Logout</button>
                {message}
              </li>
            </>
          ) : (
            <li className="mx-2"><Link to="/login">Login</Link></li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Navbar;