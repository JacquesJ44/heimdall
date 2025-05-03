import axios from './AxiosInstance'
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from './logo.png';

const Navbar = ({ token, setToken, message, setMessage }) => {
  
    const navigate = useNavigate();

    useEffect(() => {
      const storedToken = localStorage.getItem('token');
      // console.log('Navbar useEffect — token:', storedToken);

      if (!storedToken) {
        setMessage("No token found")
        return;
      }
      axios.get('/navbar', {
        headers: {
          Authorization: `Bearer ${storedToken}`
        }
      }).then(res => {
        setMessage(res.data.logged_in_as);
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

    const handleLogout = async () => {
        try {
          // Optionally notify the backend
          await axios.post('/logout', {}, { withCredentials: true });
    
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
        <img src={logo} className="App-logo" alt="logo" />
      </div>

      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          {token ? (
            <>

              <li className="mx-2"><Link to="/dashboard">Dashboard</Link></li>
              <li className="mx-2"><Link to="/services">Services</Link></li>
              <li className="mx-2"><Link to="/products">Products</Link></li>
              <li className="mx-2"><Link to="/sites">Sites</Link></li>
              <li className="mx-2"><Link to="/register">Register New User</Link></li>
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