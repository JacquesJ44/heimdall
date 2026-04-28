import { Navigate } from 'react-router-dom';

const getRoleFromToken = (token) => {
  try {
    const payload = token.split('.')[1];
    if (!payload) {
      return null;
    }

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const decoded = JSON.parse(atob(padded));
    return decoded?.role ?? null;
  } catch {
    return null;
  }
};

const PrivateRoute = ({ children, allowedRoles = null }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const role = getRoleFromToken(token);
    if (!role || !allowedRoles.includes(role)) {
      return <Navigate to="/dashboard" />;
    }
  }

  return children;
};

export default PrivateRoute;