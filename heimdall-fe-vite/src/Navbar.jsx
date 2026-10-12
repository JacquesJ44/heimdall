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
      axios.get('/api/navbar', {
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
          return ["Dashboard", "Services", "Products", "Sites", "User Management", "Summary", "Logs"];
        default:
          return [];
      }
    };

    const handleLogout = async () => {
        try {
          // Optionally notify the backend
          await axios.post('/api/logout', {}, { withCredentials: true });
    
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

    const allLinks = [
      ["Dashboard", "/dashboard"],
      ["Services", "/services"],
      ["Products", "/products"],
      ["Sites", "/sites"],
      ["User Management", "/register"],
      ["Summary", "/summary"],
      ["Logs", "/logs"],
    ];
    const links = allLinks.filter(([name]) => getLinksByRole(role).includes(name));

  return (
    <div className="navbar sticky top-0 z-50 shadow-2xl bg-base-200 roundedborders px-2 sm:px-4">
      <div className="flex-1 min-w-0 gap-2">
        {token && links.length > 0 && (
          <div className="dropdown lg:hidden">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-square" aria-label="Open menu">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
            <ul tabIndex={0} className="menu dropdown-content bg-base-100 rounded-box z-50 mt-3 w-56 p-2 shadow">
              {links.map(([name, path]) => (
                <li key={path}><Link to={path} onClick={() => document.activeElement?.blur()}>{name}</Link></li>
              ))}
              <li className="mt-2 border-t border-base-300 pt-2">
                <button onClick={handleLogout} className="btn btn-outline btn-sm">Logout</button>
              </li>
              {message && <li className="px-4 py-1 text-xs opacity-70 break-all">{message}</li>}
            </ul>
          </div>
        )}
        <img src="/aesirblue.png" className="App-logo" alt="logo" />
      </div>

      <div className="flex-none">
        {token ? (
          <ul className="menu menu-horizontal px-1 items-center hidden lg:flex">
            {links.map(([name, path]) => (
              <li key={path} className="mx-2"><Link to={path}>{name}</Link></li>
            ))}
            <li className="mx-2">
              <button onClick={handleLogout} className="btn btn-outline btn-sm">Logout</button>
              {message}
            </li>
          </ul>
        ) : (
          <ul className="menu menu-horizontal px-1">
            <li className="mx-2"><Link to="/login">Login</Link></li>
          </ul>
        )}
      </div>
    </div>
  );
};

export default Navbar;
